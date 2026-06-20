import type { ToothType } from "./fdi";

export interface ToothShape {
  width: number;
  height: number;
  crown: string;
  roots: string[];
  cusps?: string[];
  incisal?: string;
  highlight?: string;
  gingiva?: string;
}

const UPPER: Record<ToothType, ToothShape> = {
  incisor: {
    width: 26,
    height: 68,
    crown: "M13,58 L8,58 Q6.5,52 6.5,46 Q6.5,40 8.5,36 L17.5,36 Q19.5,40 19.5,46 Q19.5,52 18,58 Z",
    incisal: "M8.5,57 Q13,54.5 17.5,57",
    roots: ["M11,36 Q9.5,22 10.5,10 Q11.5,6 13,6 Q14.5,6 15.5,10 Q16.5,22 15,36"],
    highlight: "M10,42 Q13,40 16,42",
    gingiva: "M7,36 Q13,38.5 19,36",
  },
  canine: {
    width: 28,
    height: 74,
    crown: "M14,62 L9,58 Q7,50 8,42 Q9.5,34 14,30 Q18.5,34 20,42 Q21,50 19,58 Z",
    roots: ["M14,30 Q11.5,16 12.5,6 Q13,3 14,3 Q15,3 15.5,6 Q16.5,16 14,30"],
    highlight: "M12,44 Q14,40 16,44",
    gingiva: "M8.5,30 Q14,33 19.5,30",
  },
  premolar: {
    width: 32,
    height: 66,
    crown: "M16,56 L7,54 Q5,48 5.5,42 Q6,36 9,32 L12,30 Q14,28 16,28 Q18,28 20,30 L23,32 Q26,36 26.5,42 Q27,48 25,54 Z",
    cusps: [
      "M9,32 Q12,26 16,28 Q14,32 9,32",
      "M23,32 Q20,26 16,28 Q18,32 23,32",
    ],
    roots: [
      "M12,30 Q10,16 11,8 Q11.5,5 13,5 Q14,5 14.5,8 Q15,16 13.5,30",
      "M20,30 Q22,16 21,8 Q20.5,5 19,5 Q18,5 17.5,8 Q17,16 18.5,30",
    ],
    highlight: "M10,38 Q16,36 22,38",
    gingiva: "M7,30 Q16,33 25,30",
  },
  molar: {
    width: 38,
    height: 62,
    crown: "M19,52 L5,50 Q3,44 3.5,38 Q4,32 7,28 L10,26 Q13,24 19,24 Q25,24 28,26 L31,28 Q34,32 34.5,38 Q35,44 33,50 Z",
    cusps: [
      "M7,28 Q10,22 14,24 Q11,28 7,28",
      "M31,28 Q28,22 24,24 Q27,28 31,28",
      "M13,26 Q16,22 19,24 Q16,26 13,26",
      "M25,26 Q22,22 19,24 Q22,26 25,26",
    ],
    roots: [
      "M11,26 Q9,12 10,6 Q10.5,3 12,3 Q13,3 13.5,6 Q14.5,12 13,26",
      "M19,26 L19,4",
      "M27,26 Q29,12 28,6 Q27.5,3 26,3 Q25,3 24.5,6 Q23.5,12 25,26",
    ],
    highlight: "M8,36 Q19,34 30,36",
    gingiva: "M5,26 Q19,29 33,26",
  },
};

