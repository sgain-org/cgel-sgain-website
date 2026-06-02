import { readFileSync } from "node:fs";
import { join } from "node:path";
import { csvParse } from "d3";
import { cleanRow } from "@/lib/clean.ts";
import type { Initiative, Publication, WorldGeo } from "@/lib/types.ts";

const SOURCE_CSV = "data/initiatives.csv";

const PUBLICATIONS_CSV = "data/publications.csv";

const NON_VARIABLE_COLUMNS = ["Other Sources", "Comments"];

function parseCsv(relPath: string) {
  return csvParse(readFileSync(join(process.cwd(), relPath), "utf-8"));
}

function parseSource(): { rows: Record<string, string>[]; columns: string[] } {
  const rows = parseCsv(SOURCE_CSV);
  return { rows: rows as unknown as Record<string, string>[], columns: rows.columns };
}

export function readInitiatives(): Initiative[] {
  return parseSource()
    .rows.map(cleanRow)
    .sort((a, b) => (+a.code || 0) - (+b.code || 0));
}

export function readPublications(): Publication[] {
  const trim = (v: string | undefined) => (v ?? "").trim();
  return parseCsv(PUBLICATIONS_CSV).map((row) => ({
    authors: trim(row.authors),
    year: trim(row.year),
    title: trim(row.title),
    journal: trim(row.journal),
    volume: trim(row.volume),
    doi: trim(row.doi),
    url: trim(row.url),
  }));
}

export function variableCount(): number {
  return parseSource().columns.filter((c) => !NON_VARIABLE_COLUMNS.includes(c)).length;
}

export function readGeo(): WorldGeo {
  const json = readFileSync(join(process.cwd(), "data/world.geojson"), "utf-8");
  return JSON.parse(json) as WorldGeo;
}

export function summaryStats(data: Initiative[]): {
  initiativeCount: number;
  collaboratingCountryCount: number;
  regionCount: number;
} {
  return {
    initiativeCount: data.length,
    collaboratingCountryCount: new Set(data.flatMap((d) => d.countries || []).filter(Boolean)).size,
    regionCount: new Set(data.map((d) => d.region).filter(Boolean)).size,
  };
}

export function facetCounts(data: Initiative[], field: string): [string, number][] {
  const m: Record<string, number> = {};
  for (const d of data) {
    const v = d[field];
    const values = Array.isArray(v) ? v : v ? [v as string] : [];
    for (const item of values) if (item) m[item] = (m[item] || 0) + 1;
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
