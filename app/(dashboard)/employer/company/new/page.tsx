"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { useSession } from "next-auth/react";

export default function NewCompanyPage() {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = new FormData(e.currentTarget);

      let logoUrl = "";
      if (logoFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", logoFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) throw new Error("Logo upload failed");

        const { publicUrl } = await uploadRes.json();
        logoUrl = publicUrl;
      }

      const companyRes = await fetch("/api/companies", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          website: form.get("website"),
          location: form.get("location"),
          about: form.get("about"),
          logoUrl,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!companyRes.ok) throw new Error("Company creation failed");

      // Mark employer as onboarded
      await fetch("/api/user/onboard", {
        method: "PATCH",
        body: JSON.stringify({ onboarded: true }),
        headers: { "Content-Type": "application/json" },
      });
      await update();

      router.push("/employer/jobs/new");
    } catch {
      setError("Could not create the company. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell narrow>
      <p className="label-upper">Employer setup</p>
      <h1 className="heading-page">Create your company profile</h1>
      <p className="page-subtitle">
        Tell developers about your company before posting jobs.
      </p>

      <form onSubmit={handleSubmit} className="stack-16">
        <div className="form-field">
          <label htmlFor="name" className="form-label">
            Company name
          </label>
          <input id="name" name="name" required className="input" />
        </div>

        <div className="form-field">
          <label htmlFor="website" className="form-label">
            Website
          </label>
          <input id="website" name="website" className="input" />
        </div>

        <div className="form-field">
          <label htmlFor="location" className="form-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            placeholder="Lagos, Nigeria"
            className="input"
          />
        </div>

        <div className="form-field">
          <label htmlFor="about" className="form-label">
            About
          </label>
          <textarea id="about" name="about" rows={4} className="textarea" />
        </div>

        <div className="form-field">
          <label htmlFor="logo" className="form-label">
            Company logo
          </label>
          <input
            id="logo"
            type="file"
            accept="image/*"
            className="input"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Creating..." : "Create company"}
        </button>

        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </PageShell>
  );
}
