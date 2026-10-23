// Accepts a number (ms), a Date, or a Firestore Timestamp and returns ms.
export function toMs(v) {
  if (v == null) return null;
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v.toMillis === "function") return v.toMillis();
  if (typeof v.seconds === "number") return v.seconds * 1000;
  return new Date(v).getTime();
}

export function clockTime(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

export function minutesLeft(cutoff) {
  const ms = toMs(cutoff);
  if (!ms) return 0;
  return Math.max(0, Math.round((ms - Date.now()) / 60000));
}

export function isOpen(l) {
  if (!l) return false;
  return l.status === "open" && l.servingsLeft > 0 && l.ordersLeft > 0 && toMs(l.cutoffAt) > Date.now();
}
