import type { ToothType } from "./fdi";

export interface ToothCapsule {
  width: number;
  height: number;
  rootCount: 1 | 2 | 3;
}

const BASE: Record<ToothType, ToothCapsule> = {
  incisor: { width: 22, height: 58, rootCount: 1 },
  canine: { width: 24, height: 62, rootCount: 1 },
  premolar: { width: 28, height: 56, rootCount: 2 },
  molar: { width: 36, height: 54, rootCount: 3 },
};

const WISDOM: ToothCapsule = { width: 30, height: 50, rootCount: 2 };

export function getToothCapsule(number: number, type: ToothType): ToothCapsule {
  if (number % 10 === 8) return WISDOM;
  return BASE[type];
}
