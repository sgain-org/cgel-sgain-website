export const SITE_URL = "https://cgel.sgain.org";

export const SITE_KEYWORDS =
  "China environmental governance, cross-border environmental initiatives, Chinese environmental leadership, global environmental governance, transnational environmental governance, CGEL database, SGAIN, China climate policy, environmental governance database";

export function makeUrl(site?: URL): (path: string) => string {
  const base = site ?? new URL(SITE_URL);
  return (path: string) => new URL(path, base).href;
}

export function buildMailto(
  email: string,
  { subject, body }: { subject?: string; body?: string } = {},
): string {
  const parts: string[] = [];
  if (subject) parts.push(`subject=${encodeURIComponent(subject)}`);
  if (body) parts.push(`body=${encodeURIComponent(body)}`);
  return parts.length ? `mailto:${email}?${parts.join("&")}` : `mailto:${email}`;
}
