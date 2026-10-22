"use client";

// Shared layout for Help, Privacy and Terms.
import { Header, Page } from "./ui";

export default function InfoPage({ title, updated, sections }) {
  return (
    <>
      <Header title={title} back />
      <Page narrow className="gap-5 pb-10">
        {updated && <p className="text-[13px] text-muted">{updated}</p>}
        {sections.map(([h, body]) => (
          <section key={h} className="flex flex-col gap-1.5">
            <h2 className="text-base font-bold">{h}</h2>
            {(Array.isArray(body) ? body : [body]).map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-ink/90">{p}</p>
            ))}
          </section>
        ))}
      </Page>
    </>
  );
}
