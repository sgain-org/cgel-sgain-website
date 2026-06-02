import { ISO } from "@/lib/constants.ts";
import type { Initiative } from "@/lib/types.ts";

const HEADER_MAP: Record<string, keyof Initiative> = {
  "Case Code": "code",
  "Initiative name": "name",
  "Chinese Initiative Name (if applicable)": "name_zh",
  Acronym: "acronym",
  "Start year": "start_year",
  Status: "status",
  "End Year (if applicable)": "end_year",
  "Governance level": "governance",
  "Geographic scope": "region",
  "Brief description": "description",
  "First environmental problem addressed": "problem1",
  "Second environmental problem addressed": "problem2",
  "Broad environmental issues": "broad_issues",
  "SDGs covered": "sdg",
  "Primary initiative type": "type_primary",
  "Secondary initiative type": "type_secondary",
  "Lead Chinese actor name": "lead_actor",
  "Lead chinese actor type": "lead_actor_type",
  "Co-lead Chinese actor name": "colead_actor",
  "Primary international collaborator name": "collab_name",
  "Primary international collaborator type": "collab_type",
  "Origin of primary collaborator": "collab_origin",
  "Official Website": "website",
};

const PROBLEM_FIXES: Record<string, string> = {
  "Diesters & Humanitarian relief": "Disasters & Humanitarian Relief",
};

const ACTOR_TYPE_FIXES: Record<string, string> = {
  Government: "Central government",
};

const ORIGIN_PHRASE_FIXES: Record<string, string> = {
  "Korea, Dem. People's Rep.": "North Korea",
  "Korea, Rep.": "South Korea",
  "Iran, Islamic Rep.": "Iran",
};
const COUNTRY_ALIASES: Record<string, string> = {
  "United States": "United States of America",
  "Russian Federation": "Russia",
  "Republic of Korea": "South Korea",
  "Republic of India": "India",
  "Republic of Costa Rica": "Costa Rica",
  "Slovak Republic": "Slovakia",
  "State of Israel": "Israel",
  Nederlands: "Netherlands",
  Philippine: "Philippines",
  Hamburg: "Germany",
};

const EXTRA_COUNTRIES = ["Samoa", "Singapore"];
const KNOWN_COUNTRIES = new Set<string>([...Object.keys(ISO), ...EXTRA_COUNTRIES]);

const cell = (value: string | undefined): string => {
  const v = (value ?? "").trim();
  return v === "N/A" ? "" : v;
};

export const stripTypePrefix = (value: string): string => value.replace(/^\s*\d+-\s*/, "").trim();

function deriveCountries(origin: string): string[] {
  let s = origin;
  for (const [phrase, canonical] of Object.entries(ORIGIN_PHRASE_FIXES)) {
    s = s.split(phrase).join(canonical);
  }
  const seen = new Set<string>();
  for (const raw of s.split(/;|,| and /)) {
    const token = raw.trim();
    if (!token) continue;
    const name = COUNTRY_ALIASES[token] ?? token;
    if (KNOWN_COUNTRIES.has(name)) seen.add(name);
  }
  return [...seen].sort();
}

export function cleanRow(row: Record<string, string>): Initiative {
  const out = {} as Record<string, string | string[]>;
  for (const [header, field] of Object.entries(HEADER_MAP)) {
    out[field] = cell(row[header]);
  }

  out.region = (out.region as string).replace(/\.$/, "");
  out.type_primary = stripTypePrefix(out.type_primary as string);
  out.type_secondary = stripTypePrefix(out.type_secondary as string);
  for (const field of ["problem1", "problem2"] as const) {
    out[field] = PROBLEM_FIXES[out[field] as string] ?? out[field];
  }
  out.lead_actor_type = ACTOR_TYPE_FIXES[out.lead_actor_type as string] ?? out.lead_actor_type;

  out.countries = deriveCountries(out.collab_origin as string);
  return out as unknown as Initiative;
}
