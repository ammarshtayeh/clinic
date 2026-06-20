import type { ToothCondition } from "@/lib/types/database";

export type ToothType = "incisor" | "canine" | "premolar" | "molar";
export type SurfaceCode = "M" | "D" | "O" | "B" | "L";

export const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
export const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
export const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

export const ALL_TEETH = [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_RIGHT, ...LOWER_LEFT];

export const SURFACE_LABELS: Record<SurfaceCode, string> = {
  M: "واصلي",
  D: "بعيد",
  O: "إطباقي",
  B: "خدي",
  L: "لساني",
};

export const QUADRANT_LABELS: Record<number, { ar: string; en: string }> = {
  1: { ar: "الربع الأول — فك علوي يمين", en: "Q1 UR" },
  2: { ar: "الربع الثاني — فك علوي يسار", en: "Q2 UL" },
  3: { ar: "الربع الثالث — فك سفلي يسار", en: "Q3 LL" },
  4: { ar: "الربع الرابع — فك سفلي يمين", en: "Q4 LR" },
};

export const TOOTH_NAMES_AR: Record<number, string> = {
  11: "قاطع مركزي", 12: "قاطع جانبي", 13: "ناب", 14: "ضرس صغير أول", 15: "ضرس صغير ثاني",
  16: "ضرس أول", 17: "ضرس ثاني", 18: "ضرس العقل",
  21: "قاطع مركزي", 22: "قاطع جانبي", 23: "ناب", 24: "ضرس صغير أول", 25: "ضرس صغير ثاني",
  26: "ضرس أول", 27: "ضرس ثاني", 28: "ضرس العقل",
  31: "قاطع مركزي", 32: "قاطع جانبي", 33: "ناب", 34: "ضرس صغير أول", 35: "ضرس صغير ثاني",
  36: "ضرس أول", 37: "ضرس ثاني", 38: "ضرس العقل",
  41: "قاطع مركزي", 42: "قاطع جانبي", 43: "ناب", 44: "ضرس صغير أول", 45: "ضرس صغير ثاني",
  46: "ضرس أول", 47: "ضرس ثاني", 48: "ضرس العقل",
};

export const CONDITIONS: ToothCondition[] = [
  "healthy", "cavity", "filling", "crown", "root_canal", "extraction", "implant", "missing", "other",
];

export function getToothType(number: number): ToothType {
  const digit = number % 10;
  if (digit <= 2) return "incisor";
  if (digit === 3) return "canine";
  if (digit <= 5) return "premolar";
  return "molar";
}

export function getQuadrant(number: number): 1 | 2 | 3 | 4 {
  return Math.floor(number / 10) as 1 | 2 | 3 | 4;
}

export function isUpperJaw(number: number): boolean {
  return number < 30;
}

export function parseSurfaces(raw: string | null): SurfaceCode[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter((s): s is SurfaceCode =>
    ["M", "D", "O", "B", "L"].includes(s)
  );
}

export function serializeSurfaces(surfaces: SurfaceCode[]): string {
  return surfaces.join(",");
}

/** Arch rotation in degrees — simulates natural dental arch curve */
export function getArchRotation(number: number): number {
  const digit = number % 10;
  const quadrant = getQuadrant(number);
  const isUpper = isUpperJaw(number);
  const base = (digit - 4.5) * (isUpper ? -2.2 : 2.2);
  if (quadrant === 1 || quadrant === 4) return base;
  return -base;
}
