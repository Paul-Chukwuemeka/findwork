"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

export default function NewJobPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/companies/mine").then(r => r.json()).then(setCompanies);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/jobs", {
        method: "POST",
        body: JSON.stringify({
          companyId: form.get("companyId"),
          title: form.get("title"),
          description: form.get("description"),
          type: form.get("type"),
          location: form.get("location"),
          salaryRange: form.get("salaryRange"),
          tags: (form.get("tags") as string).split(",").map(t => t.trim()).filter(Boolean),
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Job creation failed");

      const job = await res.json();
      router.push(`/jobs/${job.slug}`);
    } catch {
      setError("Could not post the job. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Post a job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select name="companyId" required className="w-full border rounded px-3 py-2">
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="title" placeholder="Job title" required className="w-full border rounded px-3 py-2" />
        <select name="type" className="w-full border rounded px-3 py-2">
          {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
        </select>
        <input name="location" placeholder="Location or Remote" required className="w-full border rounded px-3 py-2" />
        <input name="salaryRange" placeholder="Salary range (optional)" className="w-full border rounded px-3 py-2" />
        <input name="tags" placeholder="Tags (comma-separated): React, Node.js, Remote" className="w-full border rounded px-3 py-2" />
        <textarea name="description" placeholder="Job description (markdown supported)" rows={8} required className="w-full border rounded px-3 py-2" />
        <button type="submit" disabled={loading} className="bg-black text-white px-6 py-2 rounded disabled:opacity-50">
          {loading ? "Posting..." : "Post job"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
