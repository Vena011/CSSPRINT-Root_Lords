"use client";

// Chat for one order. Status taps ("On my way", "I'm here", "Ready na po") are messages too,
// so the other side gets the same alert and push for both.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, DishThumb, Header, Icon, Page } from "./ui";
import { EmptyState, SkeletonList } from "./States";
import { useToast } from "./Toast";
import { useUser } from "./hooks";
import { markRead } from "./inbox";
import { useT } from "./LangProvider";
import { listenListing, listenMessages, listenReservation, sendMessage } from "@/lib/data";
import { dormName } from "@/lib/dorms";
import { clockTime } from "@/lib/time";

export const QUICK = { student: ["student:otw", "student:here"], vendor: ["vendor:ready", "vendor:soldout"] };

export default function ChatThread() {
  const t = useT();
  const { id } = useParams();
  const { user, loading } = useUser();
  const [r, setR] = useState(undefined);
  const [l, setL] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, showToast] = useToast();
  const endRef = useRef(null);

  useEffect(() => listenReservation(id, setR), [id]);
  useEffect(() => (r?.listingId ? listenListing(r.listingId, setL) : undefined), [r?.listingId]);
  useEffect(() => (r ? listenMessages(id, setMsgs) : undefined), [id, r]);

  // I'm the vendor if this order belongs to my store; otherwise I'm the student who reserved it.
  const role = user?.role === "vendor" && user.vendor?.id === r?.vendorId ? "vendor" : "student";
  const last = msgs?.length ? msgs[msgs.length - 1] : null;

  useEffect(() => {
    if (last) markRead(role, id, last.createdAt);
    endRef.current?.scrollIntoView({ block: "end" });
  }, [last, role, id]);

  async function send(payload) {
    if (sending) return;
    setSending(true);
    try {
      await sendMessage(id, { from: role, ...payload });
      if (payload.kind !== "status") setText("");
    } catch {
      showToast(t("sendFailed"), 4000);
    }
    setSending(false);
  }

  if (r === undefined || loading)
    return (<><Header title={t("inboxTitle")} back="/inbox" /><Page narrow><SkeletonList n={2} /></Page></>);
  if (r === null || (user?.role === "vendor" && role !== "vendor"))
    return (<><Header title={t("inboxTitle")} back="/inbox" /><EmptyState icon="chat" title={t("notFound")} body="" action={<Button href="/inbox" variant="secondary">{t("inboxTitle")}</Button>} /></>);

  const closed = r.status === "claimed" || r.status === "cancelled";
  const other = role === "vendor" ? r.name : l?.vendorName ?? "…";

  return (
    <div className="flex flex-1 flex-col">
      <Header title={other} back="/inbox" />
      <div className="sticky top-14 z-10 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <DishThumb size={44} icon={20} photo={l?.photo} alt={l?.dish} />
          <div className="min-w-0 flex-1 text-[13px]">
            <p className="truncate font-bold">{l?.dish ?? "…"} ×{r.qty} · {t("codeShort", { code: r.pickupCode })}</p>
            <p className="truncate text-muted">
              {role === "vendor" ? dormName(r.dorm) : l?.vendorName}
              {" · "}
              {r.status === "claimed" ? t("statusClaimed") : r.status === "cancelled" ? t("statusCancelled") : t("statusReservedShort")}
            </p>
          </div>
          <Link href={role === "vendor" ? "/vendor/check" : `/r/${r.id}`} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-bold text-primary-dark hover:border-primary">
            {role === "vendor" ? t("navCode") : t("pickupTitle")}
          </Link>
        </div>
      </div>

      <Page narrow className="gap-2 pb-2">
        {!msgs ? (
          <SkeletonList n={1} />
        ) : msgs.length === 0 ? (
          <p className="mx-auto my-6 max-w-xs text-center text-sm text-muted">{t("chatStart")}</p>
        ) : (
          <ol className="flex flex-col gap-2" aria-live="polite">
            {msgs.map((m) => {
              const mine = m.from === role;
              const body = m.kind === "status" && m.key ? t(`msg.${m.key}`) : m.text;
              return (
                <li key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <span
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${
                      mine ? "rounded-br-md bg-primary text-white" : "rounded-bl-md border border-line bg-surface text-ink"
                    } ${m.kind === "status" ? "font-bold" : ""}`}
                  >
                    {m.kind === "status" && <Icon name={m.key?.startsWith("vendor") ? "check" : "pin"} size={14} className="mr-1 inline -translate-y-px" />}
                    {body}
                  </span>
                  <span className="px-1 pt-0.5 text-[11px] text-muted">{clockTime(m.createdAt)}</span>
                </li>
              );
            })}
          </ol>
        )}
        <div ref={endRef} />
      </Page>

      <div className="sticky bottom-0 z-10 border-t border-line bg-surface p-3">
        <div className="mx-auto flex max-w-xl flex-col gap-2">
          {closed ? (
            <p className="py-2 text-center text-sm font-semibold text-muted">{t("chatClosed")}</p>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto" role="group" aria-label={t("quickReplies")}>
                {QUICK[role].map((k) => (
                  <button
                    key={k}
                    type="button"
                    disabled={sending}
                    onClick={() => send({ kind: "status", key: k, text: t(`msg.${k}`) })}
                    className={`h-9 shrink-0 rounded-full border-[1.5px] px-3.5 text-[13px] font-bold transition-colors ${r.statusMsg === k ? "border-primary bg-primary text-white" : "border-primary/40 bg-primary-soft text-primary-dark hover:border-primary"}`}
                  >
                    {t(`msg.${k}`)}
                  </button>
                ))}
              </div>
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (text.trim()) send({ kind: "chat", text });
                }}
              >
                <label htmlFor="chat-text" className="sr-only">{t("chatPlaceholder")}</label>
                <input
                  id="chat-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={500}
                  placeholder={t("chatPlaceholder")}
                  autoComplete="off"
                  className="h-11 min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-bg px-4 text-[15px] outline-none placeholder:text-muted focus:border-primary"
                />
                <button type="submit" disabled={!text.trim() || sending} aria-label={t("send")} title={t("send")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark disabled:bg-disabled disabled:text-muted">
                  <Icon name="send" size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      {toast}
    </div>
  );
}
