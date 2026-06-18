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
