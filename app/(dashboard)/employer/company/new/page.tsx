"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCompanyPage() {
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

    router.push("/employer/jobs/new");
  } catch {
    setError("Could not create the company. Please try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Create your company profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Company name"
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="website"
          placeholder="Website URL"
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="location"
          placeholder="Location (e.g. Lagos, Nigeria)"
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="about"
          placeholder="About your company"
          rows={4}
          className="w-full border rounded px-3 py-2"
        />
        <div>
          <label className="block text-sm mb-1">Company logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create company"}
        </button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </div>
  );
}
