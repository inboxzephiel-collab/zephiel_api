import { getSquadConfig } from "@/lib/squad";
import { getSettings } from "@/lib/settings";
import { appUrl } from "@/lib/app-url";
import { parseOffice } from "@/lib/office";
import { Card } from "@/components/admin/PageHeader";
import PlatformSettingsForm from "@/components/admin/PlatformSettingsForm";
import OfficeSettingsForm from "@/components/admin/OfficeSettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Platform · Settings" };

export default async function PlatformSettingsPage() {
  const [config, settings] = await Promise.all([getSquadConfig(), getSettings()]);
  const office = parseOffice(settings.office_json);

  return (
    <div className="space-y-4">
      <Card title="Platform" padded>
        <PlatformSettingsForm
          platformName={settings.platform_name ?? "Zephiel API"}
          supportEmail={settings.support_email ?? ""}
        />
      </Card>

      <Card title="Office / contact details" padded>
        <OfficeSettingsForm
          city={office.city}
          role={office.role}
          country={office.country}
          address={office.lines.join("\n")}
          hours={office.hours}
        />
      </Card>

      <Card title="Environment" padded>
        <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          {[
            { label: "Site origin", value: appUrl() },
            { label: "Charge currency", value: config.currency },
            {
              label: "USD conversion",
              value: config.currency === "USD" ? "Not applied" : `1 USD = ${config.usdToNgn.toLocaleString()} ${config.currency}`,
            },
            { label: "Gateway base", value: `${appUrl()}/api/v1` },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-4 border-b border-line pb-2">
              <dt className="text-muted">{row.label}</dt>
              <dd className="truncate text-right font-medium text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
