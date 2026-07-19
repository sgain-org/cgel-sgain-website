import { csvParseRows } from "d3";
import { cleanRow } from "@/lib/clean.ts";
import type { Initiative, Publication, WorldGeo } from "@/lib/types.ts";

// Inlined at build time: the Cloudflare prerender runtime (workerd) has no `node:fs`.
import initiativesCsv from "../../data/initiatives.csv?raw";
import publicationsCsv from "../../data/publications.csv?raw";
import worldGeoJson from "../../data/world.geojson?raw";

const NON_VARIABLE_COLUMNS = ["Other Sources", "Comments"];

// `csvParseRows` avoids d3's `new Function` row accessor, which workerd blocks.
function parseDelimited(text: string): { rows: Record<string, string>[]; columns: string[] } {
  const [columns = [], ...body] = csvParseRows(text);
  const rows = body.map((cells) => {
    const row: Record<string, string> = {};
    columns.forEach((name, i) => {
      row[name] = cells[i] ?? "";
    });
    return row;
  });
  return { rows, columns };
}

function parseSource(): { rows: Record<string, string>[]; columns: string[] } {
  return parseDelimited(initiativesCsv);
}

export function readInitiatives(): Initiative[] {
  return parseSource()
    .rows.map(cleanRow)
    .sort((a, b) => (+a.code || 0) - (+b.code || 0));
}

export function readPublications(): Publication[] {
  const trim = (v: string | undefined) => (v ?? "").trim();
  return parseDelimited(publicationsCsv).rows.map((row) => ({
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
  return JSON.parse(worldGeoJson) as WorldGeo;
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
