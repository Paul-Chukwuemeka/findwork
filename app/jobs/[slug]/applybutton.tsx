"use client";
import { useState } from "react";

export default function ApplyButton({ jobId, alreadyApplied }: { jobId: string; alreadyApplied: boolean }) {
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

  if (applied) return (
    <button disabled className="bg-green-100 text-green-700 px-8 py-3 rounded-lg font-medium">
      ✓ Applied
    </button>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="bg-black text-white px-8 py-3 rounded-lg font-medium">
        Apply for this role
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold mb-4">Apply for this role</h2>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder="Cover letter (optional)"
              rows={6}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={handleApply} disabled={loading} className="bg-black text-white px-6 py-2 rounded disabled:opacity-50">
                {loading ? "Submitting..." : "Submit application"}
              </button>
              <button onClick={() => setOpen(false)} className="border px-6 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}