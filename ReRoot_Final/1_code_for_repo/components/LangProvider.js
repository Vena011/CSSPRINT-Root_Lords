"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { translate } from "@/lib/copy";

const LangCtx = createContext({ lang: "en", setLang: () => {} });
const KEY = "reroot-lang";

// Default: Filipino on vendor pages, English for students, unless the user picked one.
export function LangProvider({ children }) {
  const [fallback, setFallback] = useState("en");
  const [picked, setPicked] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading browser-only state after hydration
    if (window.location.pathname.startsWith("/vendor")) setFallback("fil");
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "fil") setPicked(saved);
    } catch {}
  }, []);

  const setLang = useCallback((l) => {
    setPicked(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  }, []);

  const lang = picked ?? fallback;
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

// const t = useT(); t("left", { left: 4, total: 12 })
export function useT() {
  const { lang } = useContext(LangCtx);
  return useCallback((key, vars) => translate(lang, key, vars), [lang]);
}
