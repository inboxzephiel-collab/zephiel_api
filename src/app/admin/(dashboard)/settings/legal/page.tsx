import { getSettings } from "@/lib/settings";
import { Card } from "@/components/admin/PageHeader";
import LegalSettingsForm from "@/components/admin/LegalSettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Legal pages · Settings" };

export default async function LegalSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-4">
      <Card title="Legal pages" padded>
        <p className="mb-5 text-sm leading-6 text-muted">
          Paste your reviewed <span className="font-medium text-ink">Terms of Service</span>,{" "}
          <span className="font-medium text-ink">Privacy Policy</span> and{" "}
          <span className="font-medium text-ink">GDPR</span> copy here. Once saved, each public page shows
          your text instead of the built-in demo placeholder — the demo disclaimer is removed
          automatically. Leave a box blank to restore the built-in copy for that page.
        </p>
        <LegalSettingsForm
          terms={settings.legal_terms ?? ""}
          privacy={settings.legal_privacy ?? ""}
          gdpr={settings.legal_gdpr ?? ""}
        />
      </Card>
    </div>
  );
}
