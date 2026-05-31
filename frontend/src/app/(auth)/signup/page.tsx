"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Spinner from "@/components/Spinner";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <SleepingCat />
        <h1 className="auth-title">Yay, New Friend!</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <div className="auth-input-wrapper">
            <input
              className="auth-input"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size={16} /> Signing up…
              </span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <Link href="/login" className="auth-link">
          We&apos;re already friends!
        </Link>
      </div>
    </main>
  );
}

function SleepingCat() {
  return (
    <svg
      width="150"
      height="100"
      viewBox="0 0 150 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="auth-cat"
    >
      <ellipse cx="75" cy="95" rx="56" ry="5" fill="rgba(180,140,80,0.12)" />
      <ellipse cx="87" cy="65" rx="52" ry="26" fill="#f0e8d8" />
      <circle cx="32" cy="50" r="26" fill="#f0e8d8" />
      <polygon points="13,31 19,13 29,29" fill="#f0e8d8" />
      <polygon points="33,27 41,9 49,27" fill="#f0e8d8" />
      <ellipse cx="95" cy="57" rx="22" ry="15" fill="#3a3028" />
      <ellipse cx="21" cy="40" rx="11" ry="9" fill="#3a3028" />
      <polygon points="33,27 41,9 49,27" fill="#3a3028" />
      <path
        d="M 19 53 Q 26 48 33 53"
        stroke="#6b4a2a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 33 53 Q 40 48 47 53"
        stroke="#6b4a2a"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="32" cy="58" rx="3.5" ry="2.5" fill="#e8a0a8" />
      <path
        d="M 133 57 Q 146 43 138 29"
        stroke="#f0e8d8"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="138" cy="30" r="8" fill="#3a3028" />
      <ellipse cx="54" cy="83" rx="14" ry="8" fill="#f0e8d8" />
      <line x1="2" y1="54" x2="17" y2="56" stroke="#c0a880" strokeWidth="1" opacity="0.6" />
      <line x1="2" y1="59" x2="17" y2="59" stroke="#c0a880" strokeWidth="1" opacity="0.6" />
      <line x1="47" y1="56" x2="62" y2="54" stroke="#c0a880" strokeWidth="1" opacity="0.6" />
      <line x1="47" y1="59" x2="62" y2="59" stroke="#c0a880" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function Eye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}
