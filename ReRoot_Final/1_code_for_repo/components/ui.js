"use client";

// Small building blocks that match the Figma Style Guide.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "./LangProvider";

const PATHS = {
  left: "m15 18-6-6 6-6",
  down: "m6 9 6 6 6-6",
  clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  pin: "M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  share: "M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13",
  check: "M20 6 9 17l-5-5",
  map: "M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  bowl: "M3 11h18a9 9 0 0 1-18 0ZM8 7.5c0-1 1-1.5 1-2.5M12 7.5c0-1 1-1.5 1-2.5M16 7.5c0-1 1-1.5 1-2.5",
  info: "M12 16v-4M12 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  spark: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z",
  bell: "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9ZM10.3 21a1.94 1.94 0 0 0 3.4 0",
  rain: "M4 14.9A7 7 0 1 1 15.7 8h1.8a4.5 4.5 0 0 1 2.5 8.2M16 14v6M8 14v6M12 16v6",
  school: "M22 10 12 5 2 10l10 5 10-5ZM6 12v5c3 3 9 3 12 0v-5",
  chart: "M3 3v18h18M7 14l4-4 4 4 5-5",
  x: "M18 6 6 18M6 6l12 12",
  alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4M12 17h.01",
  sharebox: "M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7",
  plussq: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2ZM12 8v8M8 12h8",
  copy: "M8 8h12v12H8zM4 16V4h12",
  key: "M15 7a4 4 0 1 1-3.9 4.9L3 20v-3h3v-3h3l1.1-1.1A4 4 0 0 1 15 7ZM16 10h.01",
};

export function Icon({ name, size = 20, className = "", strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

const BTN = {
  primary: "bg-primary text-white active:bg-primary-dark",
  secondary: "bg-surface text-primary-dark border-[1.5px] border-primary active:bg-primary-soft",
  disabled: "bg-disabled text-muted",
};

export function Button({ variant = "primary", href, className = "", children, disabled, ...rest }) {
  const v = disabled ? "disabled" : variant;
  const cls = `inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-control px-5 text-base font-bold transition-colors ${BTN[v]} ${className}`;
  if (href && !disabled) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} disabled={disabled} {...rest}>{children}</button>;
}

export function Field({ label, children, error }) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {error && <span className="text-[13px] font-semibold text-danger-ink">{error}</span>}
    </label>
  );
}

const INPUT = "h-12 w-full rounded-control border-[1.5px] border-line bg-surface px-3.5 text-[15px] outline-none placeholder:text-muted focus:border-primary focus:border-2";

export function Input({ label, error, ...rest }) {
  return (
    <Field label={label} error={error}>
      <input className={INPUT} {...rest} />
    </Field>
  );
}

export function Select({ label, error, children, ...rest }) {
  return (
    <Field label={label} error={error}>
      <span className="relative block">
        <select className={`${INPUT} appearance-none pr-10`} {...rest}>{children}</select>
        <Icon name="down" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
      </span>
    </Field>
  );
}

const BADGE = {
  left: "bg-primary-soft text-primary-dark",
  ending: "bg-danger-soft text-danger-ink",
  soldout: "bg-disabled text-muted",
  deal: "bg-accent-soft text-accent-ink",
  claimed: "bg-success text-white",
};

export function Badge({ tone = "left", children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-none ${BADGE[tone]}`}>{children}</span>;
}

export function Chip({ selected, children, ...rest }) {
  return (
    <button
      className={`h-10 rounded-full px-4 text-sm font-semibold ${selected ? "bg-primary text-white" : "border border-line bg-surface text-ink"}`}
      aria-pressed={selected}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-0.5 rounded-full border border-line p-[3px]" role="group" aria-label="Language">
      {["en", "fil"].map((l) => (
        <button key={l} onClick={() => setLang(l)} className={`rounded-full px-2.5 py-1 text-xs font-bold ${lang === l ? "bg-primary text-white" : "text-muted"}`} aria-pressed={lang === l}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// title: string. back: true (router.back) or an href. brand: green wordmark style.
export function Header({ title, back, brand, right }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-line bg-surface px-4">
      {back && (
        <button aria-label="Back" className="-ml-1 p-1" onClick={() => (typeof back === "string" ? router.push(back) : router.back())}>
          <Icon name="left" size={24} />
        </button>
      )}
      <h1 className={`min-w-0 flex-1 truncate font-extrabold ${brand ? "text-xl text-primary" : "text-lg"}`}>{title}</h1>
      {right}
      <LangToggle />
    </header>
  );
}

export function Page({ children, className = "" }) {
  return <main className={`flex flex-1 flex-col gap-3 p-4 ${className}`}>{children}</main>;
}

// Sticky bottom bar for the main action.
export function Footer({ children }) {
  return <div className="sticky bottom-0 z-10 border-t border-line bg-surface p-4">{children}</div>;
}

export function Note({ tone = "green", icon = "info", children }) {
  const t = { green: "bg-primary-soft text-primary-dark", warn: "bg-warning-soft text-accent-ink", gray: "bg-disabled text-muted", red: "bg-danger-soft text-danger-ink" }[tone];
  return (
    <div className={`flex items-center gap-2 rounded-control p-3 text-[13px] font-semibold ${t}`}>
      <Icon name={icon} size={18} className="shrink-0" />
      <span>{children}</span>
    </div>
  );
}

export function DishThumb({ size = 76, icon = 32, className = "" }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent ${className}`} style={{ width: size, height: size }}>
      <Icon name="bowl" size={icon} strokeWidth={1.8} />
    </div>
  );
}
