
export const EQUIPMENT_TYPES = {
  vmc: {
    label: "VMC Machine",
    modelPath: "/models/vmc.glb",
    footprint: { width: 8, depth: 7 },
    modelSize: { width: 8, height: 5, depth: 7 },
    icon: "factory",
    color: "#78909c",
  },

  scaffold: {
    label: "Scaffold",
    modelPath: "/models/scaffold.glb",
    footprint: { width: 5, depth: 3 },
    modelSize: { width: 5, height: 7, depth: 3 },
    icon: "layers",
    color: "#9e9e9e",
  },

  trolley: {
    label: "Trolley",
    modelPath: "/models/trolley.glb",
    footprint: { width: 2, depth: 1.5 },
    modelSize: { width: 2, height: 1.5, depth: 1.5 },
    icon: "shopping-cart",
    color: "#607d8b",
  },

  platform_trolley: {
    label: "Platform Trolley",
    modelPath: "/models/platform_trolley.glb",
    footprint: { width: 4, depth: 3 },
    modelSize: { width: 4, height: 1.5, depth: 3 },
    icon: "truck",
    color: "#78909c",
  },

  gantry_crane: {
    label: "Gantry Crane",
    modelPath: "/models/gantry_crane.glb",
    footprint: { width: 10, depth: 5 },
    modelSize: { width: 10, height: 5, depth: 5 },
    icon: "construction",
    color: "#e4bd35",
  },

  air_cooler: {
    label: "Air Cooler",
    modelPath: "/models/air_cooler.glb",
    footprint: { width: 2, depth: 1.5 },
    modelSize: { width: 2, height: 2.5, depth: 1.5 },
    icon: "wind",
    color: "#40a9b5",
  },
};

export function getFootprint(object) {
  const type = EQUIPMENT_TYPES[object.type];

  if (!type) {
    throw new Error(`Unknown equipment type: ${object.type}`);
  }

  const angle = ((Number(object.rotation) || 0) % 180 + 180) % 180;
  const rotated = Math.abs(angle - 90) < 0.001;

  return rotated
    ? {
        width: type.footprint.depth,
        depth: type.footprint.width,
      }
    : {
        width: type.footprint.width,
        depth: type.footprint.depth,
      };
}

export function isInBounds(object, building) {
  const { width, depth } = getFootprint(object);

  return (
    object.x - width / 2 >= 0 &&
    object.x + width / 2 <= building.length &&
    object.z - depth / 2 >= 0 &&
    object.z + depth / 2 <= building.width
  );
}

export function overlaps(a, b) {
  const fa = getFootprint(a);
  const fb = getFootprint(b);

  return (
    Math.abs(a.x - b.x) < (fa.width + fb.width) / 2 - 0.001 &&
    Math.abs(a.z - b.z) < (fa.depth + fb.depth) / 2 - 0.001
  );
}

export function isValidPlacement(object, objects, building, corridor) {
  if (!isInBounds(object, building)) {
    return { valid: false, reason: "Outside the building boundary." };
  }

  if (corridor) {
    const footprint = getFootprint(object);
    const overlapsCorridor =
      object.z - footprint.depth / 2 < corridor.maxZ &&
      object.z + footprint.depth / 2 > corridor.minZ;

    if (overlapsCorridor) {
      return {
        valid: false,
        reason: "Keep the transport corridor clear.",
      };
    }
  }

  const collision = objects.some(
    (other) => other.id !== object.id && overlaps(object, other),
  );

  if (collision) {
    return { valid: false, reason: "Equipment cannot overlap." };
  }

  return { valid: true, reason: "" };
}

export function createEquipment(type, id, x, z) {
  const config = EQUIPMENT_TYPES[type];

  if (!config) {
    throw new Error(`Unknown equipment type: ${type}`);
  }

  return {
    id,
    type,
    name: config.label,
    x,
    z,
    rotation: 0,
    modelPath: config.modelPath,
  };
}

export function findFreePosition(type, objects, building, corridor) {
  const item = createEquipment(type, "candidate", 0, 0);
  const footprint = getFootprint(item);

  for (
    let z = footprint.depth / 2 + 0.5;
    z <= building.width - footprint.depth / 2;
    z += 1
  ) {
    for (
      let x = footprint.width / 2 + 0.5;
      x <= building.length - footprint.width / 2;
      x += 1
    ) {
      const candidate = { ...item, x, z };

      if (isValidPlacement(candidate, objects, building, corridor).valid) {
        return { x, z };
      }
    }
  }

  return null;
}
