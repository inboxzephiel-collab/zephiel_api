"use client";

import { useActionState } from "react";
import { saveLegalSettings } from "@/server/actions/settings";
import type { FormState } from "@/server/actions/admin";
import { TextArea, Message, Submit } from "./Form";

export default function LegalSettingsForm({
  terms,
  privacy,
  gdpr,
}: {
  terms: string;
  privacy: string;
  gdpr: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(saveLegalSettings, null);

  return (
    <form action={formAction} className="space-y-6">
      <TextArea
        label="Terms of Service"
        hint="HTML allowed (h2, p, ul/li, a). Leave blank to show the built-in demo copy."
        name="terms"
        defaultValue={terms}
        rows={16}
        placeholder={"<h2>1. Using the platform</h2>\n<p>Your legal copy…</p>"}
      />
      <TextArea
        label="Privacy Policy"
        hint="HTML allowed. Leave blank to show the built-in demo copy."
        name="privacy"
        defaultValue={privacy}
        rows={16}
        placeholder={"<h2>What we collect</h2>\n<p>Your privacy copy…</p>"}
      />
      <TextArea
        label="GDPR"
        hint="HTML allowed. Leave blank to show the built-in demo copy."
        name="gdpr"
        defaultValue={gdpr}
        rows={16}
        placeholder={"<h2>Lawful basis</h2>\n<p>Your GDPR copy…</p>"}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Submit>Save legal pages</Submit>
        <Message state={state} />
      </div>
    </form>
  );
}
