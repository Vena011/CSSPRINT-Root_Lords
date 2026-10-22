"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, authErrorMessage } from "@/lib/AuthContext";

export default function LoginPage() {
  const { user, loading, login, loginWithGoogle, loginAnonymously, resetPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  const run = async (action) => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    run(() => login(email, password));
  };

  const handleReset = () => {
    if (!email) return setError("Enter your email above first.");
    run(async () => {
      await resetPassword(email);
      setInfo("Password reset email sent. Check your inbox.");
    });
  };

  return (
    <main className="center">
      <form className="card" onSubmit={handleSubmit}>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to your account</p>

        {error && <p className="alert error">{error}</p>}
        {info && <p className="alert info">{info}</p>}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="button" className="link right" onClick={handleReset} disabled={busy}>
          Forgot password?
        </button>

        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <div className="divider">or</div>

        <button type="button" className="secondary" onClick={() => run(loginWithGoogle)} disabled={busy}>
          Continue with Google
        </button>

        <button type="button" className="secondary" onClick={() => run(loginAnonymously)} disabled={busy}>
          Continue as guest
        </button>

        <p className="muted small">
          Don&apos;t have an account? <Link href="/register">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
