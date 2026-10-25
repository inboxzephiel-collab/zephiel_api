import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Lets `next dev` talk to the Cloudflare bindings (ASSETS, env) locally. No-op in production builds.
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root so an unrelated lockfile in a parent directory
  // can't be inferred as the project root.
  turbopack: { root: import.meta.dirname },
  // The schema SQL is embedded at build (scripts/embed-schema.mjs → src/server/schema-embed.ts) so the
  // in-app migrate action works on Workers (no filesystem); no runtime file tracing needed.
};

export default nextConfig;
