// @ts-check
import cloudflare from "@astrojs/cloudflare";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

const CANONICAL_URL = "https://cgel.sgain.org";

// Hostinger serves plain static files, so it gets no adapter.
const isHostinger = process.env.DEPLOY_TARGET === "hostinger";

export default defineConfig({
  site: CANONICAL_URL,
  output: "static",
  build: {
    // index.html per directory, not a flat file per page
    format: "directory",
  },
  integrations: [sitemap()],
  ...(isHostinger ? {} : { adapter: cloudflare() }),
});
