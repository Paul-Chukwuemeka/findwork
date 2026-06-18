"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { DeveloperNav } from "@/components/DeveloperNav";

type Resume = {
  id: string;
  fileName: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
};

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadResumes() {
    try {
      const res = await fetch("/api/user/resumes");
      if (!res.ok) throw new Error("Failed to load resumes");
      const data = await res.json();
      setResumes(data);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Could not fetch resumes.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => {
      loadResumes();
    });
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }

      setSuccess(`Successfully uploaded ${file.name}`);
      // Clear file input
      e.target.value = "";
      await loadResumes();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to upload resume.";
      setError(errMsg);
    } finally {
      setUploading(false);
    }
  }

  async function setPrimary(id: string) {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/resumes", {
        method: "PATCH",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to set primary resume");
      setSuccess("Primary resume updated");
      await loadResumes();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update default resume.";
      setError(errMsg);
    }
  }

  async function deleteResume(id: string, fileName: string) {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/user/resumes?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete resume");
      setSuccess("Resume deleted successfully");
      await loadResumes();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to delete resume.";
      setError(errMsg);
    }
  }

  return (
    <PageShell active="dashboard" medium>
      <h1 className="heading-page">Resumes & CVs</h1>
      <p className="page-subtitle">
        Manage your resumes for job applications.
      </p>

      <DeveloperNav />

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}
      {success && <p style={{ color: "green", fontSize: 14, marginBottom: 16 }}>{success}</p>}

      <section className="section" style={{ marginBottom: 40 }}>
        <h2 className="heading-section" style={{ marginBottom: 16 }}>Upload new resume</h2>
        <div className="card" style={{ padding: 24 }}>
          <div className="form-field">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleUpload}
              disabled={uploading}
              className="input"
              style={{ padding: "8px 12px" }}
            />
            <p className="text-xs text-[#666]" style={{ marginTop: 8 }}>
              PDF, DOC, or DOCX formats accepted. Max file size: 5MB.
            </p>
          </div>
          {uploading && <p className="meta" style={{ marginTop: 8 }}>Uploading file...</p>}
        </div>
      </section>

      <section className="section">
        <h2 className="heading-section" style={{ marginBottom: 16 }}>Your Resumes</h2>
        {loading ? (
          <p className="body-text">Loading resumes...</p>
        ) : resumes.length === 0 ? (
          <p className="body-text" style={{ fontSize: 16 }}>
            No resumes uploaded yet. Upload a resume above to start applying.
          </p>
        ) : (
          <div className="stack-12">
            {resumes.map((r) => (
              <div key={r.id} className="card row-between" style={{ padding: 20 }}>
                <div>
                  <div className="flex items-center gap-3">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-title font-medium hover:underline text-[#111]"
                      style={{ textDecoration: "none" }}
                    >
                      {r.fileName}
                    </a>
                    {r.isPrimary && (
                      <span
                        className="pill"
                        style={{
                          fontSize: 10,
                          backgroundColor: "#f5f5f5",
                          border: "1px solid #ddd",
                          padding: "2px 6px",
                          marginLeft: 8,
                          color: "#333",
                        }}
                      >
                        Default Primary
                      </span>
                    )}
                  </div>
                  <p className="meta" style={{ marginTop: 4 }}>
                    Uploaded on {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {!r.isPrimary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(r.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: 12, padding: "6px 12px" }}
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteResume(r.id, r.fileName)}
                    className="btn btn-secondary text-red-600 hover:text-red-800"
                    style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #ffcccc", color: "#d9534f" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
