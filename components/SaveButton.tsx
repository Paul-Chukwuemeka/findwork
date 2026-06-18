"use client";

import { useState } from "react";

type SaveButtonProps = {
  jobId: string;
  initialSaved: boolean;
  variant?: "text" | "icon";
};

export default function SaveButton({
  jobId,
  initialSaved,
  variant = "text",
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation(); // Avoid triggering any parent link/card click handlers
    setLoading(true);

    try {
      const res = await fetch(`/api/jobs/${jobId}/save`, { method: "POST" });
      if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(
          window.location.pathname + window.location.search
        )}`;
        return;
      }

      if (!res.ok) throw new Error("Failed to save job");
      const data = await res.json();
      setSaved(data.saved);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        className="btn btn-secondary"
        style={{
          width: "36px",
          height: "36px",
          padding: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "transform 0.15s ease, background 0.15s ease",
          cursor: "pointer",
        }}
        aria-label={saved ? "Unsave job" : "Save job"}
        title={saved ? "Unsave job" : "Save job"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={saved ? "#111" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className="btn btn-secondary"
    >
      {saved ? "Saved" : "Save job"}
    </button>
  );
}
