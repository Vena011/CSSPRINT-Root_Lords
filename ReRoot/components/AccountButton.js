"use client";

// Header account control: "Log in" when signed out, an initial chip with a small menu when signed in.
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "./ui";
import { useConfirm } from "./ConfirmDialog";
import { useUser } from "./hooks";
import { useT } from "./LangProvider";
import { signOut } from "@/lib/data";
import { dormName } from "@/lib/dorms";

export default function AccountButton() {
  const t = useT();
  const router = useRouter();
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [dialog, confirm] = useConfirm();
  if (loading) return <span className="h-8 w-8" />;
  if (!user)
    return (
      <Link href="/login" className="rounded-full border border-line px-3 py-1.5 text-xs font-bold text-primary-dark">
        {t("logInShort")}
      </Link>
    );
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="relative">
      {dialog}
      <button onClick={() => setOpen(!open)} aria-label="Account" aria-expanded={open} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white">
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-56 rounded-control border border-line bg-surface p-3 text-sm shadow-lg">
          <p className="font-bold">{user.name || user.email}</p>
          <p className="mb-2 text-xs text-muted">{user.role === "vendor" ? user.vendor?.name : dormName(user.dorm) || user.email}</p>
          {user.role === "vendor" && (
            <Link href="/vendor" className="block rounded-lg py-2 font-semibold text-primary-dark hover:underline">{t("navDashboard")}</Link>
          )}
          {!user.role && (
            <Link href="/onboarding" className="block rounded-lg py-2 font-semibold text-primary-dark">{t("finishSetup")}</Link>
          )}
          {user.role && <Link href="/inbox" className="block rounded-lg py-2 font-semibold text-primary-dark hover:underline">{t("navInbox")}</Link>}
          <Link href="/account" className="block rounded-lg py-2 font-semibold text-primary-dark hover:underline">{t("navAccount")}</Link>
          <button onClick={async () => { setOpen(false); if (!(await confirm({ title: t("confirmLogout"), body: t("confirmLogoutBody"), confirmLabel: t("signOutShort") }))) return; await signOut(); router.refresh(); }} className="flex w-full items-center gap-2 py-2 font-semibold text-muted hover:text-ink">
            <Icon name="x" size={16} /> {t("signOutShort")}
          </button>
        </div>
      )}
    </div>
  );
}
