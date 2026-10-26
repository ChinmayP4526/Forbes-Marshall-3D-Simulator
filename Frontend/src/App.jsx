import { useEffect, useMemo, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const BUILDING = {
  length: 100,
  width: 60,
  wallHeight: 8,
};

const BAY_SIZE = 10;

const EQUIPMENT_TYPES = {
  vmc: {
    label: "VMC Machine",
    short: "VMC",
    width: 4,
    depth: 4,
    height: 3,
    color: "#8b9aa9",
  },
  trolley: {
    label: "Material Trolley",
    short: "Trolley",
    width: 2,
    depth: 1.5,
    height: 1.4,
    color: "#d49a42",
  },
  cooler: {
    label: "Cooler",
    short: "Cooler",
    width: 1.5,
    depth: 1.5,
    height: 2,
    color: "#2baba1",
  },
  machine: {
    label: "Other Machine",
    short: "Machine",
    width: 3,
    depth: 3,
    height: 2.5,
    color: "#737d8c",
  },
};

function getFootprint(item) {
  const type = EQUIPMENT_TYPES[item.type];
  const rotated = item.rotation % 180 !== 0;

  return {
    width: rotated ? type.depth : type.width,
    depth: rotated ? type.width : type.depth,
  };
}

function isValidPosition(candidate, objects) {
  const footprint = getFootprint(candidate);
  const halfW = footprint.width / 2;
  const halfD = footprint.depth / 2;

  // Keep the entire equipment footprint inside the building.
  if (
    candidate.x - halfW < 0 ||
    candidate.x + halfW > BUILDING.length ||
    candidate.z - halfD < 0 ||
    candidate.z + halfD > BUILDING.width
  ) {
    return false;
  }

  // Prevent overlap with every other equipment footprint.
  return !objects.some((other) => {
    if (other.id === candidate.id) return false;

    const otherFootprint = getFootprint(other);

    return (
      Math.abs(candidate.x - other.x) <
        (footprint.width + otherFootprint.width) / 2 &&
      Math.abs(candidate.z - other.z) <
        (footprint.depth + otherFootprint.depth) / 2
    );
  });
}

function makeObject(type, id, x, z) {
  return {
    id,
    type,
    x,
    z,
    rotation: 0,
  };
}

function findFreePosition(type, objects) {
  const item = makeObject(type, "candidate", 0, 0);
  const footprint = getFootprint(item);

  // Search the building bay by bay for a valid location.
  for (let z = BAY_SIZE / 2; z <= BUILDING.width; z += BAY_SIZE) {
    for (let x = BAY_SIZE / 2; x <= BUILDING.length; x += BAY_SIZE) {
      const candidate = { ...item, x, z };

      if (isValidPosition(candidate, objects)) {
        return { x, z };
      }
    }
  }

  // Also try the bay centres if the standard grid search did not fit.
  for (let z = footprint.depth / 2; z <= BUILDING.width; z += 2) {
    for (let x = footprint.width / 2; x <= BUILDING.length; x += 2) {
      const candidate = { ...item, x, z };

      if (isValidPosition(candidate, objects)) {
        return { x, z };
      }
    }
  }

  return null;
}

function Equipment({ item, selected, onSelect }) {
  const type = EQUIPMENT_TYPES[item.type];
  const footprint = getFootprint(item);

  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, (item.rotation * Math.PI) / 180, 0]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.id);
      }}
    >
      {/* Equipment base / footprint */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[footprint.width, 0.12, footprint.depth]} />
        <meshStandardMaterial
          color={selected ? "#40e0d0" : type.color}
          emissive={selected ? "#146a65" : "#000000"}
          emissiveIntensity={selected ? 0.25 : 0}
        />
      </mesh>

      {/* Main body */}
      <mesh position={[0, type.height / 2 + 0.12, 0]} castShadow>
        <boxGeometry
          args={[footprint.width * 0.88, type.height, footprint.depth * 0.88]}
        />
        <meshStandardMaterial
          color={selected ? "#2baba1" : type.color}
          roughness={0.65}
        />
      </mesh>

      {/* Top detail */}
      <mesh position={[0, type.height + 0.18, 0]} castShadow>
        <boxGeometry
          args={[footprint.width * 0.55, 0.12, footprint.depth * 0.55]}
        />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Highlighted outline when selected */}
      {selected && (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry
            args={[footprint.width + 0.25, 0.04, footprint.depth + 0.25]}
          />
          <meshBasicMaterial color="#343434" wireframe />
        </mesh>
      )}
    </group>
  );
}

function BayMarkers() {
  const bays = useMemo(() => {
    const result = [];

    for (let x = BAY_SIZE; x < BUILDING.length; x += BAY_SIZE) {
      result.push(
        <mesh key={`x-${x}`} position={[x, 0.015, BUILDING.width / 2]}>
          <boxGeometry args={[0.12, 0.025, BUILDING.width]} />
          <meshBasicMaterial color="#e4bd35" />
        </mesh>,
      );
    }

    for (let z = BAY_SIZE; z < BUILDING.width; z += BAY_SIZE) {
      result.push(
        <mesh key={`z-${z}`} position={[BUILDING.length / 2, 0.015, z]}>
          <boxGeometry args={[BUILDING.length, 0.025, 0.12]} />
          <meshBasicMaterial color="#e4bd35" />
        </mesh>,
      );
    }

    return result;
  }, []);

  return <group>{bays}</group>;
}

