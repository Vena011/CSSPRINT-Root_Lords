// Loading screen shown while a page loads.
export default function Loading() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6" role="status" aria-live="polite">
      <span className="rr-spin h-10 w-10 rounded-full border-4 border-primary-soft border-t-primary" />
      <p className="text-sm font-semibold text-muted">Loading ReRoot…</p>
    </div>
  );
}
