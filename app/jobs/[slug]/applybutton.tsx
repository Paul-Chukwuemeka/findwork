"use client";

import { useState } from "react";

export default function ApplyButton({
  jobId,
  alreadyApplied,
}: {
  jobId: string;
  alreadyApplied: boolean;
}) {
  const [applied, setApplied] = useState(alreadyApplied);
  const [open, setOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    setLoading(true);
    await fetch(`/api/jobs/${jobId}/apply`, {
      method: "POST",
      body: JSON.stringify({ coverLetter }),
      headers: { "Content-Type": "application/json" },
    });
    setApplied(true);
    setOpen(false);
    setLoading(false);
  }

  if (applied) {
    return (
      <button type="button" disabled className="btn btn-secondary">
        Applied
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn btn-primary"
      >
        Apply for this role
      </button>

      {open && (
        <div className="apply-panel">
          <h2 className="apply-panel__title">Apply for this role</h2>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label htmlFor="coverLetter" className="form-label">
              Cover letter
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Optional"
              rows={6}
              className="textarea"
            />
          </div>
          <div className="apply-actions">
            <button
              type="button"
              onClick={handleApply}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Submitting..." : "Submit application"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
