"use client";

// Forgot password: sends a reset link (Firebase sendPasswordResetEmail in db.js).
import { useState } from "react";
import { Button, Header, Input, Note, Page } from "@/components/ui";
import { useT } from "@/components/LangProvider";
import { resetPassword } from "@/lib/data";

export default function Forgot() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const [err, setErr] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!email.includes("@")) return setErr(t("authInvalid"));
    setErr("");
    setState("sending");
    try {
      await resetPassword(email.trim());
    } catch {
      // Same message either way, so the page never reveals which emails have accounts.
    }
    setState("sent");
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col" noValidate>
      <Header title={t("forgotTitle")} back="/login" />
      <Page narrow className="gap-4">
        <p className="text-[15px] text-muted">{t("forgotBody")}</p>
        <Input label={t("email")} type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={err} />
        {state === "sent" ? (
          <Note icon="check">{t("resetSent", { email: email.trim() })}</Note>
        ) : (
          <Button type="submit" disabled={state === "sending"}>{state === "sending" ? t("sending") : t("sendLink")}</Button>
        )}
        <Button variant="secondary" href="/login">{t("backToLogin")}</Button>
      </Page>
    </form>
  );
}
