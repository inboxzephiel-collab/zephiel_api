import "server-only";
import { getSettings } from "./settings";

export type Office = {
  /** City / region line, shown as the heading. e.g. "Akute, Ogun State". */
  city: string;
  /** Role label under the city. e.g. "Headquarters". */
  role: string;
  /** Country, shown next to the role in the compact footer. e.g. "Nigeria". */
  country: string;
  /** Full street address, one entry per line (contact page only). */
  lines: string[];
  /** Opening hours line (contact page). Blank hides it. */
  hours: string;
};

/** Defaults so a fresh install already shows a sensible office before anyone edits. */
export function defaultOffice(): Office {
  return {
    city: "Akute, Ogun State",
    role: "Headquarters",
    country: "Nigeria",
    lines: ["No. 6 Oremeta Street", "Alagbole, Akute", "Ogun State, Nigeria"],
    hours: "Mon–Fri, 9:00–18:00 WAT",
  };
}

/** Parse the stored JSON blob, falling back to defaults for anything missing or invalid. */
export function parseOffice(raw: string | undefined | null): Office {
  const d = defaultOffice();
  if (!raw) return d;
  try {
    const o = JSON.parse(raw) as Partial<Office>;
    const lines = Array.isArray(o.lines)
      ? o.lines.filter((l): l is string => typeof l === "string" && l.trim().length > 0)
      : d.lines;
    return {
      city: typeof o.city === "string" && o.city.trim() ? o.city.trim() : d.city,
      role: typeof o.role === "string" ? o.role.trim() : d.role,
      country: typeof o.country === "string" ? o.country.trim() : d.country,
      lines: lines.length ? lines : d.lines,
      hours: typeof o.hours === "string" ? o.hours.trim() : d.hours,
    };
  } catch {
    return d;
  }
}

/**
 * The office shown in the site footer and on the contact page.
 *
 * One place both read from, so an address change in the console updates the
 * whole site at once with no code change.
 */
export async function getOffice(): Promise<Office> {
  const settings = await getSettings().catch(() => ({}) as Record<string, string>);
  return parseOffice(settings.office_json);
}

/** Second footer line: "Headquarters · Nigeria" (either part may be blank). */
export function officeFooterLine(o: Office): string {
  return [o.role, o.country].filter(Boolean).join(" · ");
}
