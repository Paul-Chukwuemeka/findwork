"use client";

import { useState } from "react";
import { formatJobType } from "@/lib/format";

type Company = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  location: string | null;
  verified: boolean;
  createdAt: Date;
  owner: {
    name: string | null;
    email: string;
  };
  _count: {
    jobs: number;
  };
};

type Job = {
  id: string;
  title: string;
  slug: string;
  type: string;
  location: string;
  salaryRange: string | null;
  isActive: boolean;
  createdAt: Date;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    verified: boolean;
  };
  _count: {
    reports: number;
    applications: number;
  };
};

type Report = {
  id: string;
  jobId: string;
  reason: string;
  details: string | null;
  createdAt: Date;
  job: {
    id: string;
    title: string;
    slug: string;
    isActive: boolean;
    company: {
      name: string;
    };
  } | null;
  reporter: {
    name: string | null;
    email: string;
  } | null;
};

type AdminDashboardProps = {
  initialJobs: Job[];
  initialCompanies: Company[];
  initialReports: Report[];
};

export default function AdminDashboard({
  initialJobs,
  initialCompanies,
  initialReports,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"jobs" | "companies" | "reports">("reports");
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [reports, setReports] = useState<Report[]>(initialReports);

  const [jobSearch, setJobSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Job Actions
  async function toggleJobStatus(jobId: string, currentStatus: boolean) {
    setLoadingAction(`job-status-${jobId}`);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error();
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isActive: !currentStatus } : j))
      );
    } catch {
      alert("Failed to update job status.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function deleteJob(jobId: string) {
    if (!confirm("Are you sure you want to permanently delete this job listing?")) return;
    setLoadingAction(`job-delete-${jobId}`);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setReports((prev) => prev.filter((r) => r.jobId !== jobId));
    } catch {
      alert("Failed to delete job listing.");
    } finally {
      setLoadingAction(null);
    }
  }

  // Company Actions
  async function toggleCompanyVerification(companyId: string, currentVerified: boolean) {
    setLoadingAction(`company-verify-${companyId}`);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified: !currentVerified }),
      });
      if (!res.ok) throw new Error();
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, verified: !currentVerified } : c))
      );
    } catch {
      alert("Failed to update company verification status.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function deleteCompany(companyId: string) {
    if (!confirm("Are you sure you want to delete this company? This will delete all its jobs too.")) return;
    setLoadingAction(`company-delete-${companyId}`);
    try {
      const res = await fetch(`/api/admin/companies/${companyId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      // Filter out deleted company's jobs and reports
      setJobs((prev) => prev.filter((j) => j.company.id !== companyId));
      setReports((prev) => prev.filter((r) => r.job?.company.name !== companies.find(c => c.id === companyId)?.name));
    } catch {
      alert("Failed to delete company.");
    } finally {
      setLoadingAction(null);
    }
  }

  // Report Actions
  async function dismissReport(reportId: string) {
    setLoadingAction(`report-dismiss-${reportId}`);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      alert("Failed to dismiss report.");
    } finally {
      setLoadingAction(null);
    }
  }

  // Filtering
  const filteredJobs = jobs.filter((job) => {
    const query = jobSearch.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.name.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query)
    );
  });

  const filteredCompanies = companies.filter((company) => {
    const query = companySearch.toLowerCase();
    return (
      company.name.toLowerCase().includes(query) ||
      (company.location && company.location.toLowerCase().includes(query)) ||
      company.owner.email.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      {/* Stats Summary Widget */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #3b82f6" }}>
          <p style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", fontWeight: 600 }}>Total Jobs</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: "4px 0 0", color: "#111" }}>{jobs.length}</p>
          <p style={{ fontSize: "11px", color: "#999", margin: "2px 0 0" }}>{jobs.filter(j => j.isActive).length} currently active</p>
        </div>
        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #10b981" }}>
          <p style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", fontWeight: 600 }}>Total Companies</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: "4px 0 0", color: "#111" }}>{companies.length}</p>
          <p style={{ fontSize: "11px", color: "#999", margin: "2px 0 0" }}>{companies.filter(c => c.verified).length} verified</p>
        </div>
        <div className="card" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444" }}>
          <p style={{ fontSize: "12px", color: "#666", textTransform: "uppercase", fontWeight: 600 }}>Spam Reports</p>
          <p style={{ fontSize: "28px", fontWeight: "bold", margin: "4px 0 0", color: "#ef4444" }}>{reports.length}</p>
          <p style={{ fontSize: "11px", color: "#999", margin: "2px 0 0" }}>Flagged by users</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid #eee", marginBottom: "1.5rem", overflowX: "auto" }}>
        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          style={{
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "reports" ? "2px solid #ef4444" : "2px solid transparent",
            color: activeTab === "reports" ? "#ef4444" : "#666",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>Flags & Reports</span>
          {reports.length > 0 && (
            <span style={{ backgroundColor: "#ef4444", color: "#fff", borderRadius: "10px", padding: "2px 6px", fontSize: "10px" }}>
              {reports.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          style={{
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "jobs" ? "2px solid #111" : "2px solid transparent",
            color: activeTab === "jobs" ? "#111" : "#666",
            cursor: "pointer",
          }}
        >
          All Jobs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("companies")}
          style={{
            padding: "8px 16px",
            fontWeight: 600,
            fontSize: "14px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "companies" ? "2px solid #111" : "2px solid transparent",
            color: activeTab === "companies" ? "#111" : "#666",
            cursor: "pointer",
          }}
        >
          All Companies
        </button>
      </div>

      {/* Tab Contents: Reports */}
      {activeTab === "reports" && (
        <div>
          <h2 className="heading-section" style={{ marginBottom: "1rem" }}>User Flagged Reports</h2>
          {reports.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              <p>No job listings have been reported or flagged. Everything is clean!</p>
            </div>
          ) : (
            <div className="stack-16">
              {reports.map((report) => (
                <div key={report.id} className="card" style={{ borderLeft: "4px solid #ef4444" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <span
                        style={{
                          backgroundColor: "#fef2f2",
                          color: "#ef4444",
                          borderRadius: "4px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                        }}
                      >
                        {report.reason}
                      </span>
                      <h3 style={{ fontSize: "16px", fontWeight: 600, margin: "8px 0 4px" }}>
                        {report.job ? (
                          <a href={`/jobs/${report.job.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc", textDecoration: "underline" }}>
                            {report.job.title}
                          </a>
                        ) : (
                          <span style={{ color: "#999", fontStyle: "italic" }}>Deleted Job</span>
                        )}
                      </h3>
                      <p className="card-meta">
                        Company: {report.job?.company.name || "Unknown"} · Reported {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                      {report.details && (
                        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "10px", marginTop: "8px", fontSize: "13px" }}>
                          <strong>Reporter Context:</strong> {report.details}
                        </div>
                      )}
                      <p style={{ fontSize: "11px", color: "#666", marginTop: "8px" }}>
                        Flagged by: {report.reporter ? `${report.reporter.name || "User"} (${report.reporter.email})` : "Anonymous guest"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => dismissReport(report.id)}
                        disabled={loadingAction === `report-dismiss-${report.id}`}
                        className="btn btn-secondary"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                      >
                        {loadingAction === `report-dismiss-${report.id}` ? "Dismissing..." : "Dismiss Flag"}
                      </button>

                      {report.job && (
                        <>
                          <button
                            type="button"
                            onClick={() => toggleJobStatus(report.job!.id, report.job!.isActive)}
                            disabled={loadingAction === `job-status-${report.job.id}`}
                            className="btn btn-secondary"
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              backgroundColor: report.job.isActive ? "#fee2e2" : "#d1fae5",
                              color: report.job.isActive ? "#991b1b" : "#065f46",
                              border: "none",
                            }}
                          >
                            {report.job.isActive ? "Deactivate Job" : "Activate Job"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteJob(report.job!.id)}
                            disabled={loadingAction === `job-delete-${report.job.id}`}
                            className="btn btn-primary"
                            style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                          >
                            Delete listing
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Jobs */}
      {activeTab === "jobs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="heading-section">All Job Postings</h2>
            <input
              type="text"
              placeholder="Search title, company, location..."
              value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="input"
              style={{ maxWidth: "280px" }}
            />
          </div>

          {filteredJobs.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              <p>No jobs match your search parameters.</p>
            </div>
          ) : (
            <div className="stack-12">
              {filteredJobs.map((job) => (
                <div key={job.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "start" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>
                          <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc", textDecoration: "underline" }}>
                            {job.title}
                          </a>
                        </h3>
                        {job._count.reports > 0 && (
                          <span style={{ backgroundColor: "#fee2e2", color: "#ef4444", borderRadius: "4px", padding: "2px 6px", fontSize: "10px", fontWeight: 600 }}>
                            {job._count.reports} flag{job._count.reports > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="card-meta" style={{ marginTop: "4px" }}>
                        {job.company.name} · {formatJobType(job.type)} · {job.location}
                      </p>
                      <p style={{ fontSize: "11px", color: "#999", margin: "4px 0 0" }}>
                        Posted {new Date(job.createdAt).toLocaleDateString()} · {job._count.applications} application{job._count.applications === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => toggleJobStatus(job.id, job.isActive)}
                        disabled={loadingAction === `job-status-${job.id}`}
                        className="btn"
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          backgroundColor: job.isActive ? "#d1fae5" : "#fee2e2",
                          color: job.isActive ? "#065f46" : "#991b1b",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {job.isActive ? "Active" : "Closed"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteJob(job.id)}
                        disabled={loadingAction === `job-delete-${job.id}`}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Companies */}
      {activeTab === "companies" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="heading-section">All Registered Companies</h2>
            <input
              type="text"
              placeholder="Search name, location, owner..."
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              className="input"
              style={{ maxWidth: "280px" }}
            />
          </div>

          {filteredCompanies.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
              <p>No companies match your search parameters.</p>
            </div>
          ) : (
            <div className="stack-12">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", alignItems: "start" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "start" }}>
                      {company.logoUrl ? (
                        <div style={{ width: 48, height: 48, borderRadius: 8, overflow: "hidden", border: "1px solid #eee", flexShrink: 0 }}>
                          <img src={company.logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: "#f0f0f0", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #ccc", flexShrink: 0, fontSize: 10, color: "#666" }}>
                          No Logo
                        </div>
                      )}
                      <div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{company.name}</h3>
                          {company.verified && (
                            <span style={{ backgroundColor: "#d1fae5", color: "#065f46", borderRadius: "12px", padding: "2px 8px", fontSize: "10px", fontWeight: 600 }}>
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="card-meta" style={{ marginTop: "2px" }}>
                          {company.location || "No Location"} · {company.website ? (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc" }}>
                              {company.website}
                            </a>
                          ) : "No website"}
                        </p>
                        <p style={{ fontSize: "11px", color: "#999", margin: "4px 0 0" }}>
                          Owner: {company.owner.name || "User"} ({company.owner.email}) · Created {new Date(company.createdAt).toLocaleDateString()} · {company._count.jobs} job listing{company._count.jobs === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => toggleCompanyVerification(company.id, company.verified)}
                        disabled={loadingAction === `company-verify-${company.id}`}
                        className="btn"
                        style={{
                          padding: "6px 12px",
                          fontSize: "12px",
                          backgroundColor: company.verified ? "#d1fae5" : "#fee2e2",
                          color: company.verified ? "#065f46" : "#991b1b",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {company.verified ? "Verified" : "Verify / Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCompany(company.id)}
                        disabled={loadingAction === `company-delete-${company.id}`}
                        className="btn btn-primary"
                        style={{ padding: "6px 12px", fontSize: "12px", backgroundColor: "#dc3545", borderColor: "#dc3545" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
