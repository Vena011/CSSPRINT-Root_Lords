"use client";

// Bottom navigation. Pass the active tab (no usePathname, so dynamic routes stay prerenderable).
import Link from "next/link";
import { Icon } from "./ui";
import { useT } from "./LangProvider";
import { useThreads } from "./inbox";

const TABS = {
  student: [
    ["home", "/", "home", "navHome"],
    ["mine", "/me", "receipt", "navMine"],
    ["inbox", "/inbox", "chat", "navInbox"],
    ["account", "/account", "user", "navAccount"],
  ],
  vendor: [
    ["dashboard", "/vendor", "home", "navDashboard"],
    ["post", "/vendor/post", "plus", "navPost"],
    ["orders", "/vendor/orders", "list", "navOrders"],
    ["check", "/vendor/check", "key", "navCode"],
    ["inbox", "/inbox", "chat", "navInbox"],
    ["account", "/account", "user", "navAccount"],
  ],
};

export default function BottomNav({ kind = "student", active }) {
  const t = useT();
  const { unread } = useThreads();
  return (
    <>
      <div className="h-[72px]" aria-hidden="true" />
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[440px] border-t border-line bg-surface/95 backdrop-blur md:max-w-[820px] lg:max-w-[1160px]" aria-label="Main">
        <ul className="mx-auto flex max-w-xl">
          {TABS[kind].map(([key, href, icon, label]) => {
            const on = key === active;
            return (
              <li key={key} className="flex-1">
                <Link href={href} aria-current={on ? "page" : undefined} className={`flex h-[68px] flex-col items-center justify-center gap-1 whitespace-nowrap text-center text-[10.5px] font-bold transition-colors min-[400px]:text-[11px] ${on ? "text-primary" : "text-muted hover:text-ink"}`}>
                  <span className={`relative flex h-8 w-11 items-center justify-center rounded-full transition-colors sm:w-14 ${on ? "bg-primary-soft" : ""}`}>
                    <Icon name={icon} size={20} />
                    {key === "inbox" && unread > 0 && (
                      <span className="absolute -right-0.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-extrabold leading-none text-white" aria-label={t("unread", { n: unread })}>
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
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
