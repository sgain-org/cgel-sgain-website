export interface ParsedSdg {
  n: number;
  title: string;
  label: string;
}

export function parseSdgs(value: string): ParsedSdg[] {
  const seen = new Set<number>();
  const sdgs: ParsedSdg[] = [];

  for (const part of value.split(";")) {
    const match = part.match(/SDG\s*(\d+)\s*\(([^)]*)\)/i);
    if (!match) continue;

    const n = Number(match[1]);
    if (!Number.isInteger(n) || seen.has(n)) continue;

    const title = match[2].replace(/\s+/g, " ").trim();
    if (!title) continue;

    sdgs.push({
      n,
      title,
      label: `SDG ${n}: ${title}`,
    });
    seen.add(n);
  }

  return sdgs;
}
