"use client";

import { useState } from "react";
import Link from "next/link";
import { ApplicationStatus } from "@/components/ApplicationStatus";

type JobWithCompany = {
  id: string;
  title: string;
  slug: string;
  location: string;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
  };
};

type Application = {
  id: string;
  jobId: string;
  userId: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: "PENDING" | "REVIEWED" | "SHORTLISTED" | "REJECTED";
  createdAt: Date;
  job: JobWithCompany;
};

export default function DeveloperApplicationsManager({
  applications,
}: {
  applications: Application[];
}) {
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedAppId(expandedAppId === id ? null : id);
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "PENDING":
        return 1;
      case "REVIEWED":
        return 2;
      case "SHORTLISTED":
      case "REJECTED":
        return 3;
      default:
        return 1;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Your application has been received and is waiting to be reviewed by the employer.";
      case "REVIEWED":
        return "The employer has viewed your application and is currently evaluating it.";
      case "SHORTLISTED":
        return "Congratulations! You have been shortlisted for this role. The employer will be in touch with you shortly.";
      case "REJECTED":
        return "Thank you for your interest. Unfortunately, the employer has decided not to move forward with your application.";
      default:
        return "";
    }
  };

  return (
    <div className="stack-12" style={{ marginTop: 16 }}>
      {applications.map((app) => {
        const isExpanded = expandedAppId === app.id;
        const currentStep = getStatusStep(app.status);

        return (
          <div
            key={app.id}
            className="card"
            style={{
              cursor: "pointer",
              transition: "border-color 0.2s, box-shadow 0.2s",
              borderColor: isExpanded ? "#111" : "#e5e5e5",
              boxShadow: isExpanded ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
            }}
            onClick={() => toggleExpand(app.id)}
          >
            {/* Header info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <p className="card-title" style={{ fontSize: "16px", margin: 0 }}>
                    {app.job.title}
                  </p>
                  <ApplicationStatus status={app.status} />
                </div>
                <p className="card-meta" style={{ color: "#555", marginTop: "4px", margin: 0 }}>
                  {app.job.company.name} · {app.job.location}
                </p>
              </div>

              {/* Action / Caret */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#666",
                    display: "none", // standard media query fallback if desired, but flex works
                  }}
                  className="meta"
                >
                  Applied {new Date(app.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    padding: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    transform: isExpanded ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s ease",
                  }}
                  aria-expanded={isExpanded}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#666"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isExpanded && (
              <div
                style={{
                  marginTop: "1.5rem",
                  paddingTop: "1.5rem",
                  borderTop: "1px solid #eaeaea",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
                onClick={(e) => e.stopPropagation()} // stop toggle collapse on content clicks
              >
                {/* Stepper / Status Tracking */}
                <div>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#666", fontWeight: 600 }}>
                    Application Progress
                  </h4>
                  
                  {/* Stepper Bar */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "1rem 0" }}>
                    {/* Step 1: Applied */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ height: "4px", backgroundColor: "#2e7d32", borderRadius: "2px" }} />
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "#2e7d32" }}>Applied</span>
                    </div>

                    {/* Step 2: Reviewed */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div
                        style={{
                          height: "4px",
                          backgroundColor: currentStep >= 2 ? "#2e7d32" : "#e0e0e0",
                          borderRadius: "2px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: currentStep >= 2 ? "#2e7d32" : "#888",
                        }}
                      >
                        Reviewed
                      </span>
                    </div>

                    {/* Step 3: Decision */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div
                        style={{
                          height: "4px",
                          backgroundColor:
                            currentStep === 3
                              ? app.status === "REJECTED"
                                ? "#c62828"
                                : "#2e7d32"
                              : "#e0e0e0",
                          borderRadius: "2px",
                        }}
                      />
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color:
                            currentStep === 3
                              ? app.status === "REJECTED"
                                ? "#c62828"
                                : "#2e7d32"
                              : "#888",
                        }}
                      >
                        {app.status === "REJECTED" ? "Rejected" : app.status === "SHORTLISTED" ? "Shortlisted" : "Decision"}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: "14px", color: "#444", fontStyle: "italic", lineHeight: "1.5" }}>
                    {getStatusMessage(app.status)}
                  </p>
                </div>

                {/* Cover Letter Section */}
                <div>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: "#666", fontWeight: 600 }}>
                    Submitted Cover Letter
                  </h4>
                  {app.coverLetter ? (
                    <div
                      style={{
                        backgroundColor: "#fafafa",
                        border: "1px solid #eaeaea",
                        borderRadius: "8px",
                        padding: "16px",
                        fontSize: "14px",
                        lineHeight: "1.6",
                        color: "#333",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {app.coverLetter}
                    </div>
                  ) : (
                    <p style={{ margin: 0, fontSize: 14, color: "#888", fontStyle: "italic" }}>
                      No cover letter was submitted with this application.
                    </p>
                  )}
                </div>

                {/* Actions / Links */}
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        textDecoration: "none",
                        fontSize: "13px",
                        padding: "8px 14px",
                        height: "auto",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      View Submitted Resume
                    </a>
                  )}

                  <Link
                    href={`/jobs/${app.job.slug}`}
                    className="btn btn-primary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      textDecoration: "none",
                      fontSize: "13px",
                      padding: "8px 14px",
                      height: "auto",
                    }}
                  >
                    View Original Job Posting
                  </Link>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
