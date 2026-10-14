// Netlify Scheduled Function — replaces the Vercel cron for /api/cron/usage-rollup.
// Vercel Cron does not run on Netlify; this fires on the same daily schedule and hits the
// existing authenticated endpoint with the CRON_SECRET bearer. Configure CRON_SECRET + APP_URL
// (or rely on Netlify's auto-provided URL) in the site's environment variables.
export default async () => {
  const base = (process.env.APP_URL || process.env.URL || "").replace(/\/$/, "");
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("cron usage-rollup: APP_URL/URL or CRON_SECRET not set");
    return new Response("missing config", { status: 500 });
  }
  const res = await fetch(`${base}/api/cron/usage-rollup`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log(`cron usage-rollup → ${res.status} ${body.slice(0, 200)}`);
  return new Response(`usage-rollup: ${res.status}`);
};

// Same schedule as the old vercel.json cron (daily 00:10 UTC).
export const config = { schedule: "10 0 * * *" };
