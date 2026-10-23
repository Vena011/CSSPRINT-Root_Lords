"use client";

// Splash screen: logo, name and a loading bar on a soft green gradient while the app starts.
// First load in a browser session plays the full intro (about 3 s); later loads in the same session skip it.
import { useEffect, useRef, useState } from "react";

const FULL_MS = 2200; // loading bar fill time (the bar starts after a 0.6 s entrance)

export default function Splash() {
  const [phase, setPhase] = useState("show"); // show | hide | gone
  const seenRef = useRef(null); // decided once, so React's dev double-run of effects can't skip the intro
  useEffect(() => {
    if (seenRef.current === null) {
      try {
        seenRef.current = sessionStorage.getItem("reroot-splash") === "1";
        sessionStorage.setItem("reroot-splash", "1");
      } catch {
        seenRef.current = false;
      }
    }
    const seen = seenRef.current;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const hold = seen ? 0 : reduced ? 900 : FULL_MS + 750;
    const t1 = setTimeout(() => setPhase("hide"), hold);
    const t2 = setTimeout(() => setPhase("gone"), hold + 650);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (phase === "gone") return null;
  return (
    <div className={`rr-splash ${phase === "hide" ? "rr-hide" : ""}`} style={{ "--rr-splash-ms": `${FULL_MS}ms` }} role="status" aria-label="Loading ReRoot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width="104" height="104" className="rr-splash-logo" />
      <p className="rr-splash-word text-[34px] font-extrabold tracking-tight text-white">
        <span className="text-[#F6B35B]">Re</span>Root
      </p>
      <p className="rr-splash-tag -mt-2 text-sm font-semibold text-[#CFE5D7]">Tirang ulam, hindi tirang lugi.</p>
      <div className="rr-splash-bar" aria-hidden="true">
        <span />
      </div>
      <p className="rr-splash-note">Finding fresh ulam near you…</p>
    </div>
  );
}
