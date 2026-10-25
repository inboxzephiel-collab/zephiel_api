// NOTE: we deliberately do NOT call initOpenNextCloudflareForDev() here. With a Hyperdrive binding it
// throws during `next build` (it wants a local Postgres string to emulate Hyperdrive), and it's only for
// `next dev`. The deployed Worker gets bindings from OpenNext's getCloudflareContext() natively, and local
// dev falls back to DATABASE_URL in src/lib/db.ts — so it isn't needed either way.

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
