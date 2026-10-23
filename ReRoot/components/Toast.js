"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "./ui";

// const [toast, showToast] = useToast(); ... {toast}  showToast("Copied!")
export function useToast() {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);
  const show = useCallback((m, ms = 3000) => {
    setMsg(m);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), ms);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = msg ? (
    <div role="status" className="fixed inset-x-0 top-16 z-50 mx-auto flex w-[min(400px,calc(100%-32px))] items-center gap-2.5 rounded-control bg-ink p-3.5 text-[13px] font-semibold text-white shadow-lg">
      <Icon name="info" size={18} className="shrink-0 text-warning" />
      <span>{msg}</span>
    </div>
  ) : null;
  return [node, show];
}