function FactoryScene({ objects, selectedId, onSelect }) {
  return (
    <>
      <color attach="background" args={["#e9f0f2"]} />

      <ambientLight intensity={1.7} />

      <directionalLight position={[30, 50, 20]} intensity={2.2} castShadow />

      {/* Complete floor: one shared coordinate system */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[BUILDING.length / 2, -0.12, BUILDING.width / 2]}
        receiveShadow
      >
        <planeGeometry args={[BUILDING.length, BUILDING.width]} />
        <meshStandardMaterial color="#f8fafb" />
      </mesh>

      {/* Floor reference grid */}
      <Grid
        position={[BUILDING.length / 2, -0.1, BUILDING.width / 2]}
        args={[BUILDING.length, BUILDING.width]}
        cellSize={1}
        cellThickness={0.35}
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#a9c5c4"
        cellColor="#d4e0e1"
        fadeDistance={120}
        infiniteGrid={false}
      />

      {/* Yellow equipment-bay markings */}
      <BayMarkers />

      {/* Outer walls */}
      <mesh position={[0, BUILDING.wallHeight / 2, BUILDING.width / 2]}>
        <boxGeometry args={[0.3, BUILDING.wallHeight, BUILDING.width]} />
        <meshStandardMaterial color="#b4c2c8" transparent opacity={0.4} />
      </mesh>

      <mesh
        position={[
          BUILDING.length,
          BUILDING.wallHeight / 2,
          BUILDING.width / 2,
        ]}
      >
        <boxGeometry args={[0.3, BUILDING.wallHeight, BUILDING.width]} />
        <meshStandardMaterial color="#b4c2c8" transparent opacity={0.4} />
      </mesh>

      <mesh position={[BUILDING.length / 2, BUILDING.wallHeight / 2, 0]}>
        <boxGeometry args={[BUILDING.length, BUILDING.wallHeight, 0.3]} />
        <meshStandardMaterial color="#b4c2c8" transparent opacity={0.4} />
      </mesh>

      <mesh
        position={[
          BUILDING.length / 2,
          BUILDING.wallHeight / 2,
          BUILDING.width,
        ]}
      >
        <boxGeometry args={[BUILDING.length, BUILDING.wallHeight, 0.3]} />
        <meshStandardMaterial color="#b4c2c8" transparent opacity={0.4} />
      </mesh>

      {objects.map((item) => (
        <Equipment
          key={item.id}
          item={item}
          selected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}

      <axesHelper args={[5]} />

      <OrbitControls
        makeDefault
        target={[50, 0, 30]}
        minDistance={10}
        maxDistance={180}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />
    </>
  );
}
function ViewController({ viewMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (viewMode === "Top") {
      camera.position.set(50, 120, 30);
      camera.up.set(0, 0, -1);
    } else {
      camera.position.set(90, 75, 100);
      camera.up.set(0, 1, 0);
    }

    camera.lookAt(50, 0, 30);
    camera.updateProjectionMatrix();
  }, [viewMode, camera]);

  return null;
}
export default function App() {
  const [objects, setObjects] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [notice, setNotice] = useState("Add equipment to begin designing.");
  const [viewMode, setViewMode] = useState("3D");

  const selectedObject = objects.find((item) => item.id === selectedId);

  function addEquipment(type) {
    const position = findFreePosition(type, objects);

    if (!position) {
      setNotice("No free space available for this equipment.");
      return;
    }

    const id = `asset-${nextId}`;
    const item = makeObject(type, id, position.x, position.z);

    setObjects((current) => [...current, item]);
    setSelectedId(id);
    setNextId((value) => value + 1);
    setNotice(`${EQUIPMENT_TYPES[type].label} added.`);
  }

  function moveSelected(dx, dz) {
    if (!selectedObject) return;

    const candidate = {
      ...selectedObject,
      x: selectedObject.x + dx,
      z: selectedObject.z + dz,
    };

    if (!isValidPosition(candidate, objects)) {
      setNotice("Move blocked: outside the building or overlapping equipment.");
      return;
    }

    setObjects((current) =>
      current.map((item) => (item.id === selectedId ? candidate : item)),
    );

    setNotice("Equipment position updated.");
  }

  function rotateSelected() {
    if (!selectedObject) return;

    const candidate = {
      ...selectedObject,
      rotation: (selectedObject.rotation + 90) % 360,
    };

    if (!isValidPosition(candidate, objects)) {
      setNotice("Rotation blocked: insufficient space or equipment overlap.");
      return;
    }

    setObjects((current) =>
      current.map((item) => (item.id === selectedId ? candidate : item)),
    );

    setNotice("Equipment rotated 90°.");
  }

  function deleteSelected() {
    if (!selectedId) return;

    setObjects((current) => current.filter((item) => item.id !== selectedId));

    setSelectedId(null);
    setNotice("Equipment deleted.");
  }

  function clearLayout() {
    setObjects([]);
    setSelectedId(null);
    setNotice("Layout cleared.");
  }

  return (
    <main className="factory-app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">FM</div>
          <div>
            <h1>FORBES MARSHALL</h1>
            <p>Industrial Layout Simulator</p>
          </div>
        </div>

        <div className="topbar-right">
          <span className="prototype-badge">PROTOTYPE</span>
          <span className="asset-count">{objects.length} assets</span>
        </div>
      </header>

      <div className="workspace">
        <section className="viewport">
          <div className="viewport-toolbar">
            <div>
              <strong>Factory floor</strong>
              <span>100 m × 60 m · Illustrative dimensions</span>
            </div>

            <div className="view-buttons">
              <button
                className={viewMode === "3D" ? "active" : ""}
                onClick={() => setViewMode("3D")}
              >
                3D View
              </button>
              <button
                className={viewMode === "Top" ? "active" : ""}
                onClick={() => setViewMode("Top")}
              >
                Top View
              </button>
            </div>
          </div>

          <Canvas
            shadows
            camera={{
              position: [90, 75, 100],
              fov: 48,
              near: 0.1,
              far: 500,
            }}
          >
            <FactoryScene
              objects={objects}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            {viewMode === "Top" && <ViewController viewMode={viewMode} />}
          </Canvas>

          <div className="viewport-hint">
            Select equipment · Use the sidebar to move or rotate it
          </div>
        </section>

        <aside className="sidebar">
          <div className="sidebar-heading">
            <div>
              <h2>Layout Editor</h2>
              <p>Manage factory equipment</p>
            </div>
            <span className="sidebar-icon">＋</span>
          </div>

          <section className="sidebar-section">
            <h3>Equipment Library</h3>
            <p className="section-description">
              Select an item to add it to the floor.
            </p>

            <div className="equipment-list">
              {Object.entries(EQUIPMENT_TYPES).map(([type, data]) => (
                <button
                  key={type}
                  className="equipment-card"
                  onClick={() => addEquipment(type)}
                >
                  <span
                    className="equipment-swatch"
                    style={{ background: data.color }}
                  />
                  <span className="equipment-info">
                    <strong>{data.label}</strong>
                    <small>
                      {data.width} m × {data.depth} m
                    </small>
                  </span>
                  <span className="add-symbol">+</span>
                </button>
              ))}
            </div>
          </section>

          <section className="sidebar-section selected-section">
            <div className="section-title-row">
              <h3>Selected Object</h3>
              {selectedObject && <span className="selected-dot" />}
            </div>

            {selectedObject ? (
              <>
                <div className="selected-card">
                  <strong>{EQUIPMENT_TYPES[selectedObject.type].label}</strong>
                  <span>{selectedObject.id}</span>
                </div>

                <div className="position-readout">
                  <div>
                    <span>X Position</span>
                    <strong>{selectedObject.x.toFixed(1)} m</strong>
                  </div>
                  <div>
                    <span>Z Position</span>
                    <strong>{selectedObject.z.toFixed(1)} m</strong>
                  </div>
                  <div>
                    <span>Rotation</span>
                    <strong>{selectedObject.rotation}°</strong>
                  </div>
                </div>

                <label className="control-label">Move object</label>

                <div className="move-controls">
                  <span />
                  <button onClick={() => moveSelected(0, -1)}>↑</button>
                  <span />

                  <button onClick={() => moveSelected(-1, 0)}>←</button>
                  <button onClick={() => moveSelected(0, 1)}>↓</button>
                  <button onClick={() => moveSelected(1, 0)}>→</button>
                </div>

                <p className="control-help">
                  Each arrow moves the object by 1 metre.
                </p>

                <button className="rotate-button" onClick={rotateSelected}>
                  ↻ Rotate 90°
                </button>

                <button className="delete-button" onClick={deleteSelected}>
                  Delete selected object
                </button>
              </>
            ) : (
              <div className="empty-selection">
                <span>◇</span>
                <strong>No object selected</strong>
                <p>Add equipment or select an object in the 3D view.</p>
              </div>
            )}
          </section>

          <section className="sidebar-section layout-section">
            <h3>Layout Summary</h3>

            <div className="summary-row">
              <span>Total equipment</span>
              <strong>{objects.length}</strong>
            </div>

            {Object.entries(EQUIPMENT_TYPES).map(([type, data]) => (
              <div className="summary-row" key={type}>
                <span>{data.label}</span>
                <strong>
                  {objects.filter((item) => item.type === type).length}
                </strong>
              </div>
            ))}

            <button className="clear-button" onClick={clearLayout}>
              Clear all equipment
            </button>
          </section>

          <div className="sidebar-status">
            <span className="status-indicator" />
            <p>{notice}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
