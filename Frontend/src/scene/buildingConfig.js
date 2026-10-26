
export const BUILDING = {
  length: 100,
  width: 60,
  wallHeight: 8,
  floorThickness: 0.4,

  // Continuous road along the building's long axis.
  corridorWidth: 8,

  // Illustrative equipment bay grid.
  baySize: 10,

  // Boundary between the two team-owned sections.
  splitX: 50,
};

export const CORRIDOR = {
  minZ: BUILDING.width / 2 - BUILDING.corridorWidth / 2,
  maxZ: BUILDING.width / 2 + BUILDING.corridorWidth / 2,
};

export const LEFT_BOUNDS = {
  minX: 0,
  maxX: BUILDING.splitX,
};

export const RIGHT_BOUNDS = {
  minX: BUILDING.splitX,
  maxX: BUILDING.length,
};
