"use client";

import { Button, Icon } from "./ui";
import { useT } from "./LangProvider";

export function SkeletonList({ n = 3 }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rr-shimmer flex gap-3 rounded-card border border-line bg-surface p-3">
          <div className="h-[76px] w-[76px] rounded-control bg-disabled" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <div className="h-3.5 w-3/5 rounded-full bg-disabled" />
            <div className="h-2.5 w-4/5 rounded-full bg-disabled" />
            <div className="h-4 w-2/5 rounded-full bg-disabled" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-2.5 px-6 py-8 text-center">
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-accent-soft text-accent">
        <Icon name="bowl" size={34} strokeWidth={1.8} />
      </div>
      <h3 className="text-base font-bold">{title ?? t("emptyTitle")}</h3>
      <p className="text-[13px] font-medium text-muted">{body ?? t("emptyBody")}</p>
      {action && <div className="mt-2 w-full">{action}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-2.5 rounded-card bg-danger-soft p-5 text-center text-danger-ink">
      <Icon name="alert" size={30} />
      <h3 className="text-base font-bold">{t("error")}</h3>
      <p className="text-[13px] font-medium">{t("errorBody")}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-1">
          {t("tryAgain")}
        </Button>
      )}
    </div>
  );
}
