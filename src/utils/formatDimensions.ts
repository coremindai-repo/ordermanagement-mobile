import type { Dimensions } from "../api/orderTypes";

/** Storage is always cm; display converts back to whatever unit was originally entered
 * (contract §4: "so the app can display 200 cm back as 2 m if that is how it was typed"). */
export function formatDimensions(dimensions: Dimensions): string {
  const toDisplay = (cm: number | null): string => {
    if (cm === null) return "—";
    return dimensions.enteredUnit === "m" ? String(cm / 100) : String(cm);
  };

  const { lengthCm, breadthCm, heightCm, enteredUnit } = dimensions;
  return `${toDisplay(lengthCm)} × ${toDisplay(breadthCm)} × ${toDisplay(heightCm)} ${enteredUnit}`;
}
