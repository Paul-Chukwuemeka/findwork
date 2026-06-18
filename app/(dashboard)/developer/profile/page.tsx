"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { DeveloperNav } from "@/components/DeveloperNav";

export default function ProfilePage() {
  const [bio, setBio] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setBio(data.bio || "");
        setGithubUrl(data.githubUrl || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setPortfolioUrl(data.portfolioUrl || "");
        setSkillsInput(data.skills ? data.skills.join(", ") : "");
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Could not fetch profile details.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    }
    Promise.resolve().then(() => {
      loadProfile();
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const parsedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
          skills: parsedSkills,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Save failed");
      }

      setSuccess("Profile updated successfully!");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update profile.";
      setError(errMsg);
    } finally {
      setSaving(false);
    }
  }

  const currentSkills = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <PageShell active="profile" medium>
      <h1 className="heading-page">Developer Profile</h1>
      <p className="page-subtitle">
        Manage your bio, skills, and links visible to employers.
      </p>

      <DeveloperNav />

      {error && <p className="form-error" style={{ marginBottom: 16 }}>{error}</p>}
      {success && <p style={{ color: "green", fontSize: 14, marginBottom: 16 }}>{success}</p>}

      {loading ? (
        <p className="body-text">Loading profile details...</p>
      ) : (
        <form onSubmit={handleSave} className="stack-24" style={{ maxWidth: 640 }}>
          <div className="form-field">
            <label htmlFor="bio" className="form-label">
              Professional Summary / Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell employers about your experience, achievements, and what you are looking for..."
              className="input"
              style={{ minHeight: 120, resize: "vertical", padding: 12 }}
            />
          </div>

          <div className="form-field">
            <label htmlFor="skills" className="form-label">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, Next.js, Node.js, Python, TypeScript..."
              className="input"
            />
            {currentSkills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {currentSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="pill"
                    style={{
                      fontSize: 12,
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #ddd",
                      padding: "4px 8px",
                      borderRadius: 4,
                      color: "#333",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="githubUrl" className="form-label">
              GitHub Profile URL
            </label>
            <input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourusername"
              className="input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="linkedinUrl" className="form-label">
              LinkedIn Profile URL
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourusername"
              className="input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="portfolioUrl" className="form-label">
              Portfolio / Personal Site URL
            </label>
            <input
              id="portfolioUrl"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourwebsite.dev"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: "fit-content", padding: "10px 24px" }}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}
    </PageShell>
  );
}
