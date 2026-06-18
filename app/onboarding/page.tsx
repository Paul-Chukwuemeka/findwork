"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { SiteNav } from "@/components/SiteNav";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (session?.user?.onboarded) {
      router.push(
        session.user.role === "EMPLOYER"
          ? "/employer/dashboard"
          : "/developer/dashboard",
      );
    } else if (session?.user?.role === "EMPLOYER") {
      router.push("/employer/company/new");
    }
  }, [session, router]);

  async function pickRole(role: "EMPLOYER" | "DEVELOPER") {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/role", {
        method: "PATCH",
        body: JSON.stringify({ role }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to set role");
      
      await update();
      
      if (role === "EMPLOYER") {
        router.push("/employer/company/new");
      } else {
        setStep(2);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. If a resume is selected, upload it first
      if (resumeFile) {
        const uploadForm = new FormData();
        uploadForm.append("file", resumeFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.error || "Resume upload failed");
        }
      }

      // 2. Save developer profile fields (skills, bio, URLs)
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const profileRes = await fetch("/api/user/profile", {
        method: "PATCH",
        body: JSON.stringify({
          bio,
          skills: skillsArray,
          githubUrl,
          linkedinUrl,
          portfolioUrl,
        }),
        headers: { "Content-Type": "application/json" },
      });

      if (!profileRes.ok) {
        throw new Error("Failed to save profile details");
      }

      // 3. Mark as onboarded
      const onboardRes = await fetch("/api/user/onboard", {
        method: "PATCH",
        body: JSON.stringify({ onboarded: true }),
        headers: { "Content-Type": "application/json" },
      });

      if (!onboardRes.ok) {
        throw new Error("Failed to finalize onboarding status");
      }

      // 4. Update session and redirect
      await update();
      router.push("/developer/dashboard");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "An error occurred during onboarding.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page flex flex-col">
      <SiteNav showAuth={false} />
      <div
        style={{ padding: "50px 20px" }}
        className="flex items-start justify-center w-full flex-1"
      >
        <div style={{ maxWidth: 480, width: "100%" }}>
          {step === 1 ? (
            <div style={{ textAlign: "center" }}>
              <p className="text-[#999] text-lg">Onboarding Step 1 of 2</p>
              <h1 className="heading-page">
                Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
              </h1>
              <p className="page-subtitle">How are you using FindWork?</p>

              <div className="onboarding-grid">
                <button
                  type="button"
                  onClick={() => pickRole("DEVELOPER")}
                  disabled={loading}
                  className="onboarding-option"
                >
                  <p className="onboarding-option__title">
                    I&apos;m looking for work
                  </p>
                  <p className="onboarding-option__desc">
                    Browse and apply to jobs
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => pickRole("EMPLOYER")}
                  disabled={loading}
                  className="onboarding-option"
                >
                  <p className="onboarding-option__title">I&apos;m hiring</p>
                  <p className="onboarding-option__desc">
                    Post jobs and find talent
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[#999] text-sm label-upper">Onboarding Step 2 of 2</p>
              <h1 className="heading-page">Tell us about yourself</h1>
              <p className="page-subtitle">
                Complete your developer profile to apply for jobs.
              </p>

              <form onSubmit={handleSubmitProfile} className="stack-16" style={{ marginTop: 24 }}>
                <div className="form-field">
                  <label htmlFor="bio" className="form-label">
                    Bio / Summary
                  </label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short description about your professional background..."
                    rows={3}
                    className="textarea"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="skills" className="form-label">
                    Tech Stack / Skills
                  </label>
                  <input
                    id="skills"
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, Node.js, TypeScript, Next.js"
                    className="input"
                    required
                  />
                  <p className="text-xs text-[#666]" style={{ marginTop: 4 }}>
                    Separated by commas
                  </p>
                </div>

                <div className="form-field">
                  <label htmlFor="github" className="form-label">
                    GitHub URL
                  </label>
                  <input
                    id="github"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="linkedin" className="form-label">
                    LinkedIn URL
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="portfolio" className="form-label">
                    Portfolio URL
                  </label>
                  <input
                    id="portfolio"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="input"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="resume" className="form-label">
                    Upload Resume / CV (Optional)
                  </label>
                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                    className="input"
                  />
                  <p className="text-xs text-[#666]" style={{ marginTop: 4 }}>
                    Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                  style={{ width: "100%", marginTop: 12 }}
                >
                  {loading ? "Completing setup..." : "Complete Profile"}
                </button>
              </form>
            </div>
          )}

          {error && (
            <p className="form-error" style={{ marginTop: 16, textAlign: "center" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
