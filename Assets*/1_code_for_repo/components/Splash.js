"use client";

// Splash screen: shows the logo while the app starts, then fades out.
// Shown on the first load of a browser session; later loads skip it quickly.
import { useEffect, useState } from "react";

export default function Splash() {
  const [phase, setPhase] = useState("show"); // show | hide | gone
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("reroot-splash") === "1";
      sessionStorage.setItem("reroot-splash", "1");
    } catch {}
    const t1 = setTimeout(() => setPhase("hide"), seen ? 0 : 900);
    const t2 = setTimeout(() => setPhase("gone"), seen ? 350 : 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);
  if (phase === "gone") return null;
  return (
    <div className={`rr-splash ${phase === "hide" ? "rr-hide" : ""}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon-192.png" alt="" width="96" height="96" />
      <p className="text-3xl font-extrabold text-white">
        <span className="text-[#F6B35B]">Re</span>Root
      </p>
      <p className="text-sm font-semibold text-[#CFE5D7]">Tirang ulam, hindi tirang lugi.</p>
    </div>
  );
}
