"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

type Resume = {
  id: string;
  url: string;
  fileName: string;
  createdAt: string;
};

type ApplyFormProps = {
  jobId: string;
  jobSlug: string;
  initialResumeUrl?: string | null;
};

export function ApplyForm({
  jobId,
  jobSlug,
  initialResumeUrl,
}: ApplyFormProps) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string | null>(null);
  const [previousResumes, setPreviousResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [loadingResumes, setLoadingResumes] = useState(true);

  const fileRef = useRef(null);

  const VALID_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

  function isValidResumeFile(file: File): boolean {
    const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    const validExt = VALID_RESUME_EXTENSIONS.includes(ext);
    const validMime = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ].includes(file.type);
    return validExt && validMime;
  }

  useEffect(() => {
    async function fetchResumes() {
      try {
        const response = await fetch("/api/user/resumes");
        if (response.ok) {
          const resumes = (await response.json()) as Resume[];
          setPreviousResumes(resumes);
        }
      } catch {
        // silently fail if resumes can't be fetched
      } finally {
        setLoadingResumes(false);
      }
    }

    fetchResumes();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setUploadError("");

    try {
      let resumeUrl: string | null = null;

      // Use selected previous resume or upload new one
      if (selectedResumeUrl) {
        resumeUrl = selectedResumeUrl;
      } else if (resumeFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", resumeFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const payload = (await uploadResponse.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? "Could not upload resume");
        }

        const uploadData = (await uploadResponse.json()) as {
          publicUrl: string;
        };
        resumeUrl = uploadData.publicUrl;
      }

      const response = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        body: JSON.stringify({
          coverLetter,
          resumeUrl,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(`/jobs/${jobSlug}/apply`)}`,
        );
        return;
      }

      if (response.status === 409) {
        setSubmitted(true);
        return;
      }

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(payload?.error ?? "Could not submit application");
      }

      setSubmitted(true);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not submit application",
      );
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="notice">
        <p className="notice__title">Application submitted</p>
        <p className="body-text">
          Your application is now on your developer dashboard.
        </p>
        <div className="apply-actions">
          <Link href="/developer/dashboard" className="btn btn-primary">
            View dashboard
          </Link>
          <Link href={`/jobs/${jobSlug}`} className="btn btn-secondary">
            Back to role
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="apply-panel stack-16">
      <h2 className="apply-panel__title">Application details</h2>

      <div className="form-field" style={{ marginBottom: 0 }}>
        <label htmlFor="resumeFile" className="form-label">
          Resume
        </label>

        {!loadingResumes && previousResumes.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem" }}>
              Or select a previous resume:
            </p>
            <select
              value={selectedResumeUrl ?? ""}
              onChange={(e) => {
                setSelectedResumeUrl(e.target.value || null);
                if (e.target.value) {
                  setResumeFile(null);
                }
              }}
              className="input"
              style={{ marginBottom: "0.5rem" }}
            >
              <option value="">-- Choose a resume --</option>
              {previousResumes.map((resume) => (
                <option key={resume.id} value={resume.url}>
                  {resume.fileName}
                </option>
              ))}
            </select>
          </div>
        )}

        <input
          id="resumeFile"
          name="resumeFile"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setUploadError("");
            if (file) {
              if (!isValidResumeFile(file)) {
                setUploadError(
                  "Invalid file type. Please upload a PDF or Word document (.pdf, .doc, .docx)"
                );
                setResumeFile(null);
                return;
              }
              setResumeFile(file);
              setSelectedResumeUrl(null);
            } else {
              setResumeFile(null);
            }
          }}
          className={resumeFile ? "input cursor-pointer" : "hidden"}
          ref={fileRef}
        />
        {!resumeFile && !selectedResumeUrl && (
          <button
            className="max-w-40 input border border-neutral-300 rounded-sm bg-neutral-100 px-2 p-1"
            type="button"
            onClick={() => fileRef.current && fileRef.current.click()}
          >
            Upload Resume
          </button>
        )}
        {resumeFile && (
          <div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Selected: <strong>{resumeFile.name}</strong>
            <button
              type="button"
              onClick={() => setResumeFile(null)}
              style={{
                marginLeft: "0.5rem",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
              }}
              className="btn btn-secondary"
            >
              Change
            </button>
          </div>
        )}
        {selectedResumeUrl && (
          <div style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
            Selected: <strong>{previousResumes.find((r) => r.url === selectedResumeUrl)?.fileName}</strong>
            <button
              type="button"
              onClick={() => setSelectedResumeUrl(null)}
              style={{
                marginLeft: "0.5rem",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
              }}
              className="btn btn-secondary"
            >
              Change
            </button>
          </div>
        )}
      </div>

      <div className="form-field" style={{ marginBottom: 0 }}>
        <label htmlFor="coverLetter" className="form-label">
          Cover letter
        </label>
        <textarea
          id="coverLetter"
          name="coverLetter"
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
          placeholder="Share why you are a strong fit for this role."
          rows={8}
          className="textarea"
        />
      </div>

      <div className="apply-actions">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Submitting..." : "Submit application"}
        </button>
        <Link href={`/jobs/${jobSlug}`} className="btn btn-secondary">
          Cancel
        </Link>
      </div>

      {error ? <p className="form-error">{error}</p> : null}
      {uploadError ? <p className="form-error">{uploadError}</p> : null}
    </form>
  );
}
