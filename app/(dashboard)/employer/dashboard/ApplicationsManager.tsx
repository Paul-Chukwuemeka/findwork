"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApplicationStatus } from "@/components/ApplicationStatus";

type Application = {
  id: string;
  createdAt: Date;
  status: string;
  coverLetter: string | null;
  resumeUrl: string | null;
  job: {
    title: string;
    slug: string;
    company: {
      name: string;
    };
  };
  user: {
    id: string;
    name: string | null;
    email: string | null;
    bio: string | null;
    skills: string[];
    githubUrl: string | null;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
  };
};

type ApplicationsManagerProps = {
  initialApplications: Application[];
};

export default function ApplicationsManager({
  initialApplications,
}: ApplicationsManagerProps) {
  const router = useRouter();
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function handleStatusChange(appId: string, newStatus: string) {
    setUpdatingId(appId);
    try {
      const res = await fetch(`/api/employer/applications/${appId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to update status");

      await res.json();

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, status: newStatus } : app,
        ),
      );

      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
      }

      router.refresh();
    } catch {
      alert("Could not update candidate status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
      {/* Applications List */}
      <div className="stack-12">
        {applications.map((app) => (
          <div
            key={app.id}
            className="card"
            style={{
              cursor: "pointer",
              border:
                selectedApp?.id === app.id
                  ? "1px solid #111"
                  : "1px solid #eaeaea",
              transition: "border 0.2s",
            }}
            onClick={() => setSelectedApp(app)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <p className="card-title" style={{ margin: 0, fontSize: 16 }}>
                  {app.user.name || "Anonymous Candidate"}
                </p>
                <p className="card-meta" style={{ marginTop: 2 }}>
                  {app.user.email}
                </p>
                <p className="card-meta" style={{ marginTop: 6 }}>
                  Applied for:{" "}
                  <strong style={{ color: "#333" }}>{app.job.title}</strong> ·{" "}
                  {app.job.company.name}
                </p>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span style={{ fontSize: 13, color: "#888" }}>
                  {new Date(app.createdAt).toLocaleDateString()}
                </span>
                <ApplicationStatus status={app.status} />
              </div>
            </div>

            {/* Expanded inline details if selected */}
            {selectedApp?.id === app.id && (
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #eaeaea",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
                onClick={(e) => e.stopPropagation()} // Prevent closing/re-opening on child clicks
              >
                {/* Candidate Profile Details */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                  backgroundColor: "#fafafa",
                  border: "1px solid #eaeaea",
                  padding: "16px 20px",
                  borderRadius: "8px",
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <h4 style={{ margin: "0 0 6px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#666", fontWeight: 600 }}>Bio</h4>
                      <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: "1.6" }}>
                        {app.user.bio || <span style={{ fontStyle: "italic", color: "#888" }}>No bio provided.</span>}
                      </p>
                    </div>
                    
                    <div>
                      <h4 style={{ margin: "0 0 8px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#666", fontWeight: 600 }}>Skills</h4>
                      {app.user.skills && app.user.skills.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {app.user.skills.map((skill, index) => (
                            <span key={index} style={{
                              display: "inline-block",
                              fontSize: "12px",
                              color: "#333",
                              background: "#eaeaea",
                              padding: "3px 10px",
                              borderRadius: "4px",
                              fontWeight: 500,
                            }}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: 13, color: "#888", fontStyle: "italic" }}>No skills listed.</p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <h4 style={{ margin: "0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#666", fontWeight: 600 }}>Links</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {app.user.githubUrl && (
                        <a
                          href={app.user.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "14px",
                            color: "#111",
                            textDecoration: "underline",
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                          </svg>
                          GitHub Profile
                        </a>
                      )}
                      {app.user.linkedinUrl && (
                        <a
                          href={app.user.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "14px",
                            color: "#111",
                            textDecoration: "underline",
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                          </svg>
                          LinkedIn Profile
                        </a>
                      )}
                      {app.user.portfolioUrl && (
                        <a
                          href={app.user.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "14px",
                            color: "#111",
                            textDecoration: "underline",
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                          </svg>
                          Portfolio Website
                        </a>
                      )}
                      {!app.user.githubUrl && !app.user.linkedinUrl && !app.user.portfolioUrl && (
                        <p style={{ margin: 0, fontSize: 13, color: "#888", fontStyle: "italic" }}>No links provided.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Resume section */}
                <div>
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Resume / CV
                  </h4>
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        fontSize: 13,
                        textDecoration: "none",
                      }}
                    >
                      📄 Open Candidate Resume
                    </a>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      No resume uploaded.
                    </p>
                  )}
                </div>

                {/* Cover Letter section */}
                <div>
                  <h4
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Cover Letter
                  </h4>
                  {app.coverLetter ? (
                    <div
                      style={{
                        backgroundColor: "#f9fafb",
                        border: "1px solid #f3f4f6",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: "#374151",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {app.coverLetter}
                    </div>
                  ) : (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#666",
                        fontStyle: "italic",
                      }}
                    >
                      No cover letter provided.
                    </p>
                  )}
                </div>

                {/* Status Update Dropdown */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    htmlFor={`status-select-${app.id}`}
                    style={{ fontSize: 14, fontWeight: 600 }}
                  >
                    Update Application Status:
                  </label>
                  <select
                    id={`status-select-${app.id}`}
                    value={app.status}
                    disabled={updatingId === app.id}
                    onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: 13,
                      backgroundColor: "#fff",
                    }}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                  {updatingId === app.id && (
                    <span style={{ fontSize: 12, color: "#666" }}>
                      Updating...
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
