"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import Loader from "@/components/loader";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setValidationError("Missing reset token or email address in URL.");
      setValidating(false);
      return;
    }

    async function checkToken() {
      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${token}&email=${encodeURIComponent(email!)}`
        );
        const data = await res.url ? await res.json() : {};

        if (!res.ok) {
          throw new Error(data.error ?? "Invalid or expired reset link.");
        }

        if (!data.valid) {
          throw new Error(data.error ?? "Invalid reset link.");
        }
      } catch (err: any) {
        setValidationError(err.message ?? "Invalid or expired reset link.");
      } finally {
        setValidating(false);
      }
    }

    checkToken();
  }, [token, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to reset password.");
      }

      setSubmitSuccess(true);
      // Optional: Auto redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (validating) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <Loader size={24} />
        <p style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
          Validating your reset token...
        </p>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="stack-24">
        <p className="label-upper" style={{ textAlign: "center", color: "#e11d48" }}>
          Validation Failed
        </p>
        <h1 className="auth-heading" style={{ fontSize: "22px" }}>
          Invalid Reset Link
        </h1>
        <p className="body-text" style={{ fontSize: "14px", textAlign: "center" }}>
          {validationError}
        </p>
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/forgot-password" className="btn btn-primary btn-block">
            Request New Link
          </Link>
        </div>
        <div style={{ textAlign: "center", marginTop: "8px" }}>
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

  if (submitSuccess) {
    return (
      <div className="stack-24">
        <p className="label-upper" style={{ textAlign: "center", color: "#10b981" }}>
          Success
        </p>
        <h1 className="auth-heading" style={{ fontSize: "22px" }}>
          Password Reset Complete
        </h1>
        <p className="body-text" style={{ fontSize: "14px", textAlign: "center" }}>
          Your password has been successfully reset! You can now sign in using your new password.
        </p>
        <p style={{ fontSize: "12px", color: "#888", textAlign: "center", marginTop: "-8px" }}>
          Redirecting you to sign in page...
        </p>
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link href="/login" className="btn btn-primary btn-block">
            Sign In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-24">
      <p className="label-upper" style={{ textAlign: "center" }}>
        Secure update
      </p>
      <h1 className="auth-heading">Reset Password</h1>
      <p className="auth-lead" style={{ marginBottom: "20px" }}>
        Enter a new password for account <strong>{email}</strong>.
      </p>

      <form onSubmit={handleSubmit} className="stack-16">
        <div className="form-field">
          <label htmlFor="password" className="relative form-label">
            New Password
            <button
              type="button"
              onClick={() => setViewPassword(!viewPassword)}
              className="absolute right-2 top-1/2"
              style={{
                background: "none",
                border: "none",
                fontSize: "11px",
                textDecoration: "underline",
                cursor: "pointer",
                color: "#666",
              }}
            >
              {viewPassword ? "Hide" : "Show"}
            </button>
            <input
              id="password"
              type={viewPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              className="input"
              disabled={submitting}
            />
          </label>
        </div>

        <div className="form-field">
          <label htmlFor="confirm-password" className="form-label">
            Confirm New Password
            <input
              id="confirm-password"
              type={viewPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              className="input"
              disabled={submitting}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-primary btn-block"
        >
          {submitting ? <Loader size={15} /> : "Update Password"}
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

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div style={{ textAlign: "center", padding: "20px" }}><Loader size={20} /></div>}>
        <ForgotPasswordFormWrapper />
      </Suspense>
    </AuthShell>
  );
}

function ForgotPasswordFormWrapper() {
  return <ResetPasswordForm />;
}
