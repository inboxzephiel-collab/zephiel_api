import "server-only";
import postgres from "postgres";
import { getCloudflareContext } from "@opennextjs/cloudflare";

type Client = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __zephielSql: Client | undefined;
}

const MISSING_URL =
  "No database connection string. On Cloudflare, bind a Hyperdrive (HYPERDRIVE) to the Worker; " +
  "elsewhere set DATABASE_URL. Locally, copy .env.example to .env.local and point DATABASE_URL at " +
  "your database, then run `npm run db:migrate`.";

type CfCtx = {
  env?: { HYPERDRIVE?: { connectionString?: string } };
  // The per-request ExecutionContext. It is a fresh object for each request, so we key the
  // database client to it (below) to guarantee a client is never reused across requests.
  ctx?: { waitUntil?: (p: Promise<unknown>) => void } | undefined;
};

/**
 * On Cloudflare Workers, an I/O object (here, a Postgres socket) opened while handling one request
 * CANNOT be used by another request — doing so throws "Cannot perform I/O on behalf of a different
 * request", surfacing as a Worker 1101 exception. So the usual "cache one client on a module global"
 * pattern fails intermittently: it works only when a request happens to land on the isolate that
 * opened the socket.
 *
 * The fix: on Workers, open a fresh client per request and key it to that request's ExecutionContext
 * via a WeakMap. Within a request every `sql` use shares one client; across requests they never do.
 * Cloudflare Hyperdrive pools the real connections on its side, so a client-per-request is cheap.
 *
 * We deliberately do NOT call client.end() after the response: SSR/RSC pages stream, so they keep
 * querying after the initial Response resolves — ending the client in ctx.waitUntil would close the
 * socket mid-stream and fail those queries. Instead the idle sockets close on idle_timeout and the
 * WeakMap entry (and client) are collected once the request's ExecutionContext is.
 *
 * Off Workers (local dev, CLI scripts, any Node host) getCloudflareContext() throws — there we keep a
 * single cached client on the module global, which is correct for a long-lived process.
 */
const perRequestClients = new WeakMap<object, Client>();

function makeClient(url: string, viaHyperdrive: boolean): Client {
  return postgres(url, {
    // Hyperdrive does the real pooling, so a small per-request client is plenty. On a direct
    // (non-Hyperdrive) connection, keep the single long-lived pool in production.
    max: viaHyperdrive ? 2 : process.env.NODE_ENV === "production" ? 1 : 5,
    idle_timeout: 20,
    connect_timeout: 15,
    // Supabase's transaction pooler (and most serverless poolers) don't support prepared statements —
    // postgres.js uses them by default, so disable them. Harmless on a direct/session connection.
    prepare: false,
    // Hyperdrive proxies the connection inside the Worker and manages TLS to the origin itself, so the
    // Worker→Hyperdrive hop must NOT use TLS. A direct hosted connection does require TLS; localhost doesn't.
    ssl: viaHyperdrive
      ? false
      : url.includes("localhost") || url.includes("127.0.0.1")
        ? false
        : "require",
  });
}

function connect(): Client {
  // --- Cloudflare Workers runtime: Hyperdrive binding, one client per request. ---
  try {
    const cf = getCloudflareContext() as unknown as CfCtx;
    const conn = cf?.env?.HYPERDRIVE?.connectionString;
    if (conn) {
      const key = cf.ctx as object | undefined;
      if (key) {
        const existing = perRequestClients.get(key);
        if (existing) return existing;
        const client = makeClient(conn, true);
        perRequestClients.set(key, client);
        return client;
      }
      // Hyperdrive is bound but no per-request handle is available — fall back to a cached client.
      if (global.__zephielSql) return global.__zephielSql;
      const client = makeClient(conn, true);
      global.__zephielSql = client;
      return client;
    }
  } catch {
    // Not running under the Cloudflare runtime (dev/CLI) — use DATABASE_URL below.
  }

  // --- Everywhere else: single cached client from DATABASE_URL. ---
  if (global.__zephielSql) return global.__zephielSql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error(MISSING_URL);
  const client = makeClient(url, false);
  global.__zephielSql = client;
  return client;
}

/**
 * The connection is opened on first use rather than at module load.
 *
 * `next build` evaluates every module while collecting page data, so
 * connecting eagerly would make a missing DATABASE_URL fail the build itself —
 * even though no page queries anything at build time. Deferring it means a
 * misconfigured environment surfaces as a clear runtime error on the request
 * that actually needs the database.
 */
export const sql = new Proxy((() => {}) as unknown as Client, {
  apply(_target, _thisArg, args: Parameters<Client>) {
    return Reflect.apply(connect() as (...a: unknown[]) => unknown, undefined, args);
  },
  get(_target, prop: string | symbol) {
    const client = connect() as unknown as Record<string | symbol, unknown>;
    const value = client[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as Client;
