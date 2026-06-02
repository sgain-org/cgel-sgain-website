import Fuse from "fuse.js";
import type { Initiative } from "@/lib/types.ts";

export function createInitiativeSearch(data: Initiative[]): (query: string) => string[] {
  const fuse = new Fuse(data, {
    keys: ["name", "name_zh", "acronym", "lead_actor", "collab_name", "countries"],
    useExtendedSearch: true,
    ignoreLocation: true,
    threshold: 0.3,
  });
  return (query: string) => fuse.search(query).map((r) => r.item.code);
}
