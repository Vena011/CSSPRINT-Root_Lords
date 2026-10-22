"use client";

// Bottom navigation. Pass the active tab (no usePathname, so dynamic routes stay prerenderable).
import Link from "next/link";
import { Icon } from "./ui";
import { useT } from "./LangProvider";

const TABS = {
  student: [
    ["home", "/", "home", "navHome"],
    ["mine", "/me", "receipt", "navMine"],
    ["account", "/account", "user", "navAccount"],
  ],
  vendor: [
    ["dashboard", "/vendor", "home", "navDashboard"],
    ["post", "/vendor/post", "plus", "navPost"],
    ["orders", "/vendor/orders", "list", "navOrders"],
    ["check", "/vendor/check", "key", "navCode"],
  ],
};

export default function BottomNav({ kind = "student", active }) {
  const t = useT();
  return (
    <>
      <div className="h-[72px]" aria-hidden="true" />
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[440px] border-t border-line bg-surface/95 backdrop-blur md:max-w-[820px] lg:max-w-[1160px]" aria-label="Main">
        <ul className="mx-auto flex max-w-xl">
          {TABS[kind].map(([key, href, icon, label]) => {
            const on = key === active;
            return (
              <li key={key} className="flex-1">
                <Link href={href} aria-current={on ? "page" : undefined} className={`flex h-[68px] flex-col items-center justify-center gap-1 text-[11px] font-bold ${on ? "text-primary" : "text-muted hover:text-ink"}`}>
                  <span className={`flex h-8 w-14 items-center justify-center rounded-full ${on ? "bg-primary-soft" : ""}`}>
                    <Icon name={icon} size={20} />
                  </span>
                  {t(label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
