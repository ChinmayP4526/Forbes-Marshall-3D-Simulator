
import EquipmentLibrary from "./EquipmentLibrary";

export default function Sidebar({
  open,
  onClose,
  onAdd,
  
}) {
  return (
    <>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Close equipment library"
          onClick={onClose}
        />
      )}

      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-heading">
          <div>
            <h2>Layout Editor</h2>
            <p>Manage factory equipment</p>
          </div>
          <button className="icon-button" onClick={onClose}>
            ×
          </button>
        </div>

        <EquipmentLibrary onAdd={onAdd} />

        
      </aside>
    </>
  );
}
