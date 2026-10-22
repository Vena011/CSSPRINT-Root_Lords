"use client";

// V1 Vendor login / sign-up (Email + Password via Firebase Auth in db.js)
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, LangToggle, Note } from "@/components/ui";
import { useT } from "@/components/LangProvider";
import { vendorSignIn, vendorSignUp } from "@/lib/data";
import { UST } from "@/lib/geo";

export default function VendorLogin() {
  const t = useT();
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ email: "", password: "", name: "", address: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const getPos = () =>
    new Promise((res) => {
      if (!navigator.geolocation) return res(UST);
      navigator.geolocation.getCurrentPosition((p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res(UST), { timeout: 6000 });
    });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") await vendorSignIn(f.email, f.password);
      else {
        const pos = await getPos();
        await vendorSignUp(f.email, f.password, { name: f.name.trim(), address: f.address.trim(), ...pos });
      }
      router.replace("/vendor");
    } catch (e2) {
      setBusy(false);
      const m = String(e2?.message || e2?.code || "");
      setErr(m.includes("EMAIL_IN_USE") || m.includes("email-already-in-use") ? t("emailInUse") : t("loginError"));
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col justify-center gap-3.5 p-4">
      <div className="flex items-center justify-between">
        <Image src="/logo-mark.svg" alt="ReRoot" width={64} height={64} priority />
        <LangToggle />
      </div>
      <h1 className="text-[28px] font-extrabold leading-tight">{t("vendorTitle")}</h1>
      <p className="text-[15px] text-muted">{t("vendorPitch")}</p>
      {mode === "signup" && (
        <>
          <Input label={t("storeName")} placeholder={t("storeNamePh")} value={f.name} onChange={set("name")} required />
          <Input label={t("address")} placeholder={t("addressPh")} value={f.address} onChange={set("address")} />
        </>
      )}
      <Input label={t("email")} type="email" placeholder="you@email.com" value={f.email} onChange={set("email")} autoComplete="email" required />
      <Input label={t("password")} type="password" placeholder="••••••••" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6} />
      {err && <Note tone="red" icon="alert">{err}</Note>}
      <Button type="submit" disabled={busy}>{mode === "login" ? t("logIn") : t("signUp")}</Button>
      <Button type="button" variant="secondary" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }}>
        {mode === "login" ? t("signUp") : t("haveAccount")}
      </Button>
      <p className="text-center text-[13px] text-muted">{t("studentsNoAccount")}</p>
    </form>
  );
}
