/** Curved-arch positions tuned to clinical odontogram layout (viewBox 900×500) */

export interface ToothPosition {
  x: number;
  y: number;
  rotate: number;
}

export const UPPER_RIGHT_POS: Record<number, ToothPosition> = {
  18: { x: 188, y: 108, rotate: -58 },
  17: { x: 228, y: 122, rotate: -46 },
  16: { x: 268, y: 136, rotate: -34 },
  15: { x: 304, y: 146, rotate: -24 },
  14: { x: 336, y: 154, rotate: -16 },
  13: { x: 364, y: 160, rotate: -8 },
  12: { x: 388, y: 164, rotate: -3 },
  11: { x: 412, y: 166, rotate: 0 },
};

export const UPPER_LEFT_POS: Record<number, ToothPosition> = {
  21: { x: 488, y: 166, rotate: 0 },
  22: { x: 512, y: 164, rotate: 3 },
  23: { x: 536, y: 160, rotate: 8 },
  24: { x: 564, y: 154, rotate: 16 },
  25: { x: 596, y: 146, rotate: 24 },
  26: { x: 632, y: 136, rotate: 34 },
  27: { x: 672, y: 122, rotate: 46 },
  28: { x: 712, y: 108, rotate: 58 },
};

export const LOWER_RIGHT_POS: Record<number, ToothPosition> = {
  48: { x: 188, y: 392, rotate: 58 },
  47: { x: 228, y: 378, rotate: 46 },
  46: { x: 268, y: 364, rotate: 34 },
  45: { x: 304, y: 354, rotate: 24 },
  44: { x: 336, y: 346, rotate: 16 },
  43: { x: 364, y: 340, rotate: 8 },
  42: { x: 388, y: 336, rotate: 3 },
  41: { x: 412, y: 334, rotate: 0 },
};

export const LOWER_LEFT_POS: Record<number, ToothPosition> = {
  31: { x: 488, y: 334, rotate: 0 },
  32: { x: 512, y: 336, rotate: -3 },
  33: { x: 536, y: 340, rotate: -8 },
  34: { x: 564, y: 346, rotate: -16 },
  35: { x: 596, y: 354, rotate: -24 },
  36: { x: 632, y: 364, rotate: -34 },
  37: { x: 672, y: 378, rotate: -46 },
  38: { x: 712, y: 392, rotate: -58 },
};

export function getToothPosition(number: number): ToothPosition {
  return (
    UPPER_RIGHT_POS[number] ??
    UPPER_LEFT_POS[number] ??
    LOWER_RIGHT_POS[number] ??
    LOWER_LEFT_POS[number] ??
    { x: 450, y: 250, rotate: 0 }
  );
}

export const ODONTOGRAM_VIEWBOX = "0 0 900 500";

export const ARCH_PATHS = {
  upper: "M 130,148 Q 450,78 770,148",
  lower: "M 130,352 Q 450,422 770,352",
};
