"use client";

// V5 Enter pickup code
import { useRef, useState } from "react";
import { Button, Header, Icon, Page } from "@/components/ui";
import { useVendor } from "@/components/hooks";
import { useT } from "@/components/LangProvider";
import { checkPickupCode } from "@/lib/data";
import { dormName } from "@/lib/dorms";

export default function CheckCode() {
  const t = useT();
  const { vendor } = useVendor();
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null); // {ok, r} | {ok:false}
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  async function confirm(e) {
    e?.preventDefault();
    if (code.length !== 4 || !vendor) return;
    setBusy(true);
    try {
      const r = await checkPickupCode(vendor.id, code);
      setResult({ ok: true, r, code });
      setCode("");
    } catch {
      setResult({ ok: false });
    }
    setBusy(false);
    input.current?.focus();
  }

  return (
    <form onSubmit={confirm} className="flex flex-1 flex-col">
      <Header title={t("checkTitle")} back="/vendor" />
      <Page className="gap-4">
        <p className="text-[15px] text-muted">{t("checkBody")}</p>
        <label className="relative block cursor-text" onClick={() => input.current?.focus()}>
          <input
            ref={input}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 4)); setResult(null); }}
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            aria-label="Pickup code"
            className="absolute inset-0 opacity-0"
          />
          <span className="flex justify-between gap-2.5" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`flex h-[84px] flex-1 items-center justify-center rounded-[14px] border-2 bg-surface text-[40px] font-extrabold ${code[i] ? "border-primary" : i === code.length ? "border-primary/60" : "border-line"}`}>
                {code[i] ?? ""}
              </span>
            ))}
          </span>
        </label>
        <Button type="submit" disabled={code.length !== 4 || busy}>{t("confirmPickup")}</Button>
        {result?.ok && (
          <div className="flex flex-col gap-1.5 rounded-card border-[1.5px] border-success bg-primary-soft p-4" role="status">
            <p className="flex items-center gap-2 font-bold text-primary-dark"><Icon name="check" size={22} strokeWidth={2.5} className="text-success" /> {t("codeValid", { code: result.code })}</p>
            <p className="text-sm font-semibold">{result.r.name} · {dormName(result.r.dorm)} · ×{result.r.qty}</p>
            <p className="text-[13px] text-primary-dark">{t("markedClaimed")}</p>
          </div>
        )}
        {result && !result.ok && (
          <div className="flex items-center gap-2 rounded-card bg-danger-soft p-4 text-sm font-semibold text-danger-ink" role="alert">
            <Icon name="x" size={20} /> {t("codeNotFound")}
          </div>
        )}
      </Page>
    </form>
  );
}
