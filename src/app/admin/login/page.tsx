"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import RevealOnScroll from "@/components/ui/RevealOnScroll";

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

    router.push("/admin/dashboard");
  };

  return (
    <div className="admin-layout">
      <RevealOnScroll>
        <div className="admin-card">
          <h1>Admin Login</h1>
          <p>Sign in to manage your portfolio.</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", marginTop: "0.5rem" }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </RevealOnScroll>
    </div>
  );
}
