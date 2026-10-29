"use client";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function ActionForm({ action, children, testId, reset = false }: { action: (form: FormData) => Promise<{ error?: string }>; children: ReactNode; testId?: string; reset?: boolean }) {
  const [message, setMessage] = useState<{ error?: string; saved?: boolean }>({});
  const [pending, startTransition] = useTransition();
  const router = useRouter(), ref = useRef<HTMLFormElement>(null);
  return <form ref={ref} className="adm-form" data-testid={testId} onSubmit={event => {
    event.preventDefault(); const data = new FormData(event.currentTarget); setMessage({});
    startTransition(async () => {
      try {
        const result = await action(data); setMessage(result.error ? result : { saved: true });
        if (!result.error) { if (reset) ref.current?.reset(); router.refresh(); }
      } catch { setMessage({ error: "Kaydedilemedi. Tekrar dene." }); }
    });
  }}>
    <fieldset className="adm-form-fields" disabled={pending} aria-busy={pending}>{children}</fieldset>
    {message.error ? <p className="adm-error" role="alert">{message.error}</p> : null}
    {message.saved ? <p className="adm-ok" role="status">Kaydedildi.</p> : null}
  </form>;
}
