// Loading screen shown while a page loads: logo, a moving bar, and a soft gradient behind it.
export default function Loading() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 p-6"
      style={{ background: "radial-gradient(80% 50% at 50% 30%, rgba(47,125,79,.10), rgba(47,125,79,0) 70%), radial-gradient(60% 40% at 80% 90%, rgba(232,137,43,.10), rgba(232,137,43,0) 70%)" }}
      role="status"
      aria-live="polite"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" width="56" height="56" className="rounded-2xl shadow-[0_10px_30px_rgba(30,85,53,.18)]" />
      <div className="rr-loadbar" aria-hidden="true">
        <span />
      </div>
      <p className="text-sm font-semibold text-muted">Loading ReRoot…</p>
    </div>
  );
}
