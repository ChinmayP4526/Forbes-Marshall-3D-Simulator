
export default function Header({ assetCount, onToggleSidebar, sidebarOpen }) {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">FM</div>
        <div>
          <h1>FORBES MARSHALL</h1>
          <p>Industrial Layout Simulator</p>
        </div>
      </div>

      <div className="topbar-actions">
        <span className="prototype-badge">LAYOUT DESIGNER</span>
        <span className="asset-count">{assetCount} assets</span>
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? "Close Library ×" : "Equipment Library ☰"}
        </button>
      </div>
    </header>
  );
}
