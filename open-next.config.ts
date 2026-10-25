import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Runs the Next.js app on Cloudflare Workers (Node.js runtime via nodejs_compat).
// Default config is enough here: the app's DB access (postgres.js → Supabase pooler)
// and API routes run on the Node runtime; static assets are served by the ASSETS binding.
export default defineCloudflareConfig({});
