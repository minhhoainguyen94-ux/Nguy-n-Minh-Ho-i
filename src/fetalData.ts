/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FetalWeightReference } from "./types";

// Standard fetal weight percentiles (in grams) based on Hadlock/WHO references
export const fetalWeightReferenceTable: FetalWeightReference[] = [
  { week: 8, p10: 0.8, p50: 1.0, p90: 1.2 },
  { week: 9, p10: 1.5, p50: 2.0, p90: 2.5 },
  { week: 10, p10: 3.0, p50: 4.0, p90: 5.0 },
  { week: 11, p10: 6.0, p50: 7.0, p90: 9.0 },
  { week: 12, p10: 11, p50: 14, p90: 18 },
  { week: 13, p10: 18, p50: 23, p90: 29 },
  { week: 14, p10: 34, p50: 43, p90: 53 },
  { week: 15, p10: 55, p50: 70, p90: 86 },
  { week: 16, p10: 79, p50: 100, p90: 121 },
  { week: 17, p10: 110, p50: 140, p90: 170 },
  { week: 18, p10: 151, p50: 190, p90: 229 },
  { week: 19, p10: 198, p50: 240, p90: 282 },
  { week: 20, p10: 249, p50: 300, p90: 351 },
  { week: 21, p10: 301, p50: 360, p90: 419 },
  { week: 22, p10: 362, p50: 430, p90: 498 },
  { week: 23, p10: 421, p50: 501, p90: 581 },
  { week: 24, p10: 504, p50: 600, p90: 696 },
  { week: 25, p10: 561, p50: 660, p90: 759 },
  { week: 26, p10: 647, p50: 760, p90: 873 },
  { week: 27, p10: 746, p50: 875, p90: 1004 },
  { week: 28, p10: 1000, p50: 1210, p90: 1450 },
  { week: 29, p10: 1100, p50: 1350, p90: 1600 },
  { week: 30, p10: 1220, p50: 1480, p90: 1760 },
  { week: 31, p10: 1340, p50: 1620, p90: 1930 },
  { week: 32, p10: 1460, p50: 1780, p90: 2110 },
  { week: 33, p10: 1600, p50: 1940, p90: 2300 },
  { week: 34, p10: 1750, p50: 2150, p90: 2520 },
  { week: 35, p10: 1920, p50: 2380, p90: 2770 },
  { week: 36, p10: 2100, p50: 2620, p90: 3040 },
  { week: 37, p10: 2290, p50: 2880, p90: 3320 },
  { week: 38, p10: 2480, p50: 3140, p90: 3610 },
  { week: 39, p10: 2670, p50: 3380, p90: 3880 },
  { week: 40, p10: 2860, p50: 3560, p90: 4100 },
  { week: 41, p10: 3010, p50: 3700, p90: 4250 },
  { week: 42, p10: 3150, p50: 3850, p90: 4400 }
];

export function getFetalWeightReference(week: number): FetalWeightReference {
  // Clamp week range to available data
  const targetWeek = Math.max(8, Math.min(42, week));
  const ref = fetalWeightReferenceTable.find(r => r.week === targetWeek);
  if (ref) return ref;
  
  // Dynamic fallback calculation if week is outside range
  const baseWeight = 3462; // Week 40 reference
  const multiplier = Math.pow(1.15, targetWeek - 40);
  const calculatedP50 = Math.round(baseWeight * multiplier);
  return {
    week: targetWeek,
    p10: Math.round(calculatedP50 * 0.85),
    p50: calculatedP50,
    p90: Math.round(calculatedP50 * 1.15)
  };
}
