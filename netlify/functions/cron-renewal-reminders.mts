// Netlify Scheduled Function — replaces the Vercel cron for /api/cron/renewal-reminders.
// Fires daily and hits the existing authenticated endpoint with the CRON_SECRET bearer.
export default async () => {
  const base = (process.env.APP_URL || process.env.URL || "").replace(/\/$/, "");
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.error("cron renewal-reminders: APP_URL/URL or CRON_SECRET not set");
    return new Response("missing config", { status: 500 });
  }
  const res = await fetch(`${base}/api/cron/renewal-reminders`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.text();
  console.log(`cron renewal-reminders → ${res.status} ${body.slice(0, 200)}`);
  return new Response(`renewal-reminders: ${res.status}`);
};

// Same schedule as the old vercel.json cron (daily 09:00 UTC).
export const config = { schedule: "0 9 * * *" };