const LOWER: Record<ToothType, ToothShape> = {
  incisor: {
    width: 26,
    height: 68,
    crown: "M13,10 L8,10 Q6.5,16 6.5,22 Q6.5,28 8.5,32 L17.5,32 Q19.5,28 19.5,22 Q19.5,16 18,10 Z",
    incisal: "M8.5,11 Q13,13.5 17.5,11",
    roots: ["M11,32 Q9.5,46 10.5,58 Q11.5,62 13,62 Q14.5,62 15.5,58 Q16.5,46 15,32"],
    highlight: "M10,26 Q13,28 16,26",
    gingiva: "M7,32 Q13,29.5 19,32",
  },
  canine: {
    width: 28,
    height: 74,
    crown: "M14,12 L9,16 Q7,24 8,32 Q9.5,40 14,44 Q18.5,40 20,32 Q21,24 19,16 Z",
    roots: ["M14,44 Q11.5,58 12.5,68 Q13,71 14,71 Q15,71 15.5,68 Q16.5,58 14,44"],
    highlight: "M12,30 Q14,34 16,30",
    gingiva: "M8.5,44 Q14,41 19.5,44",
  },
  premolar: {
    width: 32,
    height: 66,
    crown: "M16,10 L7,12 Q5,18 5.5,24 Q6,30 9,34 L12,36 Q14,38 16,38 Q18,38 20,36 L23,34 Q26,30 26.5,24 Q27,18 25,12 Z",
    cusps: [
      "M9,34 Q12,40 16,38 Q14,34 9,34",
      "M23,34 Q20,40 16,38 Q18,34 23,34",
    ],
    roots: [
      "M12,36 Q10,50 11,58 Q11.5,61 13,61 Q14,61 14.5,58 Q15,50 13.5,36",
      "M20,36 Q22,50 21,58 Q20.5,61 19,61 Q18,61 17.5,58 Q17,50 18.5,36",
    ],
    highlight: "M10,28 Q16,30 22,28",
    gingiva: "M7,36 Q16,33 25,36",
  },
  molar: {
    width: 38,
    height: 62,
    crown: "M19,10 L5,12 Q3,18 3.5,24 Q4,30 7,34 L10,36 Q13,38 19,38 Q25,38 28,36 L31,34 Q34,30 34.5,24 Q35,18 33,12 Z",
    cusps: [
      "M7,34 Q10,40 14,38 Q11,34 7,34",
      "M31,34 Q28,40 24,38 Q27,34 31,34",
      "M13,36 Q16,40 19,38 Q16,36 13,36",
      "M25,36 Q22,40 19,38 Q22,36 25,36",
    ],
    roots: [
      "M11,36 Q9,50 10,56 Q10.5,59 12,59 Q13,59 13.5,56 Q14.5,50 13,36",
      "M19,36 L19,58",
      "M27,36 Q29,50 28,56 Q27.5,59 26,59 Q25,59 24.5,56 Q23.5,50 25,36",
    ],
    highlight: "M8,26 Q19,28 30,26",
    gingiva: "M5,36 Q19,33 33,36",
  },
};

const WISDOM_UPPER: ToothShape = {
  width: 34,
  height: 58,
  crown: "M17,50 L6,48 Q4,43 4.5,38 Q5,33 7.5,30 L10,28 Q13,26 17,26 Q21,26 24,28 L26.5,30 Q29,33 29.5,38 Q30,43 28,48 Z",
  cusps: ["M7.5,30 Q10,24 13,26", "M26.5,30 Q24,24 21,26"],
  roots: ["M12,28 Q10,14 11,6 Q12,3 13,3 Q14,3 15,6 Q16,14 14,28", "M22,28 Q24,14 23,6 Q22,3 21,3 Q20,3 19,6 Q18,14 20,28"],
  highlight: "M8,34 Q17,32 26,34",
  gingiva: "M6,28 Q17,31 28,28",
};

const WISDOM_LOWER: ToothShape = {
  width: 34,
  height: 58,
  crown: "M17,8 L6,10 Q4,15 4.5,20 Q5,25 7.5,28 L10,30 Q13,32 17,32 Q21,32 24,30 L26.5,28 Q29,25 29.5,20 Q30,15 28,10 Z",
  cusps: ["M7.5,28 Q10,34 13,32", "M26.5,28 Q24,34 21,32"],
  roots: ["M12,30 Q10,44 11,52 Q12,55 13,55 Q14,55 15,52 Q16,44 14,30", "M22,30 Q24,44 23,52 Q22,55 21,55 Q20,55 19,52 Q18,44 20,30"],
  highlight: "M8,24 Q17,26 26,24",
  gingiva: "M6,30 Q17,27 28,30",
};

export function getToothShape(number: number, type: ToothType, upper: boolean): ToothShape {
  if (number % 10 === 8) return upper ? WISDOM_UPPER : WISDOM_LOWER;
  return upper ? UPPER[type] : LOWER[type];
}

export function getViewBox(shape: ToothShape): string {
  return `0 0 ${shape.width} ${shape.height}`;
}
