import * as d3 from "d3";
import { REGIONS } from "@/lib/constants.ts";

export const regionColor = d3
  .scaleOrdinal<string>()
  .domain(REGIONS)
  .range(d3.quantize((t) => d3.interpolateBlues(0.28 + 0.62 * t), REGIONS.length));

export const govSymbol: Record<string, d3.SymbolType> = {
  Bilateral: d3.symbolCircle,
  Multilateral: d3.symbolTriangle,
  Transnational: d3.symbolSquare,
};

export const MAP_RAMP = d3.interpolateBlues;
