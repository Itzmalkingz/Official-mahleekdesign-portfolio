"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { IconShield } from "@/components/admin/icons";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.replace("/admin/dashboard");
  };

  return (
    <div className="ac-login">
      <div className="ac-login-brand">
        <div className="logo">
          <img src="/images/favicon/branding-module-1.png" alt="" />
          Mahleek Studio
        </div>
        <div className="tagline">
          Run the studio from a purpose-built <span>control center</span>.
        </div>
        <div style={{ fontSize: "0.82rem", color: "#7a88a0" }}>
          Projects · Leads · Bookings · Content
        </div>
      </div>

      <div className="ac-login-form">
        <div className="box">
          <h1>Sign in</h1>
          <p style={{ color: "var(--aslate)", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
            Access the Mahleek Studio admin console.
          </p>

          <form onSubmit={handleLogin} style={{ display: "grid", gap: "1rem" }}>
            <div>
              <label className="ac-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="ac-input"
                type="email"
                placeholder="you@mahleek.design"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="ac-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="ac-input"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="ac-form-error">
                <IconShield size={15} /> {error}
              </div>
            )}

            <button type="submit" className="ac-btn primary" disabled={loading} style={{ width: "100%", padding: "0.65rem 1rem" }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}