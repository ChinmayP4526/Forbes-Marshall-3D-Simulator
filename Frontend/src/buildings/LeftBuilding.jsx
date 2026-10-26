
import { BUILDING, LEFT_BOUNDS } from "./buildingConfig";

function Wall({ position, size }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#a8b5c4"
        transparent
        opacity={0.35}
      />
    </mesh>
  );
}

export default function LeftBuilding() {
  const { minX, maxX } = LEFT_BOUNDS;

  const sectionLength = maxX - minX;
  const centerX = (minX + maxX) / 2;

  const { width, floorY, floorThickness, wallHeight, wallThickness } =
    BUILDING;

  return (
    <group name="LeftBuilding">
      {/* Left-side floor */}
      <mesh
        position={[centerX, floorY - floorThickness / 2, width / 2]}
        receiveShadow
      >
        <boxGeometry
          args={[sectionLength, floorThickness, width]}
        />
        <meshStandardMaterial color="#dce3e9" />
      </mesh>

      {/* Outer left wall */}
      <Wall
        position={[
          minX,
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
          The right-side team owns the other section. */}
    </group>
  );
}
