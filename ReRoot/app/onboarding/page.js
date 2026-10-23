"use client";

// After sign-up: choose Student or Vendor, then fill the details for that role.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Icon, Input, LangToggle, Note, Select } from "@/components/ui";
import { useUser } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { completeProfile } from "@/lib/data";
import { DORMS } from "@/lib/dorms";
import { UST } from "@/lib/geo";

function RoleCard({ value, icon, title, body, role, onPick }) {
  return (
    <button
      type="button"
      onClick={() => onPick(value)}
      aria-pressed={role === value}
      className={`flex w-full items-start gap-3.5 rounded-card border-2 p-4 text-left transition-colors ${role === value ? "border-primary bg-primary-soft" : "border-line bg-surface"}`}
    >
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${role === value ? "bg-primary text-white" : "bg-accent-soft text-accent-ink"}`}>
        <Icon name={icon} size={24} />
      </span>
      <span className="flex-1">
        <span className="block text-base font-bold">{title}</span>
        <span className="block text-[13px] font-medium text-muted">{body}</span>
      </span>
      <span className={`mt-1 h-5 w-5 shrink-0 rounded-full border-2 ${role === value ? "border-[6px] border-primary" : "border-line"}`} />
    </button>
  );
}

export default function Onboarding() {
  const t = useT();
  const router = useRouter();
  const { user, loading } = useUser();
  const [role, setRole] = useState(null); // null | student | vendor
  const [f, setF] = useState({ name: "", dorm: "", address: "" });
  const [pos, setPos] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pick = (r) => {
    setRole(r);
    setErr("");
  };

  // Role picked on the sign-up form comes pre-selected here (the user can still change it).
  useEffect(() => {
    let r = null;
    try {
      r = new URLSearchParams(window.location.search).get("role") || localStorage.getItem("reroot-signup-role");
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
    if (r === "student" || r === "vendor") setRole(r);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (user.role) router.replace(user.role === "vendor" ? "/vendor" : "/");
  }, [user, loading, router]);

  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude, exact: true }),
      () => setPos({ ...UST, exact: false }),
      { timeout: 8000 }
    );

  async function finish(e) {
    e.preventDefault();
    if (!f.name.trim()) return setErr(role === "vendor" ? t("needStoreName") : t("needName"));
    if (role === "student" && !f.dorm) return setErr(t("needDorm"));
    setErr("");
    setBusy(true);
    try {
      if (role === "vendor") {
        const p = pos ?? UST;
        await completeProfile("vendor", { name: f.name.trim(), address: f.address.trim(), lat: p.lat, lng: p.lng });
        try { localStorage.removeItem("reroot-signup-role"); } catch {}
        router.replace("/vendor");
      } else {
        try { localStorage.removeItem("reroot-signup-role"); } catch {}
        await completeProfile("student", { name: f.name.trim(), dorm: f.dorm });
        try {
          localStorage.setItem("reroot-name", f.name.trim());
        } catch {}
        router.replace("/");
      }
    } catch {
      setBusy(false);
      setErr(t("errorBody"));
    }
  }

  return (
    <form onSubmit={finish} className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3.5 p-4 md:p-6" noValidate>
      <div className="flex justify-end"><LangToggle /></div>
      <p className="text-xs font-bold uppercase tracking-wider text-accent-ink">{t("step", { n: role ? 2 : 1 })}</p>
      <h1 className="text-[28px] font-extrabold leading-tight">{t("roleTitle")}</h1>
      <p className="text-[15px] text-muted">{t("roleBody")}</p>
      <RoleCard value="student" icon="bowl" title={t("roleStudent")} body={t("roleStudentBody")} role={role} onPick={pick} />
      <RoleCard value="vendor" icon="store" title={t("roleVendor")} body={t("roleVendorBody")} role={role} onPick={pick} />

      {role === "student" && (
        <div className="flex flex-col gap-3.5 pt-1">
          <Input label={t("yourName")} placeholder={t("yourNamePh")} value={f.name} onChange={set("name")} maxLength={40} />
          <Select label={t("dorm")} value={f.dorm} onChange={set("dorm")}>
            <option value="" disabled>{t("dormPh")}</option>
            {DORMS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
      )}
      {role === "vendor" && (
        <div className="flex flex-col gap-3.5 pt-1">
          <Input label={t("storeName")} placeholder={t("storeNamePh")} value={f.name} onChange={set("name")} maxLength={50} />
          <Input label={t("address")} placeholder={t("addressPh")} value={f.address} onChange={set("address")} maxLength={80} />
          <Button type="button" variant="secondary" onClick={locate}>
            <Icon name="pin" size={18} /> {pos?.exact ? t("locationSet") : t("useMyLocation")}
          </Button>
          {pos && !pos.exact && <Note tone="warn" icon="pin">{t("locationFallback")}</Note>}
        </div>
      )}
      {err && <Note tone="red" icon="alert">{err}</Note>}
      <div className="mt-auto pt-2">
        <Button type="submit" disabled={!role || busy}>{t("finishSetup")}</Button>
      </div>
    </form>
  );
}
