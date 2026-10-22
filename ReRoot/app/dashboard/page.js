"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      const data = snap.data() ?? null;
      // Users who haven't picked student/vendor yet go choose one first
      if (!data?.role) return router.replace("/choose-role");
      setProfile(data);
    });
  }, [user, router]);

  if (loading || !user || !profile) return <main className="center muted">Loading…</main>;

  const fmt = (ts) => (ts ? ts.toDate().toLocaleString() : "—");

  return (
    <main className="center">
      <div className="card">
        <h1>Hello, {user.isAnonymous ? "Guest" : user.displayName || "there"} 👋</h1>
        <p className="muted">{user.isAnonymous ? "You are signed in as a guest." : "You are signed in."}</p>

        <dl className="details">
          <dt>Email</dt>
          <dd>{user.email || "—"}</dd>
          <dt>Role</dt>
          <dd className="capitalize">{profile.role}</dd>
          <dt>Member since</dt>
          <dd>{fmt(profile.createdAt)}</dd>
          <dt>Last login</dt>
          <dd>{fmt(profile.lastLogin)}</dd>
        </dl>

        <button className="secondary" onClick={() => router.push("/choose-role")}>
          Change role
        </button>

        <button className="secondary" onClick={logout}>
          Sign out
        </button>
      </div>
    </main>
  );
}
