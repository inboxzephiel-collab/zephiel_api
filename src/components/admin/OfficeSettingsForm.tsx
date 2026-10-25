"use client";

import { useActionState } from "react";
import { saveOfficeSettings } from "@/server/actions/settings";
import type { FormState } from "@/server/actions/admin";
import { Field, TextArea, Message, Submit } from "./Form";

export default function OfficeSettingsForm({
  city,
  role,
  country,
  address,
  hours,
}: {
  city: string;
  role: string;
  country: string;
  address: string;
  hours: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(saveOfficeSettings, null);

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City / region" name="city" defaultValue={city} placeholder="Akute, Ogun State" />
        <Field label="Role label" hint="e.g. Headquarters" name="role" defaultValue={role} placeholder="Headquarters" />
        <Field label="Country" name="country" defaultValue={country} placeholder="Nigeria" />
        <Field label="Opening hours" hint="optional" name="hours" defaultValue={hours} placeholder="Mon–Fri, 9:00–18:00 WAT" />
      </div>

      <TextArea
        label="Street address"
        hint="one line per row — shown on the contact page"
        name="address"
        rows={4}
        defaultValue={address}
        placeholder={"No. 6 Oremeta Street\nAlagbole, Akute\nOgun State, Nigeria"}
      />

      <p className="text-xs leading-6 text-muted">
        The footer shows <span className="font-medium text-ink">City</span> and{" "}
        <span className="font-medium text-ink">Role · Country</span>. The contact page shows the full
        address and hours.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Submit>Save office details</Submit>
        <Message state={state} />
      </div>
    </form>
  );
}
