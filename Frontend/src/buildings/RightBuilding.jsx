
import { BUILDING, RIGHT_BOUNDS } from "./buildingConfig";

function Wall({ position, size }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#91b5a2"
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

export default function RightBuilding() {
  const { minX, maxX } = RIGHT_BOUNDS;

  const sectionLength = maxX - minX;
  const centerX = (minX + maxX) / 2;

  const { width, floorY, floorThickness, wallHeight, wallThickness } =
    BUILDING;

  return (
    <group name="RightBuilding">
      {/* Right-side floor */}
      <mesh
        position={[centerX, floorY - floorThickness / 2, width / 2]}
        receiveShadow
      >
        <boxGeometry
          args={[sectionLength, floorThickness, width]}
        />
        <meshStandardMaterial color="#e1e8df" />
      </mesh>

      {/* Outer right wall */}
      <Wall
        position={[
          maxX,
          floorY + wallHeight / 2,
          width / 2,
        ]}
        size={[wallThickness, wallHeight, width]}
      />

      {/* Front wall: Z = 0 */}
      <Wall
        position={[
          centerX,
          floorY + wallHeight / 2,
          0,
        ]}
        size={[sectionLength, wallHeight, wallThickness]}
      />

      {/* Back wall: Z = width */}
      <Wall
        position={[
          centerX,
          floorY + wallHeight / 2,
          width,
        ]}
        size={[sectionLength, wallHeight, wallThickness]}
      />

      {/* No wall on the split boundary at X = splitX.
          The left-side team owns the other section. */}
    </group>
  );
}
