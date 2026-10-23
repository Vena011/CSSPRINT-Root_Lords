"use client";

// Welcome / landing intro on the student home. Shown until dismissed (per phone).
import { useEffect, useState } from "react";
import { Button, Icon } from "./ui";
import { useT } from "./LangProvider";

const KEY = "reroot-welcome-done";

export default function WelcomeCard() {
  const t = useT();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
      setShow(localStorage.getItem(KEY) !== "1");
    } catch {}
  }, []);
  const done = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  };
  if (!show) return null;
  return (
    <section className="relative flex flex-col gap-3 overflow-hidden rounded-card bg-primary-dark p-5 text-white" aria-label="Welcome">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary opacity-60" />
      <button aria-label="Close" onClick={done} className="absolute right-3 top-3 p-1 text-primary-soft hover:text-white">
        <Icon name="x" size={18} />
      </button>
      <h2 className="relative pr-6 text-[22px] font-extrabold leading-tight">{t("welcomeTitle")}</h2>
      <p className="relative text-sm text-primary-soft">{t("welcomeBody")}</p>
      <ol className="relative flex flex-col gap-1.5 text-sm font-semibold">
        {["how1", "how2", "how3"].map((k, i) => (
          <li key={k} className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-extrabold">{i + 1}</span>
            {t(k)}
          </li>
        ))}
      </ol>
      <div className="relative flex gap-2 pt-1">
        <button onClick={done} className="h-11 flex-1 rounded-control bg-white text-sm font-bold text-primary-dark hover:bg-primary-soft">{t("browse")}</button>
        <Button href="/login?next=/vendor" variant="secondary" className="h-11 flex-1 border-white bg-transparent text-sm text-white hover:bg-primary">{t("imVendor")}</Button>
      </div>
    </section>
  );
}
