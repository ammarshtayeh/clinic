/** Hand-tuned arch positions for artistic odontogram layout (SVG coords, viewBox 900×520) */

export interface ToothPosition {
  x: number;
  y: number;
  rotate: number;
}

const MID = 450;

/** Upper right Q1: 18→11 (posterior to midline) */
export const UPPER_RIGHT_POS: Record<number, ToothPosition> = {
  18: { x: 175, y: 72, rotate: -62 },
  17: { x: 215, y: 88, rotate: -50 },
  16: { x: 255, y: 104, rotate: -38 },
  15: { x: 292, y: 118, rotate: -28 },
  14: { x: 325, y: 130, rotate: -18 },
  13: { x: 355, y: 140, rotate: -10 },
  12: { x: 382, y: 148, rotate: -4 },
  11: { x: 408, y: 152, rotate: 0 },
};

/** Upper left Q2: 21→28 */
export const UPPER_LEFT_POS: Record<number, ToothPosition> = {
  21: { x: 492, y: 152, rotate: 0 },
  22: { x: 518, y: 148, rotate: 4 },
  23: { x: 545, y: 140, rotate: 10 },
  24: { x: 575, y: 130, rotate: 18 },
  25: { x: 608, y: 118, rotate: 28 },
  26: { x: 645, y: 104, rotate: 38 },
  27: { x: 685, y: 88, rotate: 50 },
  28: { x: 725, y: 72, rotate: 62 },
};

/** Lower right Q4: 48→41 (posterior to midline) — crowns face up */
export const LOWER_RIGHT_POS: Record<number, ToothPosition> = {
  48: { x: 175, y: 448, rotate: 62 },
  47: { x: 215, y: 432, rotate: 50 },
  46: { x: 255, y: 416, rotate: 38 },
  45: { x: 292, y: 402, rotate: 28 },
  44: { x: 325, y: 390, rotate: 18 },
  43: { x: 355, y: 380, rotate: 10 },
  42: { x: 382, y: 372, rotate: 4 },
  41: { x: 408, y: 368, rotate: 0 },
};

/** Lower left Q3: 31→38 */
export const LOWER_LEFT_POS: Record<number, ToothPosition> = {
  31: { x: 492, y: 368, rotate: 0 },
  32: { x: 518, y: 372, rotate: -4 },
  33: { x: 545, y: 380, rotate: -10 },
  34: { x: 575, y: 390, rotate: -18 },
  35: { x: 608, y: 402, rotate: -28 },
  36: { x: 645, y: 416, rotate: -38 },
  37: { x: 685, y: 432, rotate: -50 },
  38: { x: 725, y: 448, rotate: -62 },
};

export function getToothPosition(number: number): ToothPosition {
  return (
    UPPER_RIGHT_POS[number] ??
    UPPER_LEFT_POS[number] ??
    LOWER_RIGHT_POS[number] ??
    LOWER_LEFT_POS[number] ??
    { x: MID, y: 260, rotate: 0 }
  );
}

export const ODONTOGRAM_VIEWBOX = "0 0 900 520";

export const ARCH_PATHS = {
  upper: `M 120,155 Q ${MID},95 780,155`,
  lower: `M 120,365 Q ${MID},425 780,365`,
};
