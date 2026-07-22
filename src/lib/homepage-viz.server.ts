import * as d3 from "d3";
import { stripTypePrefix } from "@/lib/clean.ts";
import {
  ENVIRONMENTAL_PROBLEMS,
  GOVERNANCE_LEVELS,
  INITIATIVE_TYPES,
  ISO,
  REGIONS,
  YEAR_MAX,
  YEAR_MIN,
  YEARS,
} from "@/lib/constants.ts";
import type { Initiative, WorldFeature, WorldGeo } from "@/lib/types.ts";
import { clampYear, inYears, yrInt } from "@/lib/utils.ts";
import { govSymbol, MAP_RAMP, regionColor } from "@/lib/viz.ts";

interface ChartView {
  key: string;
  label: string;
  svg: string;
}

interface MapYearDatum {
  year: number | null;
  countries: string[];
}

type AttrValue = string | number | boolean | null | undefined;
type Attrs = Record<string, AttrValue>;
type YearRow = { year: number } & Record<string, number>;
type GovRow = Record<string, number>;

const MAP_WIDTH = 900;
const MAP_HEIGHT = 540;
const MAP_LEGEND_WIDTH = 52;
const MAP_LEGEND_BAR_WIDTH = 12;
const MAP_LEGEND_BAR_HEIGHT = 110;
const MAP_LEGEND_PAD = 4;
const MAP_LEGEND_STEPS = 40;

const MAP_EXCLUDED_COUNTRIES = new Set(["China"]);

const GOVERNANCE_VIEWS = [
  { key: "overall", label: "Overall", governance: null },
  { key: "bilateral", label: "Bilateral", governance: "Bilateral" },
  { key: "multilateral", label: "Multilateral", governance: "Multilateral" },
  { key: "transnational", label: "Transnational", governance: "Transnational" },
] as const;

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value: unknown): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(3).replace(/\.?0+$/, "");
}

function attrsToString(attrs: Attrs): string {
  return Object.entries(attrs)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => (value === true ? ` ${key}` : ` ${key}="${escapeAttr(value)}"`))
    .join("");
}

function tag(name: string, attrs: Attrs, children = ""): string {
  return `<${name}${attrsToString(attrs)}>${children}</${name}>`;
}

function svgRoot(width: number, height: number, label: string, body: string): string {
  return tag(
    "svg",
    {
      "aria-label": label,
      class: "chart",
      role: "img",
      viewBox: `0 0 ${width} ${height}`,
    },
    `${tag("title", {}, escapeHtml(label))}${body}`,
  );
}

function translate(x: number, y: number): string {
  return `translate(${formatNumber(x)},${formatNumber(y)})`;
}

function topRoundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const radius = Math.max(0, Math.min(r, w / 2, h));
  const n = formatNumber;
  return [
    `M${n(x)},${n(y + h)}`,
    `V${n(y + radius)}`,
    `Q${n(x)},${n(y)} ${n(x + radius)},${n(y)}`,
    `H${n(x + w - radius)}`,
    `Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + radius)}`,
    `V${n(y + h)}`,
    "Z",
  ].join("");
}

