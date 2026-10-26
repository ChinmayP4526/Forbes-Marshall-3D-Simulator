import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import LayoutSummary from "./components/LayoutSummary";
import FactoryScene from "./scene/FactoryScene";
import { BUILDING, CORRIDOR } from "./scene/buildingConfig";
import SelectedObjectPanel from "./components/SelectedObjectPanel";
import {
  createEquipment,
  findFreePosition,
  isValidPlacement,
} from "./scene/placement";
import useLayout from "./hooks/useLayout";
import "./App.css";

export default function App() {
  const { objects, updateObjects, status, loading, save } = useLayout();

  const [selectedId, setSelectedId] = useState(null);
  const [nextId, setNextId] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState("3D");
  const [message, setMessage] = useState("");

  const selectedObject = objects.find((item) => item.id === selectedId);

  function addEquipment(type) {
    const position = findFreePosition(type, objects, BUILDING, CORRIDOR);

    if (!position) {
      setMessage("No valid space available for this equipment.");
      return;
    }

    const id = `asset-${Date.now()}-${nextId}`;
    const item = createEquipment(type, id, position.x, position.z);

    updateObjects((current) => [...current, item]);
    setSelectedId(id);
    setNextId((value) => value + 1);
    setMessage(`${item.name} added.`);
  }

  function updatePosition(id, x, z) {
    updateObjects((current) => {
      const item = current.find((object) => object.id === id);
      if (!item) return current;

      const candidate = { ...item, x, z };
      const result = isValidPlacement(candidate, current, BUILDING, CORRIDOR);

      if (!result.valid) {
        setMessage(result.reason);
        return current;
      }

      setMessage("");
      return current.map((object) => (object.id === id ? candidate : object));
    });
  }

  function moveSelected(dx, dz) {
    if (!selectedObject) return;

    updatePosition(
      selectedObject.id,
      selectedObject.x + dx,
      selectedObject.z + dz,
    );
  }

  function rotateSelected(direction = 1) {
    if (!selectedObject) return;

    const candidate = {
      ...selectedObject,
      rotation:
        ((((selectedObject.rotation ?? 0) + direction * 90) % 360) + 360) % 360,
    };

    const result = isValidPlacement(candidate, objects, BUILDING, CORRIDOR);

    if (!result.valid) {
      setMessage(result.reason);
      return;
    }

    updateObjects((current) =>
      current.map((item) => (item.id === selectedId ? candidate : item)),
    );

    setMessage("");
  }

  function deleteSelected() {
    if (!selectedId) return;

    updateObjects((current) =>
      current.filter((item) => item.id !== selectedId),
    );

    setSelectedId(null);
    setMessage("Object deleted.");
  }

  return (
    <main className="factory-app">
      <Header
        assetCount={objects.length}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((value) => !value)}
      />

      <div className="view-toolbar">
        <div>
          <strong>Factory Floor</strong>
          <span>
            {BUILDING.length} m × {BUILDING.width} m · Illustrative dimensions
          </span>
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

      <section className="workspace">
        <div className="viewport">
          {loading ? (
            <div className="loading-screen">Loading saved factory layout…</div>
          ) : (
            <FactoryScene
              objects={objects}
              selectedId={selectedId}
              viewMode={viewMode}
              onSelect={setSelectedId}
              onMove={updatePosition}
              onDragEnd={() => {}}
              onInvalidMove={setMessage}
            />
          )}
          {selectedObject && !loading && (
            <SelectedObjectPanel
              item={selectedObject}
              onRotate={rotateSelected}
              onDelete={deleteSelected}
              onClose={() => setSelectedId(null)}
              onChangePosition={(axis, value) => {
                if (!selectedObject) return;

                updatePosition(
                  selectedObject.id,
                  axis === "x" ? value : selectedObject.x,
                  axis === "z" ? value : selectedObject.z,
                );
              }}
            />
          )}
          {message && <div className="message-toast">{message}</div>}

          <div className="scene-hint">
            Drag equipment to reposition · Scroll to zoom · Right-click to pan
          </div>

          <LayoutSummary objects={objects} status={status} onSave={save} />
        </div>

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onAdd={addEquipment}
          selectedObject={selectedObject}
          onMove={moveSelected}
          onRotate={rotateSelected}
          onDelete={deleteSelected}
          onChangePosition={(axis, value) => {
            if (!selectedObject) return;

            updatePosition(
              selectedObject.id,
              axis === "x" ? value : selectedObject.x,
              axis === "z" ? value : selectedObject.z,
            );
          }}
        />
      </section>
    </main>
  );
}
