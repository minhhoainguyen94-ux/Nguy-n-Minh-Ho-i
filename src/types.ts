/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FetalWeightReference {
  week: number;
  p10: number; // 10th percentile in grams
  p50: number; // 50th percentile (average) in grams
  p90: number; // 90th percentile in grams
}

export interface AssessmentResult {
  weeks: number;
  days: number;
  totalDays: number;
  efw: number;
  ref: FetalWeightReference;
  evaluation: "Thai nhỏ hơn tuổi thai" | "Thai phát triển phù hợp tuổi thai" | "Thai lớn hơn tuổi thai";
  report: string;
}

