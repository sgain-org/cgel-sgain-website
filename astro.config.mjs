// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { SITE_URL } from "./src/lib/site.ts";

export default defineConfig({
  site: SITE_URL,
  output: "static",
  build: {
    // output an index.html file in each directory instead of a single file in the root
    format: "directory",
  },
  integrations: [sitemap()],
});
