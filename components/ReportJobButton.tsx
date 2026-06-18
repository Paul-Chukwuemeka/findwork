"use client";

import { useState } from "react";

type ReportJobButtonProps = {
  jobId: string;
};

export default function ReportJobButton({ jobId }: ReportJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("Spam / Misleading");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch(`/api/jobs/${jobId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details }),
      });

      if (!res.ok) throw new Error("Failed to submit report");

      setStatus({ type: "success", message: "Thank you. This job has been reported for moderation." });
      setDetails("");
      setTimeout(() => {
        setIsOpen(false);
        setStatus(null);
      }, 3000);
    } catch {
      setStatus({ type: "error", message: "Failed to submit report. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#dc3545",
          borderColor: "#dc3545",
          padding: "8px 16px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
        Report Job
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "100%",
              maxWidth: "440px",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#111", margin: 0 }}>Report Listing</h3>
                <p style={{ fontSize: "13px", color: "#666", marginTop: "4px" }}>Help us keep FindWork clean and secure.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#999",
                  cursor: "pointer",
                  padding: "4px",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {status ? (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  backgroundColor: status.type === "success" ? "#ecfdf5" : "#fef2f2",
                  border: `1px solid ${status.type === "success" ? "#a7f3d0" : "#fecaca"}`,
                  color: status.type === "success" ? "#065f46" : "#991b1b",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  marginBottom: "16px",
                }}
              >
                {status.message}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="stack-16">
                <div className="form-field">
                  <label htmlFor="reason" className="form-label" style={{ fontSize: "13px", fontWeight: 600 }}>
                    Reason for reporting
                  </label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  >
                    <option value="Spam / Misleading">Spam / Misleading</option>
                    <option value="Inappropriate content">Inappropriate content</option>
                    <option value="Harassment / Abuse">Harassment / Abuse</option>
                    <option value="Expired / Fake job">Expired / Fake job</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="details" className="form-label" style={{ fontSize: "13px", fontWeight: 600 }}>
                    Additional details (optional)
                  </label>
                  <textarea
                    id="details"
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any context that will help our moderation team review this listing..."
                    className="textarea"
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
                  />
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "end", marginTop: "20px" }}>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="btn btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ backgroundColor: "#dc3545", borderColor: "#dc3545", color: "#fff" }}
                  >
                    {submitting ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
