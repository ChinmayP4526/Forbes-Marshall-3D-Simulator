
import { createContext, useContext } from "react";

export const OrbitControlsContext = createContext(null);

export function useOrbitControls() {
  return useContext(OrbitControlsContext);
}
