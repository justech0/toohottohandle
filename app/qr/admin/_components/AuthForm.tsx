"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "../actions";

export type Field = { name: string; label: string; type: "email" | "password" | "text"; autoComplete: string; hint?: string };

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="adm-btn adm-btn--main" disabled={pending} aria-busy={pending}>
      {pending ? "Bekle…" : label}
    </button>
  );
}

/** Giriş, kurulum ve sıfırlama formları aynı kalıbı kullanır. Hata metni ekran okuyucuya okunur. */
export function AuthForm({ action, fields, submit }: { action: (s: FormState, f: FormData) => Promise<FormState>; fields: Field[]; submit: string }) {
  const [state, formAction] = useActionState(action, { error: null });
  return (
    <form action={formAction} className="adm-form" noValidate>
      {fields.map((f) => (
        <label key={f.name} className="adm-field">
          {f.label}
          <input
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            defaultValue={f.type === "password" ? undefined : state.values?.[f.name]}
            required
            spellCheck={false}
            autoCapitalize="off"
          />
          {f.hint ? <span className="adm-note">{f.hint}</span> : null}
        </label>
      ))}
      <p role="alert" className={state.error ? "adm-error" : "sr-only"} data-testid="form-error">
        {state.error ?? ""}
      </p>
      <Submit label={submit} />
    </form>
  );
}
