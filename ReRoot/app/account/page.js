"use client";

// Profile (view + edit), settings and log out. Works for guests, students and vendors.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Header, Icon, Input, LangToggle, Note, Page, Select, Switch } from "@/components/ui";
import BottomNav from "@/components/BottomNav";
import { useConfirm } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { useStored, useUser } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { enablePush, signOut, updateProfile } from "@/lib/data";
import { DORMS } from "@/lib/dorms";

export default function Account() {
  const t = useT();
  const router = useRouter();
  const { user, loading } = useUser();
  const [f, setF] = useState({ name: "", dorm: "", address: "" });
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useStored("reroot-notify-on", false);
  const [radius, setRadius] = useStored("reroot-radius", 500);
  const [dialog, confirm] = useConfirm();
  const [toast, showToast] = useToast();
  const isVendor = user?.role === "vendor";

  const loadedFor = useRef(null);
  useEffect(() => {
    // Copy the profile into the form once per account. Later live updates must not wipe what the user is typing.
    const key = user ? `${user.uid}:${user.vendor?.id ?? ""}` : null;
    if (!key || loadedFor.current === key) return;
    loadedFor.current = key;
    setF({ name: user.name || "", dorm: user.dorm || "", address: user.vendor?.address || "" });
  }, [user]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function save(e) {
    e.preventDefault();
    if (!f.name.trim()) return showToast(user.role === "vendor" ? t("needStoreName") : t("needName"));
    setBusy(true);
    try {
      const u = await updateProfile(user.role === "vendor" ? { name: f.name.trim(), address: f.address.trim() } : { name: f.name.trim(), dorm: f.dorm });
      if (u) setF({ name: u.name || "", dorm: u.dorm || "", address: u.vendor?.address ?? f.address.trim() });
      showToast(t("saved"));
    } catch {
      showToast(t("errorBody"));
    }
    setBusy(false);
  }

  async function toggleNotify(on) {
    if (!on) return setNotify(false);
    const ok = await enablePush(isVendor ? { lat: user.vendor?.lat, lng: user.vendor?.lng, radiusM: 0 } : { radiusM: radius }).catch(() => false);
    setNotify(!!ok);
    showToast(ok ? t("notifyDone") : t("notifyDenied"), 4000);
  }

  async function logout() {
    if (!(await confirm({ title: t("confirmLogout"), body: t("confirmLogoutBody"), confirmLabel: t("signOutShort") }))) return;
    await signOut();
    router.replace("/login");
  }

  return (
    <>
      <Header title={t("accountTitle")} back={isVendor ? "/vendor" : "/"} />
      <Page narrow className="gap-4">
        {loading ? null : !user ? (
          <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
            <h2 className="text-base font-bold">{t("guestTitle")}</h2>
            <p className="text-sm text-muted">{t("guestBody")}</p>
            <Button href="/login">{t("logIn")}</Button>
          </section>
        ) : (
          <form onSubmit={save} className="flex flex-col gap-3.5 rounded-card border border-line bg-surface p-4" noValidate>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-extrabold text-white">
                {(user.name || user.email).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <h2 className="truncate font-bold">{t("profile")}</h2>
                <p className="truncate text-[13px] text-muted">{user.email} · {isVendor ? t("roleVendorShort") : user.role ? t("roleStudentShort") : "—"}</p>
              </div>
            </div>
            {!user.role ? (
              <Button href="/onboarding">{t("finishSetup")}</Button>
            ) : (
              <>
                <Input label={isVendor ? t("storeName") : t("yourName")} value={f.name} onChange={set("name")} maxLength={50} />
                {isVendor ? (
                  <Input label={t("address")} placeholder={t("addressPh")} value={f.address} onChange={set("address")} maxLength={80} />
                ) : (
                  <Select label={t("dorm")} value={f.dorm} onChange={set("dorm")}>
                    <option value="" disabled>{t("dormPh")}</option>
                    {DORMS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                )}
                <Button type="submit" disabled={busy}>{busy ? t("saving") : t("saveChanges")}</Button>
              </>
            )}
          </form>
        )}

        <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
          <h2 className="text-base font-bold">{t("settings")}</h2>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold">{t("language")}</span>
            <LangToggle />
          </div>
          {isVendor && <Switch label={t("notifyVendorLabel")} description={t("notifyVendorBody")} checked={notify} onChange={toggleNotify} />}
          {!isVendor && (
            <>
              <Switch label={t("notifications")} description={t("notificationsBody")} checked={notify} onChange={toggleNotify} />
              <Select label={t("defaultRadius")} value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
                <option value={300}>300 m</option>
                <option value={500}>500 m</option>
                <option value={1000}>1 km</option>
              </Select>
            </>
          )}
        </section>

        <nav className="flex flex-col overflow-hidden rounded-card border border-line bg-surface text-[15px] font-semibold">
          {[["/help", "help", t("helpLink")], ["/privacy", "info", t("privacy")], ["/terms", "list", t("terms")]].map(([href, ic, label]) => (
            <Link key={href} href={href} className="flex items-center gap-3 border-b border-line px-4 py-3.5 last:border-b-0 hover:bg-bg">
              <Icon name={ic} size={18} className="text-muted" /> <span className="flex-1">{label}</span> <Icon name="left" size={16} className="rotate-180 text-muted" />
            </Link>
          ))}
        </nav>

        {user && (
          <Button variant="secondary" onClick={logout} className="border-danger text-danger-ink hover:bg-danger-soft">
            {t("signOut")}
          </Button>
        )}
      </Page>
      {/* wait for the account to load, so the student nav never flashes for a vendor */}
      {loading ? <div className="h-[72px]" aria-hidden="true" /> : <BottomNav kind={isVendor ? "vendor" : "student"} active="account" />}
      {dialog}
      {toast}
    </>
  );
}
