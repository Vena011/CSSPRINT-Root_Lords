"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";

const ROLES = [
  { value: "student", label: "Student", description: "Browse and buy from vendors" },
  { value: "vendor", label: "Vendor", description: "Sell your products to students" },
];

export default function ChooseRolePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // Highlight the saved role when the user comes back to change it
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => setCurrent(snap.data()?.role ?? null));
  }, [user]);

  const choose = async (role) => {
    setError("");
    setBusy(true);
    try {
      await setDoc(doc(db, "users", user.uid), { role }, { merge: true });
      router.replace("/dashboard");
    } catch {
      setError("Could not save your choice. Please try again.");
      setBusy(false);
    }
  };

  if (loading || !user) return <main className="center muted">Loading…</main>;

  return (
    <main className="center">
      <div className="card">
        <h1>How will you use the site?</h1>
        <p className="muted">You can change this later from your dashboard.</p>

        {error && <p className="alert error">{error}</p>}

        {ROLES.map((r) => (
          <button
            key={r.value}
            type="button"
            className={`secondary role${current === r.value ? " selected" : ""}`}
            onClick={() => choose(r.value)}
            disabled={busy}
          >
            <strong>{r.label}</strong>
            <span className="muted small">{r.description}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
