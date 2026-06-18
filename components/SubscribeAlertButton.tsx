"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type SubscribeAlertButtonProps = {
  query?: string;
  location?: string;
};

export function SubscribeAlertButton({ query, location }: SubscribeAlertButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const keywordList = query
    ? query.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const canSubscribe = keywordList.length > 0 || location;

  async function handleSubscribe() {
    if (!session) {
      router.push("/login?callbackUrl=/jobs");
      return;
    }

    if (session.user.role !== "DEVELOPER") {
      setError("Only developer accounts can subscribe to job alerts.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // If there's no query, fallback to "Any" or a generic keyword
      const keywords = keywordList.length > 0 ? keywordList : ["Any"];
      
      const res = await fetch("/api/user/alerts", {
        method: "POST",
        body: JSON.stringify({
          keywords,
          location: location || null,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to subscribe");
      }

      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An error occurred.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  if (!canSubscribe) return null;

  return (
    <div style={{ marginTop: 12 }} className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading || subscribed}
        className="btn btn-secondary"
        style={{ padding: "6px 12px", fontSize: 13 }}
      >
        {subscribed ? "✓ Subscribed to Alert" : "🔔 Alert me of new roles like this"}
      </button>
      {error && <span style={{ color: "#d9534f", fontSize: 12 }}>{error}</span>}
    </div>
  );
}
