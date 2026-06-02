import { YEAR_MAX, YEAR_MIN } from "@/lib/constants.ts";
import type { Initiative } from "@/lib/types.ts";

export const yrInt = (d: Initiative): number | null => {
  const n = parseInt(d.start_year, 10);
  return Number.isNaN(n) ? null : n;
};

export function inYears(d: Initiative, ymin: number, ymax: number): boolean {
  const y = yrInt(d);
  if (y === null) return true;
  return y >= ymin && y <= ymax;
}

export const clampYear = (y: number): number => Math.max(YEAR_MIN, Math.min(YEAR_MAX, y));
