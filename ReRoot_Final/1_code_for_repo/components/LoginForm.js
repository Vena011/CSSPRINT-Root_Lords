"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, LangToggle, Note } from "./ui";
import { homeFor } from "./hooks";
import { useT } from "./LangProvider";
import { signIn, signUp } from "@/lib/data";

export default function LoginForm() {
  const t = useT();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [mode, setMode] = useState("login"); // login | signup
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (!f.email.includes("@") || f.password.length < 6) return setErr(t("authInvalid"));
    setBusy(true);
    try {
      if (mode === "login") {
        const user = await signIn(f.email, f.password);
        const dest = homeFor(user);
        router.replace(user?.role && next && next.startsWith("/") ? next : dest);
      } else {
        await signUp(f.email, f.password);
        router.replace("/onboarding");
      }
    } catch (e2) {
      setBusy(false);
      const m = String(e2?.message || e2?.code || "");
      setErr(m.includes("EMAIL_IN_USE") || m.includes("email-already-in-use") ? t("emailInUse") : t("loginError"));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3.5 p-4 md:p-6" noValidate>
      <div className="flex items-center justify-between">
        <Image src="/logo-mark.svg" alt="ReRoot" width={64} height={64} priority />
        <LangToggle />
      </div>
      <h1 className="text-[28px] font-extrabold leading-tight">{mode === "login" ? t("authTitleLogin") : t("authTitleSignup")}</h1>
      <p className="text-[15px] text-muted">{t("authPitch")}</p>

      <div className="flex gap-1 rounded-control border-[1.5px] border-line bg-surface p-1" role="tablist">
        {[["login", "logIn"], ["signup", "signUpTab"]].map(([m, k]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr(""); }} className={`h-11 flex-1 rounded-[9px] text-sm font-bold ${mode === m ? "bg-primary text-white" : "text-muted"}`}>
            {t(k)}
          </button>
        ))}
      </div>

      <Input label={t("email")} type="email" placeholder="you@email.com" value={f.email} onChange={set("email")} autoComplete="email" />
      <Input label={t("password")} type="password" placeholder="••••••••" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      {mode === "login" && (
        <Link href="/forgot" className="-mt-1 self-end text-[13px] font-semibold text-primary hover:underline">{t("forgotLink")}</Link>
      )}
      {mode === "signup" && <p className="-mt-1 text-[13px] text-muted">{t("signupNext")}</p>}
      {mode === "signup" && (
        <p className="text-[13px] text-muted">
          {t("agreeTerms")} <Link href="/terms" className="font-semibold text-primary hover:underline">{t("terms")}</Link> {t("and")}{" "}
          <Link href="/privacy" className="font-semibold text-primary hover:underline">{t("privacy")}</Link>.
        </p>
      )}
      {err && <Note tone="red" icon="alert">{err}</Note>}
      <Button type="submit" disabled={busy}>{mode === "login" ? t("logIn") : t("createAccount")}</Button>

      <div className="my-1 flex items-center gap-3 text-[13px] text-muted">
        <span className="h-px flex-1 bg-line" /> {t("or")} <span className="h-px flex-1 bg-line" />
      </div>
      <Button variant="secondary" href="/">{t("continueGuest")}</Button>
      <p className="text-center text-[13px] text-muted">{t("guestNote")}</p>
      <p className="text-center text-xs text-muted">
        {t("demoAccounts")}{" "}
        {["nena@reroot.test", "student@reroot.test"].map((em, i) => (
          <span key={em}>
            {i > 0 && " · "}
            <Link href="#" onClick={(e) => { e.preventDefault(); setF({ email: em, password: "demo1234" }); setMode("login"); }} className="font-semibold text-primary">{em}</Link>
          </span>
        ))}
      </p>
    </form>
  );
}
