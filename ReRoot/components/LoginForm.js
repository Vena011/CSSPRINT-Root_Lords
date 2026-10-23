"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Icon, Input, LangToggle, Note } from "./ui";
import { homeFor } from "./hooks";
import { useT } from "./LangProvider";
import { signIn, signUp } from "@/lib/data";

export default function LoginForm() {
  const t = useT();
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [mode, setMode] = useState("login"); // login | signup
  const [f, setF] = useState({ email: "", password: "" });
  const [role, setRole] = useState(null); // sign-up: student | vendor
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    if (mode === "signup" && !role) return setErr(t("pickRole"));
    if (!f.email.includes("@") || f.password.length < 6) return setErr(t("authInvalid"));
    setBusy(true);
    try {
      if (mode === "login") {
        const user = await signIn(f.email, f.password);
        const dest = homeFor(user);
        router.replace(user?.role && next && next.startsWith("/") ? next : dest);
      } else {
        await signUp(f.email, f.password);
        try {
          localStorage.setItem("reroot-signup-role", role);
        } catch {}
        router.replace(`/onboarding?role=${role}`);
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
      <h1 key={`h-${mode}`} className="rr-swap text-[28px] font-extrabold leading-tight">{mode === "login" ? t("authTitleLogin") : t("authTitleSignup")}</h1>
      <p className="text-[15px] text-muted">{t("authPitch")}</p>

      <div className="relative flex gap-1 rounded-control border-[1.5px] border-line bg-surface p-1" role="tablist">
        {/* sliding highlight: moves between the two tabs */}
        <span
          aria-hidden="true"
          className="rr-tab-pill absolute bottom-1 left-1 top-1 rounded-[9px] bg-primary shadow-sm"
          style={{ width: "calc(50% - 6px)", transform: mode === "signup" ? "translateX(calc(100% + 4px))" : "translateX(0)" }}
        />
        {[["login", "logIn"], ["signup", "signUpTab"]].map(([m, k]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErr(""); }} className={`relative z-10 h-11 flex-1 rounded-[9px] text-sm font-bold transition-colors duration-300 ${mode === m ? "text-white" : "text-muted hover:text-ink"}`}>
            {t(k)}
          </button>
        ))}
      </div>

      {mode === "signup" && (
        <fieldset className="rr-expand flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-semibold">{t("signupAs")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {[["student", "bowl", "roleStudentShort"], ["vendor", "store", "roleVendorShort"]].map(([r, ic, k]) => (
              <button
                key={r}
                type="button"
                aria-pressed={role === r}
                onClick={() => { setRole(r); setErr(""); }}
                className={`flex h-14 items-center justify-center gap-2 rounded-control border-2 text-[15px] font-bold transition-colors ${role === r ? "border-primary bg-primary-soft text-primary-dark" : "border-line bg-surface text-ink hover:border-primary/50"}`}
              >
                <Icon name={ic} size={20} /> {t(k)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Input label={t("email")} type="email" placeholder="you@email.com" value={f.email} onChange={set("email")} autoComplete="email" />
      <Input label={t("password")} type="password" placeholder="••••••••" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      {mode === "login" && (
        <Link href="/forgot" className="rr-swap -mt-1 self-end text-[13px] font-semibold text-primary hover:underline">{t("forgotLink")}</Link>
      )}
      {mode === "signup" && <p className="rr-swap -mt-1 text-[13px] text-muted">{t("signupNext")}</p>}
      {mode === "signup" && (
        <p className="rr-swap-2 text-[13px] text-muted">
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
