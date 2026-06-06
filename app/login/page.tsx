"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("resend", {
      email,
      redirect: false,
      redirectTo: "/onboarding",
    });

    setLoading(false);

    if (!result?.ok || result.error) {
      setError("We could not send that magic link. Check your email setup and try again.");
      return;
    }

    setSent(true);
  }

  if (sent) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-500">We sent a magic link to <strong>{email}</strong></p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to DevBoard</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
          <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-400">or</span></div>
        </div>
        {/* <button
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="w-full border py-2 rounded flex items-center justify-center gap-2"
        >
          Continue with Google
        </button> */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account? Signing in will create one.
        </p>
      </div>
    </div>
  );
}
