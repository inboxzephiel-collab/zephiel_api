import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Zephiel API collects, uses, and retains personal data.",
};

// Re-read each request so admin edits (Settings → Legal pages) show without a redeploy.
export const dynamic = "force-dynamic";

const sections = [
  {
    h: "1. What we collect",
    p: "Account details (name, email, hashed password), API credentials (a prefix and a hashed digest of each key), request metadata (timestamp, endpoint, status code, latency), billing records, and basic server logs (IP address, user agent). We do not collect request or response bodies except where you explicitly enable debug logging, which expires after seven days.",
  },
  {
    h: "2. How we use it",
    p: "To run and secure your account, authenticate and meter API calls, enforce quotas, take payment, meet our accounting obligations, and prevent abuse. We do not sell personal data and do not use it to train models.",
  },
  {
    h: "3. Third-party providers",
    p: "When you call a provider's API, the request payload is forwarded to that provider; each listing names its provider so you can assess where your data goes before subscribing. We also use processors for hosting, database, email, and payments — these are listed on the GDPR page.",
  },
  {
    h: "4. Retention",
    p: "Account data is kept until you delete your account; billing records are kept for the statutory period; request metadata is kept for 13 months and then aggregated; server logs for 30 days. See the GDPR page for the full retention table.",
  },
  {
    h: "5. Your rights",
    p: "You can access, correct, export, or delete your personal data, and object to or restrict certain processing. The detail and how to exercise each right are on our GDPR page.",
  },
  {
    h: "6. Contact",
    p: "Questions about your data? Email info@zephiel.com and we will respond within 30 days.",
  },
];

export default async function PrivacyPage() {
  const settings = await getSettings();
  const custom = (settings.legal_privacy ?? "").trim();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Privacy Policy</h1>

      {custom ? (
        // Admin-authored copy (Settings → Legal pages) fully replaces the demo text + disclaimer.
        <div
          className="mt-8 space-y-4 text-sm leading-7 text-muted [&_a]:text-brand-600 [&_a]:underline [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-ink [&_li]:mt-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: custom }}
        />
      ) : (
        <>
          <p className="mt-3 text-sm text-muted">Last updated August 26, 2026</p>

          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
            <p className="text-sm leading-6 text-muted">
              This is placeholder copy for a demo project, not legal advice. Replace it with a privacy
              policy reviewed by a qualified lawyer before running a real service.
            </p>
          </div>

          <div className="mt-10 space-y-8">
            {sections.map((s) => (
              <section key={s.h}>
                <h2 className="text-base font-semibold tracking-tight text-ink">{s.h}</h2>
                <p className="mt-2 text-sm leading-7 text-muted">{s.p}</p>
              </section>
            ))}
          </div>

          <p className="mt-10 text-sm text-muted">
            For the full data-protection detail, see our{" "}
            <Link href="/legal/gdpr" className="font-medium text-brand-600 hover:underline">
              GDPR page
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}
