
import { EQUIPMENT_TYPES } from "../scene/placement";

export default function SelectedObjectPanel({
  item,
  onRotate,
  onDelete,
  onChangePosition,
  onClose,
}) {
  if (!item) return null;

  const type = EQUIPMENT_TYPES[item.type];
  const footprint = type.footprint;
  const modelSize = type.modelSize;
  const rotation = ((item.rotation ?? 0) % 360 + 360) % 360;

  const width = rotation % 180 === 90
    ? footprint.depth
    : footprint.width;

  const depth = rotation % 180 === 90
    ? footprint.width
    : footprint.depth;

  return (
    <section className="inspector-panel">
      <header className="inspector-header">
        <div>
          <span className="inspector-eyebrow">EQUIPMENT DETAILS</span>
          <h3>{type.label}</h3>
          <p>{item.id}</p>
        </div>
        <button
          className="inspector-close"
          onClick={onClose}
          aria-label="Close equipment details"
        >
          ×
        </button>
      </header>

      <div className="inspector-section">
        <h4>Dimensions <span>(metres)</span></h4>
        <div className="dimension-grid">
          <div><span>Width</span><strong>{width}</strong></div>
          <div><span>Depth</span><strong>{depth}</strong></div>
          <div><span>Height</span><strong>{modelSize.height}</strong></div>
        </div>
        <p className="inspector-note">
          Footprint dimensions update when you rotate the equipment.
        </p>
      </div>

      <div className="inspector-section">
        <h4>Position <span>(metres)</span></h4>
        <div className="inspector-inputs">
          <label>
            X
            <input
              type="number"
              step="0.5"
              value={item.x}
              onChange={(e) =>
                onChangePosition("x", Number(e.target.value))
              }
            />
          </label>
          <label>
            Z
            <input
              type="number"
              step="0.5"
              value={item.z}
              onChange={(e) =>
                onChangePosition("z", Number(e.target.value))
              }
            />
          </label>
        </div>
      </div>

      <div className="inspector-section">
        <div className="rotation-heading">
          <h4>Rotation</h4>
          <strong>{rotation}°</strong>
        </div>
        <div className="rotation-buttons">
          <button onClick={() => onRotate(-1)}>
            ↶ Rotate −90°
          </button>
          <button onClick={() => onRotate(1)}>
            ↻ Rotate +90°
          </button>
        </div>
      </div>

      <button className="inspector-delete" onClick={onDelete}>
        Delete equipment
      </button>
    </section>
  );
}
