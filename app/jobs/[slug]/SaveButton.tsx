"use client";

import { useState } from "react";

export default function SaveButton({
  jobId,
  initialSaved,
}: {
  jobId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/jobs/${jobId}/save`, { method: "POST" });

    const text = await res.text();

    if (!text) {
      setLoading(false);
      return;
    }

    const data = JSON.parse(text);
    setSaved(data.saved);
    setLoading(false);
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
