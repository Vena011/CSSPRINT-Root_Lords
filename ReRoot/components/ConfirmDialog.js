"use client";

import { createPortal } from "react-dom";

// Confirmation dialog for destructive actions.
// const [dialog, confirm] = useConfirm(); if (await confirm({ title, body, confirmLabel })) { ... }  render {dialog}
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "./ui";
import { useT } from "./LangProvider";

export function useConfirm() {
  const t = useT();
  const [opts, setOpts] = useState(null);
  const resolver = useRef(null);
  const okRef = useRef(null);

  const confirm = useCallback(
    (o) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setOpts(o);
      }),
    []
  );
  const close = useCallback((v) => {
    resolver.current?.(v);
    resolver.current = null;
    setOpts(null);
  }, []);

  useEffect(() => {
    if (!opts) return;
    okRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts, close]);

  const node = opts ? (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center" onClick={() => close(false)}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="rr-confirm-title" aria-describedby="rr-confirm-body" className="rr-sheet flex w-full max-w-[400px] flex-col gap-3 rounded-3xl bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <h2 id="rr-confirm-title" className="text-xl font-bold">{opts.title}</h2>
        {opts.body && <p id="rr-confirm-body" className="text-sm text-muted">{opts.body}</p>}
        <div className="mt-1 flex gap-2">
          <Button variant="secondary" onClick={() => close(false)}>{opts.cancelLabel ?? t("keep")}</Button>
          <button ref={okRef} onClick={() => close(true)} className="inline-flex h-[52px] w-full items-center justify-center rounded-control bg-danger px-5 text-base font-bold text-white hover:bg-danger-ink">
            {opts.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  ) : null;
  // Rendered into <body>: inside the sticky header it would sit under the bottom nav.
  return [node && typeof document !== "undefined" ? createPortal(node, document.body) : null, confirm];
}
