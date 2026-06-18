"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { formatJobType } from "@/lib/format";
import { EmployerNav } from "@/components/EmployerNav";

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"];

export default function NewJobPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/companies/mine").then((r) => r.json()).then(setCompanies);
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
          tags: (form.get("tags") as string)
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
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
    <PageShell active="dashboard" medium>
      <EmployerNav />
      <p className="label-upper">Post a role</p>
      <h1 className="heading-page">Post a job</h1>
      <p className="page-subtitle">
        Describe the role, requirements, and where it is based.
      </p>

      <form onSubmit={handleSubmit} className="stack-16">
        <div className="form-field">
          <label htmlFor="companyId" className="form-label">
            Company
          </label>
          <select id="companyId" name="companyId" required className="select">
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="title" className="form-label">
            Job title
          </label>
          <input id="title" name="title" required className="input" />
        </div>

        <div className="form-field">
          <label htmlFor="type" className="form-label">
            Job type
          </label>
          <select id="type" name="type" className="select">
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>
                {formatJobType(t)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            placeholder="Location or Remote"
            required
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="salaryRange" className="form-label">
            Salary range
          </label>
          <input
            id="salaryRange"
            name="salaryRange"
            placeholder="Optional"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="tags" className="form-label">
            Tags
          </label>
          <input
            id="tags"
            name="tags"
            placeholder="React, Node.js, Remote"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={8}
            required
            className="textarea"
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Posting..." : "Post job"}
        </button>

        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </PageShell>
  );
}
