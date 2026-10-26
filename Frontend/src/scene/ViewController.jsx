
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

export default function ViewController({ viewMode, controlsRef }) {
  const { camera } = useThree();

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    controls.target.set(50, 0, 30);

    if (viewMode === "Top") {
      camera.up.set(0, 0, -1);
      camera.position.set(50, 125, 30);
    } else {
      camera.up.set(0, 1, 0);
      camera.position.set(100, 80, 110);
    }

    camera.lookAt(50, 0, 30);
    controls.update();
  }, [viewMode, camera, controlsRef]);

  return null;
}
