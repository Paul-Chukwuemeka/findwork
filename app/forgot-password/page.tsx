"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import Loader from "@/components/loader";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [debugLink, setDebugLink] = useState<string | null>(null);

  // Pre-fill email from query param if available
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(false);
    setSuccess(false);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to request password reset");
      }

      setSuccess(true);
      if (data.link) {
        setDebugLink(data.link);
      }
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="stack-24">
        <p className="label-upper" style={{ textAlign: "center" }}>
          Reset Link Sent
        </p>
        <h1 className="auth-heading" style={{ fontSize: "24px" }}>
          Check your email
        </h1>
        <p className="body-text" style={{ fontSize: "14px", textAlign: "center" }}>
          If an account exists with the email <strong>{email}</strong>, we have sent a password reset link. Please check your inbox and click the link to set a new password.
        </p>

        {debugLink && (
          <div
            style={{
              marginTop: "8px",
              padding: "16px",
              background: "#fafafa",
              border: "1px dashed #ddd",
              borderRadius: "6px",
            }}
          >
            <p
              className="label-upper"
              style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#666" }}
            >
              🔧 Local Dev Mode Helper:
            </p>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
              Since you are running locally, the reset link was logged to the terminal console, written to <code>reset-link.txt</code>, and you can also access it below:
            </p>
            <Link
              href={debugLink}
              className="btn btn-secondary btn-block"
              style={{ fontSize: "13px", padding: "8px 12px" }}
            >
              Reset Password Now
            </Link>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/login" className="btn btn-secondary btn-block">
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-24">
      <p className="label-upper" style={{ textAlign: "center" }}>
        Trouble signing in?
      </p>
      <h1 className="auth-heading">Forgot Password</h1>
      <p className="auth-lead" style={{ marginBottom: "20px" }}>
        Enter your email address and we will send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="stack-16">
        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Email address
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="input"
              disabled={loading}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
        >
          {loading ? <Loader size={15} /> : "Send Reset Link"}
        </button>
      </form>

      {error && (
        <p className="form-error" style={{ textAlign: "center", color: "#e11d48" }}>
          {error}
        </p>
      )}

      <div style={{ textAlign: "center" }}>
        <Link
          href="/login"
          className="site-nav__link"
          style={{ fontSize: "13px", textDecoration: "underline" }}
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}><Loader size={20} /></div>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