function browseLink(
  facets: Partial<Record<"type" | "gov" | "region" | "problem", string>>,
): string {
  const query = Object.entries(facets)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value as string)}`)
    .join("&");
  return `/browse/?${query}`;
}

function bandCenter<T extends string | number>(scale: d3.ScaleBand<T>, value: T): number {
  return (scale(value) ?? 0) + scale.bandwidth() / 2;
}

function renderBottomBandAxis<T extends string | number>(
  scale: d3.ScaleBand<T>,
  tickValues: T[],
  width: number,
  y: number,
  rotate = false,
): string {
  const ticks = tickValues
    .map((value) => {
      const textAttrs: Attrs = rotate
        ? {
            dx: "-4",
            dy: "6",
            "text-anchor": "end",
            transform: "rotate(-40)",
            y: 9,
          }
        : {
            dy: ".71em",
            "text-anchor": "middle",
            y: 9,
          };

      return tag(
        "g",
        { class: "tick", transform: translate(bandCenter(scale, value), 0) },
        `${tag("line", { y2: 6 })}${tag("text", textAttrs, escapeHtml(value))}`,
      );
    })
    .join("");

  return tag(
    "g",
    { class: "axis", transform: translate(0, y) },
    `${tag("path", { class: "domain", d: `M0.5,0.5H${formatNumber(width + 0.5)}` })}${ticks}`,
  );
}

function renderLeftAxis(
  scale: d3.ScaleLinear<number, number>,
  ticks: number[],
  height: number,
): string {
  const tickMarkup = ticks
    .map((value) =>
      tag(
        "g",
        { class: "tick", transform: translate(0, scale(value)) },
        `${tag("line", { x2: -6 })}${tag(
          "text",
          { dy: ".32em", x: -9, "text-anchor": "end" },
          escapeHtml(d3.format("d")(value)),
        )}`,
      ),
    )
    .join("");

  return tag(
    "g",
    { class: "axis" },
    `${tag("path", { class: "domain", d: `M0.5,${formatNumber(height)}V0.5` })}${tickMarkup}`,
  );
}

function renderRightAxis(
  scale: d3.ScaleLinear<number, number>,
  ticks: number[],
  formatter: (value: number) => string,
): string {
  return ticks
    .map((value) =>
      tag(
        "g",
        { class: "tick", transform: translate(0, scale(value)) },
        `${tag("line", { x2: 3 })}${tag(
          "text",
          { dy: ".32em", x: 6 },
          escapeHtml(formatter(value)),
        )}`,
      ),
    )
    .join("");
}

function renderTemporalRows(initiatives: Initiative[]): { rows: YearRow[]; govRows: GovRow[] } {
  const yearIndex = new Map(YEARS.map((year, index) => [year, index]));
  const rows = YEARS.map((year) => {
    const row = { year } as YearRow;
    for (const region of REGIONS) row[region] = 0;
    return row;
  });
  const govRows: GovRow[] = YEARS.map(() => ({
    Bilateral: 0,
    Multilateral: 0,
    Transnational: 0,
  }));

  for (const initiative of initiatives) {
    const year = yrInt(initiative);
    if (year === null) continue;

    const index = yearIndex.get(clampYear(year));
    if (index === undefined) continue;
    if ((REGIONS as readonly string[]).includes(initiative.region))
      rows[index][initiative.region]++;
    if (GOVERNANCE_LEVELS.includes(initiative.governance)) govRows[index][initiative.governance]++;
  }

  for (let i = 1; i < YEARS.length; i++) {
    for (const region of REGIONS) rows[i][region] += rows[i - 1][region];
    for (const governance of GOVERNANCE_LEVELS)
      govRows[i][governance] += govRows[i - 1][governance];
  }

  return { rows, govRows };
}

function renderTemporalSvg(initiatives: Initiative[], governance: string | null = null): string {
  const width = 800;
  const height = 440;
  const margin = { top: 14, right: 214, bottom: 36, left: 54 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const subset = governance ? initiatives.filter((d) => d.governance === governance) : initiatives;
  const { rows, govRows } = renderTemporalRows(subset);

  const x = d3.scaleBand<number>().domain(YEARS).range([0, innerWidth]).padding(0.18);
  const yMax = d3.max(rows, (row) => REGIONS.reduce((sum, region) => sum + row[region], 0)) ?? 1;
  const y = d3.scaleLinear().domain([0, yMax]).nice().range([innerHeight, 0]);
  const stack = d3.stack<YearRow>().keys(REGIONS)(rows);

  const axes = [
    renderBottomBandAxis(
      x,
      YEARS.filter((year) => year % 5 === 0),
      innerWidth,
      innerHeight,
    ),
    renderLeftAxis(y, y.ticks(4), innerHeight),
  ].join("");

  const axisLabel = tag(
    "text",
    {
      class: "axlabel",
      transform: "rotate(-90)",
      x: -(margin.top + innerHeight / 2),
      y: 14,
      "text-anchor": "middle",
    },
    "Cumulative number of initiatives",
  );

  const topSeriesByYear = new Map<number, number>();
  stack.forEach((series, seriesIndex) => {
    for (const point of series) {
      if (point[1] - point[0] > 0) topSeriesByYear.set(point.data.year, seriesIndex);
    }
  });

  const stacks = stack
    .map((series, seriesIndex) => {
      const bars = series
        .map((point) => {
          const year = point.data.year;
          const value = point.data[series.key] || 0;
          const tip = `<b>${escapeHtml(year)} · ${escapeHtml(series.key)}</b>${value} cumulative`;
          const height = Math.max(0, y(point[0]) - y(point[1]));
          const barX = x(year) ?? 0;
          const barY = y(point[1]);
          const width = x.bandwidth();
          if (height > 0 && topSeriesByYear.get(year) === seriesIndex) {
            return tag("path", {
              "data-tip": tip,
              d: topRoundedRectPath(barX, barY, width, height, 3),
            });
          }
          return tag("rect", { "data-tip": tip, height, width, x: barX, y: barY });
        })
        .join("");

      return tag("g", { fill: regionColor(series.key) }, bars);
    })
    .join("");

  const governanceLines = governance
    ? ""
    : GOVERNANCE_LEVELS.map((governanceName) => {
        const line = d3
          .line<GovRow>()
          .x((_, index) => bandCenter(x, YEARS[index]))
          .y((row) => y(row[governanceName]));
        const symbolPath = d3.symbol().type(govSymbol[governanceName]).size(14)() ?? "";
        const markers = govRows
          .map((row, index) =>
            tag("path", {
              d: symbolPath,
              fill: "var(--ink)",
              transform: translate(bandCenter(x, YEARS[index]), y(row[governanceName])),
            }),
          )
          .join("");

        return `${tag("path", {
          d: line(govRows) ?? "",
          fill: "none",
          stroke: "var(--ink)",
          "stroke-width": 1.4,
        })}${tag("g", {}, markers)}`;
      }).join("");

  const legendX = margin.left + innerWidth + 24;
  const regionLegend = tag(
    "g",
    { transform: translate(legendX, margin.top + 4) },
    `${tag("text", { class: "legtitle" }, "Geographic scope")}${REGIONS.map((region, index) =>
      tag(
        "a",
        { class: "chart-link", href: browseLink({ region }) },
        tag(
          "g",
          { transform: translate(0, 14 + index * 16) },
          `${tag("rect", {
            fill: regionColor(region),
            height: 11,
            width: 11,
          })}${tag("text", { class: "legtext", x: 16, y: 9.5 }, escapeHtml(region))}`,
        ),
      ),
    ).join("")}`,
  );
  const govLegend = governance
    ? ""
    : tag(
        "g",
        { transform: translate(legendX, margin.top + 4 + 14 + REGIONS.length * 16 + 18) },
        `${tag("text", { class: "legtitle" }, "Governance level")}${GOVERNANCE_LEVELS.map(
          (governanceName, index) =>
            tag(
              "a",
              { class: "chart-link", href: browseLink({ gov: governanceName }) },
              tag(
                "g",
                { transform: translate(0, 14 + index * 16) },
                `${tag("path", {
                  d: d3.symbol().type(govSymbol[governanceName]).size(24)() ?? "",
                  fill: "var(--ink)",
                  transform: "translate(5,5)",
                })}${tag("text", { class: "legtext", x: 16, y: 9.5 }, governanceName)}`,
              ),
            ),
        ).join("")}`,
      );

  return svgRoot(
    width,
    height,
    `Temporal evolution of Chinese-led initiatives — ${governance ?? "Overall"}`,
    `${axisLabel}${tag(
      "g",
      { transform: translate(margin.left, margin.top) },
      `${axes}${stacks}${governanceLines}`,
    )}${regionLegend}${govLegend}`,
  );
}

export function renderHeatmapSvg(initiatives: Initiative[]): string {
  const width = 720;
  const height = 430;
  const margin = { top: 16, right: 92, bottom: 54, left: 272 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const governanceTotals: Record<string, number> = {};

  for (const governance of GOVERNANCE_LEVELS) {
    governanceTotals[governance] = initiatives.filter((d) => d.governance === governance).length;
  }

  const share = (typeValue: string, governance: string) =>
    governanceTotals[governance]
      ? initiatives.filter((d) => d.governance === governance && d.type_primary === typeValue)
          .length / governanceTotals[governance]
      : 0;

  const x = d3.scaleBand<string>().domain(GOVERNANCE_LEVELS).range([0, innerWidth]).padding(0.04);
  const y = d3
    .scaleBand<string>()
    .domain(INITIATIVE_TYPES.map((type) => type[1]))
    .range([0, innerHeight])
    .padding(0.04);
  const maxShare =
    d3.max(INITIATIVE_TYPES, (type) => d3.max(GOVERNANCE_LEVELS, (gv) => share(type[0], gv))) ??
    0.4;
  const color = d3.scaleSequential(d3.interpolateBlues).domain([0, maxShare]);

  const cells = INITIATIVE_TYPES.flatMap(([typeValue, typeLabel]) =>
    GOVERNANCE_LEVELS.map((governance) => {
      const value = share(typeValue, governance);
      const tip = `<b>${escapeHtml(stripTypePrefix(typeLabel))} · ${escapeHtml(
        governance,
      )}</b>${(value * 100).toFixed(0)}% of ${escapeHtml(governance.toLowerCase())}`;
      const rect = tag("rect", {
        "data-tip": tip,
        fill: color(value),
        height: y.bandwidth(),
        rx: 4,
        stroke: "#fff",
        "stroke-width": 1.5,
        width: x.bandwidth(),
        x: x(governance) ?? 0,
        y: y(typeLabel) ?? 0,
      });
      return tag(
        "a",
        { class: "chart-link", href: browseLink({ gov: governance, type: typeValue }) },
        rect,
      );
    }),
  ).join("");

  const rowLabels = INITIATIVE_TYPES.map((type) =>
    tag(
      "text",
      {
        class: "rowlbl",
        dy: ".32em",
        x: -8,
        y: (y(type[1]) ?? 0) + y.bandwidth() / 2,
        "text-anchor": "end",
      },
      escapeHtml(type[1]),
    ),
  ).join("");

  const columnLabels = GOVERNANCE_LEVELS.map((governance) =>
    tag(
      "text",
      {
        class: "collbl",
        x: bandCenter(x, governance),
        y: innerHeight + 18,
        "text-anchor": "middle",
      },
      governance,
    ),
  ).join("");

  const legendHeight = innerHeight - 18;
  const legendScale = d3.scaleLinear().domain([0, maxShare]).range([legendHeight, 0]);
  const legendRects = Array.from({ length: 40 }, (_, index) =>
    tag("rect", {
      fill: color(maxShare * (1 - index / 40)),
      height: legendHeight / 40 + 1,
      width: 12,
      y: (legendHeight * index) / 40,
    }),
  ).join("");
  const legend = tag(
    "g",
    { transform: translate(margin.left + innerWidth + 26, margin.top) },
    `${tag("text", { class: "legtitle", y: -4 }, "Share")}${legendRects}${tag(
      "g",
      { class: "axis", transform: "translate(12,0)" },
      renderRightAxis(legendScale, legendScale.ticks(4), d3.format(".0%")),
    )}`,
  );

  return svgRoot(
    width,
    height,
    "Governance functions across multiple levels",
    `${tag(
      "g",
      { transform: translate(margin.left, margin.top) },
      `${cells}${rowLabels}${columnLabels}`,
    )}${tag(
      "text",
      {
        class: "axlabel",
        x: margin.left + innerWidth / 2,
        y: height - 6,
        "text-anchor": "middle",
      },
      "Governance scale",
    )}${legend}`,
  );
}

function renderProblemSvg(
  initiatives: Initiative[],
  governance: string | null,
  viewLabel: string,
): string {
  const width = 760;
  const height = 400;
  const margin = { top: 12, right: 14, bottom: 108, left: 54 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const subset = governance ? initiatives.filter((d) => d.governance === governance) : initiatives;
  const data = ENVIRONMENTAL_PROBLEMS.map(([value, label]) => ({
    count: subset.filter((d) => (d.problem1 || "").trim() === value).length,
    label,
    value,
  }));

  const x = d3
    .scaleBand<string>()
    .domain(data.map((d) => d.label))
    .range([0, innerWidth])
    .padding(0.2);
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.count) ?? 1])
    .nice()
    .range([innerHeight, 0]);
  const barColor = d3
    .scaleSequential(d3.interpolateBlues)
    .domain([0, d3.max(data, (d) => d.count) ?? 1]);

  const bars = data
    .map((d) => {
      const tip = `<b>${escapeHtml(d.label)}</b>${d.count} initiative${d.count !== 1 ? "s" : ""}`;
      const rect = tag("path", {
        class: "bar",
        "data-tip": tip,
        d: topRoundedRectPath(
          x(d.label) ?? 0,
          y(d.count),
          x.bandwidth(),
          innerHeight - y(d.count),
          3,
        ),
        fill: barColor(d.count),
      });
      if (!d.value) return rect;
      return tag(
        "a",
        {
          class: "chart-link",
          href: browseLink({ problem: d.value, gov: governance ?? undefined }),
        },
        rect,
      );
    })
    .join("");

  const axisLabel = tag(
    "text",
    {
      class: "axlabel",
      transform: "rotate(-90)",
      x: -(margin.top + innerHeight / 2),
      y: 14,
      "text-anchor": "middle",
    },
    "Number of initiatives",
  );

  return svgRoot(
    width,
    height,
    `${viewLabel} environmental problems chart`,
    `${axisLabel}${tag(
      "g",
      { transform: translate(margin.left, margin.top) },
      `${renderBottomBandAxis(
        x,
        data.map((d) => d.label),
        innerWidth,
        innerHeight,
        true,
      )}${renderLeftAxis(y, y.ticks(5), innerHeight)}${bars}`,
    )}`,
  );
}

export function renderProblemChartViews(initiatives: Initiative[]): ChartView[] {
  return GOVERNANCE_VIEWS.map((view) => ({
    key: view.key,
    label: view.label,
    svg: renderProblemSvg(initiatives, view.governance, view.label),
  }));
}

export function renderTemporalChartViews(initiatives: Initiative[]): ChartView[] {
  return GOVERNANCE_VIEWS.map((view) => ({
    key: view.key,
    label: view.label,
    svg: renderTemporalSvg(initiatives, view.governance),
  }));
}

function countryCounts(
  initiatives: Initiative[],
  ymin = YEAR_MIN,
  ymax = YEAR_MAX,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const initiative of initiatives) {
    if (!inYears(initiative, ymin, ymax)) continue;

    for (const country of initiative.countries) {
      if (MAP_EXCLUDED_COUNTRIES.has(country)) continue;
      counts[country] = (counts[country] || 0) + 1;
    }
  }

  return counts;
}

function renderMapLegendInner(max: number): string {
  const color = d3.scaleSequential(MAP_RAMP).domain([0, max]);
  const scale = d3
    .scaleLinear()
    .domain([0, max])
    .range([MAP_LEGEND_PAD + MAP_LEGEND_BAR_HEIGHT, MAP_LEGEND_PAD]);
  const rects = Array.from({ length: MAP_LEGEND_STEPS }, (_, index) =>
    tag("rect", {
      fill: color(max * (1 - index / MAP_LEGEND_STEPS)),
      height: MAP_LEGEND_BAR_HEIGHT / MAP_LEGEND_STEPS + 1,
      width: MAP_LEGEND_BAR_WIDTH,
      x: 0,
      y: MAP_LEGEND_PAD + (MAP_LEGEND_BAR_HEIGHT * index) / MAP_LEGEND_STEPS,
    }),
  ).join("");
  const clip = tag(
    "clipPath",
    { id: "maplegend-clip" },
    tag("rect", {
      height: MAP_LEGEND_BAR_HEIGHT,
      rx: 3,
      width: MAP_LEGEND_BAR_WIDTH,
      x: 0,
      y: MAP_LEGEND_PAD,
    }),
  );

  return `${tag("div", { class: "maplegend-title" }, "Collaborations")}${tag(
    "svg",
    {
      height: MAP_LEGEND_BAR_HEIGHT + MAP_LEGEND_PAD * 2,
      width: MAP_LEGEND_WIDTH,
    },
    `${clip}${tag("g", { "clip-path": "url(#maplegend-clip)" }, rects)}${tag(
      "g",
      { class: "axis", transform: `translate(${MAP_LEGEND_BAR_WIDTH},0)` },
      renderRightAxis(scale, scale.ticks(7), d3.format("d")),
    )}`,
  )}`;
}

function mapPath(feature: WorldFeature, path: d3.GeoPath): string {
  return path(feature as d3.GeoPermissibleObjects) ?? "";
}

function featureCentroid(feature: WorldFeature, path: d3.GeoPath): [number, number] | null {
  const [x, y] = path.centroid(feature as d3.GeoPermissibleObjects);
  return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
}

export function renderMapSvg(initiatives: Initiative[], geo: WorldGeo): string {
  const counts = countryCounts(initiatives);
  const max = Math.max(1, ...Object.values(counts));
  const color = d3.scaleSequential(MAP_RAMP).domain([0, max]);
  const projection = d3.geoNaturalEarth1().fitExtent(
    [
      [6, 10],
      [MAP_WIDTH - 6, MAP_HEIGHT - 14],
    ],
    geo as d3.GeoPermissibleObjects,
  );
  const path = d3.geoPath(projection);

  const countries = geo.features
    .map((feature) => {
      const name = feature.properties.name;
      const code = ISO[name] || "";
      const count = counts[name] || 0;
      return tag("path", {
        class: `country${count ? "" : " nodata"}`,
        "data-code": code,
        "data-count": count,
        "data-country": name,
        d: mapPath(feature, path),
        fill: count ? color(count) : "#eef1f3",
      });
    })
    .join("");

  const labels = geo.features
    .map((feature) => {
      const name = feature.properties.name;
      const code = ISO[name];
      const centroid = code ? featureCentroid(feature, path) : null;
      if (!centroid) return "";

      return tag(
        "text",
        {
          class: "isolbl",
          "data-country": name,
          dy: ".32em",
          style: counts[name] ? undefined : "display: none",
          transform: translate(centroid[0], centroid[1]),
        },
        code,
      );
    })
    .join("");

  return `${tag(
    "svg",
    {
      "aria-label": "Map of collaborating countries",
      class: "map-svg",
      role: "img",
      viewBox: `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`,
    },
    `${tag("title", {}, "Map of collaborating countries")}${tag(
      "g",
      { class: "zoom-layer" },
      `${tag("g", {}, countries)}${tag("g", {}, labels)}`,
    )}`,
  )}${tag("div", { class: "maplegend", id: "maplegend" }, renderMapLegendInner(max))}`;
}

export function buildMapYearData(initiatives: Initiative[]): MapYearDatum[] {
  return initiatives.map((initiative) => ({
    countries: (initiative.countries || []).filter(
      (country) => country && !MAP_EXCLUDED_COUNTRIES.has(country),
    ),
    year: yrInt(initiative),
  }));
}
