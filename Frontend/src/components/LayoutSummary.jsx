
import { EQUIPMENT_TYPES } from "../scene/placement";

export default function LayoutSummary({ objects, status, onSave }) {
  return (
    <section className="layout-summary">
      <div className="summary-heading">
        <div>
          <strong>Layout Summary</strong>
          <p>{objects.length} objects placed</p>
        </div>
        <button onClick={onSave}>Save</button>
      </div>

      <div className="summary-types">
        {Object.entries(EQUIPMENT_TYPES).map(([type, data]) => (
          <div className="summary-type" key={type}>
            <span>{data.label}</span>
            <strong>
              {objects.filter((item) => item.type === type).length}
            </strong>
          </div>
        ))}
      </div>

      <p className="save-status">{status}</p>
    </section>
  );
}
