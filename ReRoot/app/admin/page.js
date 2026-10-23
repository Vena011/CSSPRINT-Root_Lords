"use client";

// /admin: the class-suspension switch for the demo (J6). Only admin@reroot.test (custom claim admin=true).
import { useEffect, useState } from "react";
import { Button, Header, Note, Page, Switch } from "@/components/ui";
import { useUser } from "@/components/hooks";
import { isAdmin, listenSettings, setSuspension } from "@/lib/data";

export default function Admin() {
  const { user, loading } = useUser();
  const [allowed, setAllowed] = useState(null);
  const [s, setS] = useState({ suspension: false });
  useEffect(() => {
    if (loading) return;
    (user ? isAdmin() : Promise.resolve(false)).then(setAllowed).catch(() => setAllowed(false));
  }, [user, loading]);
  useEffect(() => (allowed ? listenSettings(setS) : undefined), [allowed]);
  return (
    <>
      <Header title="Admin" back="/" />
      <Page narrow className="gap-4">
        {allowed === null ? null : !allowed ? (
          <>
            <Note tone="red" icon="alert">Admins only. Log in as admin@reroot.test.</Note>
            <Button href="/login?next=/admin">Log in</Button>
          </>
        ) : (
          <section className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
            <Switch label="Class suspension today" description="Shows the low-demand alert on every vendor dashboard." checked={!!s.suspension} onChange={(on) => setSuspension(on)} />
            <p className="text-[13px] text-muted">{s.suspension ? "On: vendors see “Walang pasok ngayon”." : "Off: vendors see the rain alert only when rain is likely."}</p>
          </section>
        )}
      </Page>
    </>
  );
}
