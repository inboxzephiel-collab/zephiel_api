import "server-only";
import { sql } from "@/lib/db";
import { SCHEMA_SQL } from "./schema-embed";

/** Tables the application expects, in dependency order. */
export const EXPECTED_TABLES = [
  "categories",
  "apis",
  "plans",
  "endpoints",
  "users",
  "sessions",
  "api_keys",
  "subscriptions",
  "payments",
  "usage_events",
  "settings",
  "stores",
  "notifications",
  "reviews",
  "password_resets",
  "posts",
  "newsletter_subscribers",
  "usage_daily",
] as const;

/** Columns added after their table was first created, which drift most often. */
export const EXPECTED_COLUMNS: { table: string; column: string }[] = [
  { table: "apis", column: "icon" },
  { table: "stores", column: "domain" },
  { table: "reviews", column: "author_name" },
  { table: "api_keys", column: "store_id" },
  { table: "usage_events", column: "store_id" },
  { table: "subscriptions", column: "demo_traffic" },
  { table: "stores", column: "domain" },
  { table: "reviews", column: "author_name" },
];

export type SchemaStatus = {
  missingTables: string[];
  missingColumns: string[];
  upToDate: boolean;
};

export async function getSchemaStatus(): Promise<SchemaStatus> {
  const tables = await sql<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  `;
  const present = new Set(tables.map((t) => t.table_name));
  const missingTables = EXPECTED_TABLES.filter((t) => !present.has(t));

  const columns = await sql<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'
  `;
  const columnSet = new Set(columns.map((c) => `${c.table_name}.${c.column_name}`));

  const missingColumns = EXPECTED_COLUMNS.filter(
    (c) => present.has(c.table) && !columnSet.has(`${c.table}.${c.column}`)
  ).map((c) => `${c.table}.${c.column}`);

  return {
    missingTables,
    missingColumns,
    upToDate: missingTables.length === 0 && missingColumns.length === 0,
  };
}

/**
 * Apply db/schema.sql. It is idempotent — every statement is IF NOT EXISTS —
 * so running it against an up-to-date database is a no-op.
 */
export async function applySchema() {
  // SCHEMA_SQL is generated from db/schema.sql at build (scripts/embed-schema.mjs) so this works on
  // Cloudflare Workers, which have no filesystem. The CLI `npm run db:migrate` still reads the file.
  await sql.unsafe(SCHEMA_SQL);
}
