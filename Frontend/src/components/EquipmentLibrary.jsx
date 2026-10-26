
import {
  Factory,
  Layers,
  ShoppingCart,
  Truck,
  Construction,
  Wind,
  Plus,
  Maximize2,
} from "lucide-react";

import { EQUIPMENT_TYPES } from "../scene/placement";

const ICONS = {
  factory: Factory,
  layers: Layers,
  "shopping-cart": ShoppingCart,
  truck: Truck,
  construction: Construction,
  wind: Wind,
};

export default function EquipmentLibrary({ onAdd }) {
  return (
    <section className="sidebar-section">
      <div className="library-heading">
        <div>
          <h3>Equipment Library</h3>
          <p className="section-description">
            Select a machine to add it to the factory floor.
          </p>
        </div>

        <span className="equipment-count">
          {Object.keys(EQUIPMENT_TYPES).length} machines
        </span>
      </div>

      <div className="equipment-list">
        {Object.entries(EQUIPMENT_TYPES).map(([type, data]) => {
          const Icon = ICONS[data.icon] || Factory;
          const { width, depth } = data.footprint;

          return (
            <button
              type="button"
              className="equipment-card"
              key={type}
              onClick={() => onAdd(type)}
              title={`Add ${data.label} to the factory`}
            >
              <span
                className="equipment-preview"
                style={{
                  "--machine-color": data.color || "#2baba1",
                }}
              >
                <Icon size={29} strokeWidth={1.7} />
              </span>

              <span className="equipment-info">
                <strong>{data.label}</strong>

                <small className="equipment-dimensions">
                  <Maximize2 size={12} />
                  {width} × {depth} units
                </small>

                <small className="equipment-area">
                  Floor area: {(width * depth).toFixed(1)} sq. units
                </small>
              </span>

              <span className="add-symbol" aria-hidden="true">
                <Plus size={19} />
              </span>
            </button>
          );
        })}
      </div>

      <p className="library-footnote">
        Dimensions represent floor space. Actual machine dimensions
        can be adjusted when verified measurements are available.
      </p>
    </section>
  );
}
