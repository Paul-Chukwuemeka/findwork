"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatJobType } from "@/lib/format";

type CompanyManagerProps = {
  company: {
    id: string;
    name: string;
    website: string | null;
    location: string | null;
    about: string | null;
    logoUrl: string | null;
    jobs: {
      id: string;
      title: string;
      slug: string;
      type: string;
      location: string;
      isActive: boolean;
      createdAt: Date;
    }[];
  };
};

export default function CompanyManager({ company }: CompanyManagerProps) {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(company.logoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Keep track of local job activation states
  const [jobs, setJobs] = useState(company.jobs);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setLogoUrl(data.publicUrl);
      setMessage({ type: "success", text: "Logo uploaded successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to upload image." });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: form.get("name"),
          website: form.get("website"),
          location: form.get("location"),
          about: form.get("about"),
          logoUrl,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Company details updated successfully!" });
      router.refresh();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong.";
      setMessage({ type: "error", text: errMsg });
    } finally {
      setSaving(false);
    }
  }

  async function toggleJobStatus(jobId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !currentStatus }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update status");

      setJobs((prevJobs) =>
        prevJobs.map((j) => (j.id === jobId ? { ...j, isActive: !currentStatus } : j))
      );
      router.refresh();
    } catch {
      alert("Could not update job status. Please try again.");
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2.5rem", marginTop: "2rem" }}>
      {/* Edit Form */}
      <div>
        <h2 className="heading-section" style={{ marginBottom: "1.5rem" }}>Company Profile</h2>
        
        {message && (
          <div className="notice" style={{ borderColor: message.type === "success" ? "#28a745" : "#dc3545", marginBottom: "1.5rem" }}>
            <p className="notice__title" style={{ color: message.type === "success" ? "#28a745" : "#dc3545" }}>
              {message.type === "success" ? "Success" : "Error"}
            </p>
            <p className="body-text" style={{ fontSize: 14 }}>{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="stack-16">
          <div className="form-field">
            <label className="form-label">Company Logo</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {logoUrl ? (
                <div style={{ width: 64, height: 64, borderRadius: 8, overflow: "hidden", border: "1px solid #ddd", flexShrink: 0 }}>
                  <img src={logoUrl} alt="Logo Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 8, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #ccc", flexShrink: 0, fontSize: 12, color: "#666" }}>
                  No Logo
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  style={{ fontSize: 13 }}
                />
                <p style={{ fontSize: 11, color: "#666", margin: "4px 0 0" }}>
                  {uploading ? "Uploading logo..." : "PNG, JPG or WebP. Max 2MB."}
                </p>
              </div>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="name" className="form-label">Company Name</label>
            <input
              id="name"
              name="name"
              required
              defaultValue={company.name}
              className="input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="website" className="form-label">Website URL</label>
            <input
              id="website"
              name="website"
              placeholder="https://example.com"
              defaultValue={company.website || ""}
              className="input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="location" className="form-label">Location</label>
            <input
              id="location"
              name="location"
              placeholder="e.g. Lagos, Nigeria or Remote"
              defaultValue={company.location || ""}
              className="input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="about" className="form-label">About / Bio</label>
            <textarea
              id="about"
              name="about"
              rows={5}
              placeholder="Tell developers about your company mission and culture..."
              defaultValue={company.about || ""}
              className="textarea"
            />
          </div>

          <button type="submit" disabled={saving || uploading} className="btn btn-primary" style={{ width: "100%" }}>
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Jobs Manager */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 className="heading-section">Job Postings</h2>
          <a href={`/employer/jobs/new?company=${company.id}`} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 13 }}>
            + Post Job
          </a>
        </div>

        {jobs.length === 0 ? (
          <p className="body-text" style={{ color: "#666" }}>
            No jobs posted for this company yet. Click &quot;Post Job&quot; to create one.
          </p>
        ) : (
          <div className="stack-12">
            {jobs.map((job) => (
              <div key={job.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div>
                    <h4 className="card-title" style={{ margin: 0, fontSize: 15 }}>{job.title}</h4>
                    <p className="card-meta" style={{ marginTop: 4 }}>
                      {formatJobType(job.type)} · {job.location}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleJobStatus(job.id, job.isActive)}
                    className="btn"
                    style={{
                      padding: "4px 8px",
                      fontSize: 12,
                      backgroundColor: job.isActive ? "#d1fae5" : "#fee2e2",
                      color: job.isActive ? "#065f46" : "#991b1b",
                      border: "none",
                      borderRadius: 6,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {job.isActive ? "Active" : "Closed"}
                  </button>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f3f4f6", paddingTop: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                  <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "#2563eb", textDecoration: "underline" }}>
                    View Public Page
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
