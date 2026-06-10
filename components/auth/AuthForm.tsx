"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { checkUserExists } from "@/utils/checkUserExists";
import Loader from "../loader";
import SignupPage from "@/app/signup/page";

type Mode = "login" | "signup";

type AuthFormProps = {
  mode: Mode;
  redirectTo?: string;
  googleEnabled?: boolean;
};

const OAUTH_ERRORS: Record<string, string> = {
  NoAccount: "No account found for this email. Please sign up first.",
  AccountExists: "An account with this email already exists. Please sign in.",
  AccessDenied: "Sign in was cancelled or denied.",
  OAuthSignin: "Could not start Google sign in. Check your Google OAuth setup.",
  OAuthCallback: "Google sign in failed. Try again.",
  Default: "Something went wrong. Please try again.",
};

function setAuthIntent(mode: Mode) {
  document.cookie = `auth_intent=${mode}; path=/; max-age=300; SameSite=Lax`;
}

export function AuthForm({
  mode,
  redirectTo = "/onboarding",
  googleEnabled = false,
}: AuthFormProps) {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [error, setError] = useState(
    urlError ? (OAUTH_ERRORS[urlError] ?? OAUTH_ERRORS.Default) : "",
  );
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phase, setPhase] = useState<number>(0);
  const [viewPassword, setViewPassword] = useState<boolean>(false);

  const isSignup = mode === "signup";

  async function handleGoogle() {
    setError("");
    setGoogleLoading(true);
    setAuthIntent(mode);
    await signIn("google", { callbackUrl: redirectTo });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (phase === 0) {
        const res = await fetch(
          `/api/auth/user-exists?email=${encodeURIComponent(email)}`,
        );
        const {exists} = await res.json()

        if (isSignup && exists) {
          throw new Error("There is already an account with this email");
        } else if (!isSignup && !exists)
          throw new Error("No accounts found for this email");
        else {
          setPhase(1);
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });
        console.log(res)
        if (!res?.ok) {
          console.log(res);
          const data = await res.text();
          console.log(data);
          throw new Error(data);
        }
        await signIn("credentials", {
          email,
          password,
          name,
          redirectTo,
        });
      }
    } catch (error: unknown) {
      console.log(error);
      setError(error?.message as string);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="label-upper" style={{ textAlign: "center" }}>
        {isSignup ? "Get started" : "Welcome back"}
      </p>
      <h1 className="auth-heading">
        {isSignup ? "Create your account" : "Sign in to FindWork"}
      </h1>
      <p className="auth-lead">
        {isSignup
          ? "Join developers and companies building across Africa."
          : "Browse jobs, apply, or manage listings."}
      </p>

      {googleEnabled ? (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="btn btn-secondary btn-block"
          >
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>

          <div className="form-divider">or use email</div>
        </>
      ) : null}

      <form onSubmit={handleSubmit} className="duration-300 h-fit">
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
            />
          </label>
          {phase === 1 && (
            <>
              <label htmlFor="password" className="relative form-label">
                Password
                <button
                  type="button"
                  onClick={() => {
                    setViewPassword(!viewPassword);
                  }}
                  className="absolute right-2 top-1/2 "
                >
                  {viewPassword ? "Viewing" : "not viewing"}
                </button>
                <input
                  id="email"
                  type={viewPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={viewPassword ? "dev@1234" : "********"}
                  required
                  autoComplete="password"
                  className="input"
                />
              </label>
              <label htmlFor="name" className="form-label">
                Your Name
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  autoComplete="name"
                  className="input"
                />
              </label>
            </>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="btn btn-primary btn-block"
        >
          {loading ? <Loader size={15} /> : "Continue"}
        </button>
      </form>

      {error ? (
        <p className="form-error" style={{ textAlign: "center" }}>
          {error}
        </p>
      ) : null}

      <p className="auth-footer">
        {isSignup ? (
          <>
            Already have an account? <Link href="/login">Sign in</Link>
          </>
        ) : (
          <>
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </>
        )}
      </p>
    </div>
  );
}
