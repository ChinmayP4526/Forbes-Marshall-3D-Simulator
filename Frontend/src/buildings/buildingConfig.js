
export const BUILDING = {
  length: 100,      // Total length in metres
  width: 60,        // Total width in metres
  splitX: 50,       // Boundary between left and right halves

  floorY: 0,
  floorThickness: 0.4,

  wallHeight: 8,
  wallThickness: 0.4,
};

export const LEFT_BOUNDS = {
  minX: 0,
  maxX: BUILDING.splitX,
};

export const RIGHT_BOUNDS = {
  minX: BUILDING.splitX,
  maxX: BUILDING.length,
};
