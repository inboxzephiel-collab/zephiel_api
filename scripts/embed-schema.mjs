/* Embeds db/schema.sql into a TS module so the in-app "run migrations" action works on
 * Cloudflare Workers, which have no filesystem. Runs automatically before `build` (prebuild).
 * db/schema.sql stays the single source of truth; this just generates a bundled copy. */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve("db/schema.sql"), "utf8");
const out =
  "// AUTO-GENERATED from db/schema.sql by scripts/embed-schema.mjs — do not edit by hand.\n" +
  "export const SCHEMA_SQL = " + JSON.stringify(sql) + ";\n";
writeFileSync(resolve("src/server/schema-embed.ts"), out);
console.log(`embedded db/schema.sql -> src/server/schema-embed.ts (${sql.length} chars)`);
