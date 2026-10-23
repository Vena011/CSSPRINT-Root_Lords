"use client";

import { useEffect, useState } from "react";
import { Icon } from "./ui";
import { useT } from "./LangProvider";
import { getDemandAlert, getTodayResults } from "@/lib/data";

// V6 Low-demand alert (rain forecast or class suspension). Data: JC's getDemandAlert().
export function AlertCard() {
  const t = useT();
  const [a, setA] = useState(null);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    getDemandAlert().then(setA).catch(() => setA(null));
  }, []);
  if (!a?.show || hidden) return null;
  const susp = a.reason === "suspension";
  return (
    <section className="flex flex-col gap-1.5 rounded-card border-[1.5px] border-warning bg-warning-soft p-4" role="status">
      <div className="flex items-center gap-2 text-accent-ink">
        <Icon name={susp ? "school" : "rain"} size={22} />
        <h2 className="flex-1 text-base font-bold">{susp ? t("alertSuspension") : t("alertRain", { p: a.probability })}</h2>
        <button aria-label="Dismiss" onClick={() => setHidden(true)}><Icon name="x" size={18} /></button>
      </div>
      <p className="text-sm">{t("alertBody")}</p>
      {!susp && <p className="text-xs text-muted">{t("alertSource")}</p>}
    </section>
  );
}

// V8 Results card (Tier 3). Re-queries whenever `refreshKey` changes.
export function ResultsCard({ vendorId, refreshKey }) {
  const t = useT();
  const [r, setR] = useState(null);
  useEffect(() => {
    if (vendorId) getTodayResults(vendorId).then(setR).catch(() => setR(null));
  }, [vendorId, refreshKey]);
  if (!r) return null;
  return (
    <section className="flex flex-col gap-2.5 rounded-card bg-primary-dark p-4 text-white">
      <p className="flex items-center gap-2 text-sm font-semibold text-primary-soft"><Icon name="chart" size={18} /> {t("todaysResults")}</p>
      <div className="flex gap-3">
        <div className="flex-1"><p className="text-3xl font-extrabold">{r.servings}</p><p className="text-[13px] font-semibold text-primary-soft">{t("servingsSaved")}</p></div>
        <div className="flex-1"><p className="text-3xl font-extrabold">₱{r.pesos.toLocaleString("en-PH")}</p><p className="text-[13px] font-semibold text-primary-soft">{t("recovered")}</p></div>
      </div>
    </section>
  );
}
