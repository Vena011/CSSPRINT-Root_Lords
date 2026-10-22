"use client";

import { useEffect, useState } from "react";
import { Icon } from "./ui";
import { useT } from "./LangProvider";
import { toMs } from "@/lib/time";

function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default function CountdownTimer({ cutoffAt }) {
  const t = useT();
  const end = toMs(cutoffAt);
  const [left, setLeft] = useState(() => (end ? end - Date.now() : 0));
  useEffect(() => {
    const id = setInterval(() => setLeft(end - Date.now()), 1000);
    return () => clearInterval(id);
  }, [end]);
  const closed = left <= 0;
  return (
    <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-[13px] font-bold ${closed ? "bg-disabled text-muted" : "bg-danger-soft text-danger-ink"}`}>
      <Icon name="clock" size={16} />
      <span suppressHydrationWarning>{closed ? t("closed") : t("closesIn", { t: fmt(left) })}</span>
    </span>
  );
}
