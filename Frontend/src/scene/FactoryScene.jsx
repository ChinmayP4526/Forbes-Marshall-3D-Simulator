import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import FactoryFloor from "./FactoryFloor";
import Equipment from "./Equipment";
import ViewController from "./ViewController";
import { BUILDING, CORRIDOR } from "./buildingConfig";
import { isValidPlacement } from "./placement";

export default function FactoryScene({
  objects,
  selectedId,
  onSelect,
  onMove,
  onInvalidMove,
  viewMode,
}) {
  const controlsRef = useRef(null);
  function onMoveEquipment(id, x, z) {
    const item = objects.find((object) => object.id === id);
    if (!item) return;

    const candidate = { ...item, x, z };

    const result = isValidPlacement(candidate, objects, BUILDING, CORRIDOR);

    if (result.valid) {
      onMove(id, x, z);
    } else {
      onInvalidMove?.(result.reason);
    }
  }
  return (
    <Canvas
      shadows
      camera={{ position: [100, 80, 110], fov: 48, near: 0.1, far: 500 }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={["#e9f0f2"]} />
      <ambientLight intensity={1.7} />
      <directionalLight position={[30, 50, 20]} intensity={2.2} castShadow />

      <FactoryFloor />

      <Grid
        position={[BUILDING.length / 2, -0.19, BUILDING.width / 2]}
        args={[BUILDING.length, BUILDING.width]}
        cellSize={1}
        cellThickness={0.3}
        sectionSize={5}
        sectionThickness={0.7}
        sectionColor="#b6c9c9"
        cellColor="#d7e1e1"
        fadeDistance={150}
        infiniteGrid={false}
      />

      {objects.map((item) => (
        <Equipment
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          controlsRef={controlsRef}
          onSelect={onSelect}
          onMove={onMoveEquipment}
          onDragEnd={() => {}}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[50, 0, 30]}
        minDistance={8}
        maxDistance={220}
        maxPolarAngle={Math.PI / 2 - 0.01}
        enableDamping
        enabled
      />

      <ViewController viewMode={viewMode} controlsRef={controlsRef} />
    </Canvas>
  );
}
