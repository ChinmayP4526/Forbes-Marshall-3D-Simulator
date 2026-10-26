
import { BUILDING, CORRIDOR } from "./buildingConfig";

function Wall({ position, size }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color="#718b90"
        transparent
        opacity={0.28}
      />
    </mesh>
  );
}

export default function FactoryFloor() {
  const { length, width, wallHeight, floorThickness } = BUILDING;

  return (
    <group>
      <mesh
        position={[length / 2, -floorThickness / 2, width / 2]}
        receiveShadow
      >
        <boxGeometry args={[length, floorThickness, width]} />
        <meshStandardMaterial color="#f8fafb" />
      </mesh>

      {/* Yellow bay markings outside the corridor */}
      {Array.from({ length: length / BUILDING.baySize - 1 }, (_, i) => {
        const x = (i + 1) * BUILDING.baySize;

        return (
          <group key={x}>
            {[
              [x, BUILDING.baySize / 2],
              [x, width - BUILDING.baySize / 2],
            ].map(([lineX, z]) => {
              const topDepth = CORRIDOR.minZ;
              const bottomDepth = width - CORRIDOR.maxZ;

              return (
                <group key={`${lineX}-${z}`}>
                  <mesh
                    position={[
                      lineX,
                      0.012,
                      z < width / 2 ? topDepth / 2 : CORRIDOR.maxZ + bottomDepth / 2,
                    ]}
                  >
                    <boxGeometry
                      args={[
                        0.12,
                        0.025,
                        z < width / 2 ? topDepth : bottomDepth,
                      ]}
                    />
                    <meshBasicMaterial color="#e4bd35" />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Long corridor boundaries */}
      {[CORRIDOR.minZ, CORRIDOR.maxZ].map((z) => (
        <mesh key={z} position={[length / 2, 0.018, z]}>
          <boxGeometry args={[length, 0.025, 0.16]} />
          <meshBasicMaterial color="#e4bd35" />
        </mesh>
      ))}

      {/* Outer walls */}
      <Wall
        position={[0, wallHeight / 2, width / 2]}
        size={[0.3, wallHeight, width]}
      />
      <Wall
        position={[length, wallHeight / 2, width / 2]}
        size={[0.3, wallHeight, width]}
      />
      <Wall
        position={[length / 2, wallHeight / 2, 0]}
        size={[length, wallHeight, 0.3]}
      />
      <Wall
        position={[length / 2, wallHeight / 2, width]}
        size={[length, wallHeight, 0.3]}
      />
    </group>
  );
}
