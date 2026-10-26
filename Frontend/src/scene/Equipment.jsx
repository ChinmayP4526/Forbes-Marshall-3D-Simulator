import { Suspense, useEffect, useMemo, useRef } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";
import { EQUIPMENT_TYPES, getFootprint } from "./placement";

function Model({ url, modelSize }) {
  const gltf = useLoader(GLTFLoader, url);

  const model = useMemo(() => {
    const clone = gltf.scene.clone(true);

    // Measure the original model.
    let box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());

    // Fit inside the desired dimensions without stretching it.
    const scale = Math.min(
      modelSize.width / Math.max(size.x, 0.001),
      modelSize.height / Math.max(size.y, 0.001),
      modelSize.depth / Math.max(size.z, 0.001),
    );

    clone.scale.multiplyScalar(scale);

    // Measure again after scaling.
    box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());

    // Center X/Z and put the bottom on Y = 0.
    clone.position.x -= center.x;
    clone.position.z -= center.z;
    clone.position.y -= box.min.y;

    return clone;
  }, [gltf, modelSize.width, modelSize.height, modelSize.depth]);

  return <primitive object={model} />;
}

export default function Equipment({
  item,
  selected,
  onSelect,
  onMove,
  onDragEnd,
  controlsRef,
}) {
  const drag = useRef({
    active: false,
    pointerId: null,
    offsetX: 0,
    offsetZ: 0,
    previousControlsEnabled: true,
  });

  useEffect(() => {
    const restoreControls = () => {
      if (!drag.current.active) return;

      const controls = controlsRef?.current;

      if (controls) {
        controls.enabled = drag.current.previousControlsEnabled;
      }

      drag.current.active = false;
      drag.current.pointerId = null;
    };

    window.addEventListener("pointerup", restoreControls);
    window.addEventListener("pointercancel", restoreControls);
    window.addEventListener("blur", restoreControls);

    return () => {
      window.removeEventListener("pointerup", restoreControls);
      window.removeEventListener("pointercancel", restoreControls);
      window.removeEventListener("blur", restoreControls);

      if (drag.current.active && controlsRef?.current) {
        controlsRef.current.enabled = drag.current.previousControlsEnabled;
      }
    };
  }, [controlsRef]);

  const { camera, gl, raycaster } = useThree();
  const type = EQUIPMENT_TYPES[item.type];
  const footprint = getFootprint(item);

  const dragPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
    [],
  );

  const intersection = useMemo(() => new THREE.Vector3(), []);

  const modelSize = type.modelSize;

  function getFloorPoint(event) {
    const rect = gl.domElement.getBoundingClientRect();

    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    raycaster.setFromCamera(ndc, camera);

    const point = raycaster.ray.intersectPlane(dragPlane, intersection);

    return point ? point.clone() : null;
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;

    event.stopPropagation();

    const point = getFloorPoint(event);
    if (!point) return;

    onSelect(item.id);

    const controls = controlsRef?.current;

    drag.current = {
      active: true,
      pointerId: event.pointerId,
      offsetX: item.x - point.x,
      offsetZ: item.z - point.z,
      previousControlsEnabled: controls ? controls.enabled : true,
    };

    if (controls) controls.enabled = false;

    gl.domElement.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!drag.current.active) return;
    if (event.pointerId !== drag.current.pointerId) return;

    event.stopPropagation();

    const point = getFloorPoint(event);
    if (!point) return;

    const snap = (value, step = 0.5) => Math.round(value / step) * step;

    onMove(
      item.id,
      snap(point.x + drag.current.offsetX),
      snap(point.z + drag.current.offsetZ),
    );
  }

  function finishDrag(event) {
    if (!drag.current.active) return;

    if (
      event?.pointerId != null &&
      event.pointerId !== drag.current.pointerId
    ) {
      return;
    }

    const controls = controlsRef?.current;

    if (controls) {
      controls.enabled = drag.current.previousControlsEnabled;
    }

    const pointerId = drag.current.pointerId;

    drag.current.active = false;
    drag.current.pointerId = null;

    if (pointerId != null && gl.domElement.hasPointerCapture?.(pointerId)) {
      gl.domElement.releasePointerCapture(pointerId);
    }

    onDragEnd?.(item.id);
  }

  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, THREE.MathUtils.degToRad(item.rotation || 0), 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      {/* Selection and drag hit area */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[footprint.width, 0.2, footprint.depth]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Floor footprint outline */}
      <mesh position={[0, 0.025, 0]}>
        <boxGeometry
          args={[footprint.width + 0.2, 0.04, footprint.depth + 0.2]}
        />
        <meshBasicMaterial
          color={selected ? "#2baba1" : "#e4bd35"}
          wireframe
          depthTest={false}
        />
      </mesh>

      <Suspense fallback={null}>
        {type.modelPath ? (
          <Model url={type.modelPath} modelSize={type.modelSize} />
        ) : (
          <mesh position={[0, modelSize.height / 2, 0]} castShadow>
            <boxGeometry
              args={[modelSize.width, modelSize.height, modelSize.depth]}
            />
            <meshStandardMaterial color={type.color} />
          </mesh>
        )}
      </Suspense>

      {selected && (
        <Html
          position={[0, modelSize.height + 0.4, 0]}
          center
          distanceFactor={20}
          style={{ pointerEvents: "none" }}
        >
          <div className="object-label">{type.label}</div>
        </Html>
      )}
    </group>
  );
}
