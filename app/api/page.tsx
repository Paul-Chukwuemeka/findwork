"use client";

import { PageShell } from "@/components/PageShell";
import { useState } from "react";

export default function ApiDocsPage() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const curlListJobs = `curl -X GET "https://findwork.dev/api/v1/jobs?q=React&location=Remote" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

  const curlGetJob = `curl -X GET "https://findwork.dev/api/v1/jobs/cm123abc-4567-89ef-ghij-klmnopqrstuv" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

  const listJobsResponse = `{
  "data": [
    {
      "id": "cm123abc-4567-89ef-ghij-klmnopqrstuv",
      "title": "Senior React Engineer",
      "slug": "senior-react-engineer-kora-labs",
      "description": "Join our product team to build the future of payments...",
      "type": "FULL_TIME",
      "location": "Lagos, Nigeria (Remote)",
      "salaryRange": "$60k - $90k",
      "tags": ["React", "TypeScript", "Next.js"],
      "isActive": true,
      "createdAt": "2026-06-15T12:00:00.000Z",
      "company": {
        "name": "Kora Labs",
        "slug": "kora-labs",
        "website": "https://koralabs.dev",
        "location": "Lagos, Nigeria"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}`;

  const getJobResponse = `{
  "data": {
    "id": "cm123abc-4567-89ef-ghij-klmnopqrstuv",
    "title": "Senior React Engineer",
    "description": "Join our product team to build the future of payments...",
    "type": "FULL_TIME",
    "location": "Lagos, Nigeria (Remote)",
    "salaryRange": "$60k - $90k",
    "tags": ["React", "TypeScript", "Next.js"],
    "isActive": true,
    "slug": "senior-react-engineer-kora-labs",
    "companyId": "company_uuid_999",
    "createdAt": "2026-06-15T12:00:00.000Z",
    "updatedAt": "2026-06-15T12:00:00.000Z",
    "company": {
      "id": "company_uuid_999",
      "name": "Kora Labs",
      "slug": "kora-labs",
      "website": "https://koralabs.dev",
      "location": "Lagos, Nigeria",
      "about": "A premier fintech infrastructure provider.",
      "logoUrl": "/uploads/kora-logo.png",
      "createdAt": "2026-06-15T10:00:00.000Z",
      "updatedAt": "2026-06-15T10:00:00.000Z"
    }
  }
}`;

  return (
    <PageShell active="api" medium>
      <header className="page-header" style={{ marginBottom: 48 }}>
        <p className="label-upper">Developer Platform</p>
        <h1 className="heading-page" style={{ fontSize: 36, letterSpacing: "-1px" }}>Public REST API</h1>
        <p className="page-subtitle" style={{ fontSize: 16, margin: "8px 0 0" }}>
          Build integrations, aggregate tech jobs, or query the African tech ecosystem programmatically.
        </p>
      </header>

      {/* Quick intro banner */}
      <div 
        style={{
          background: "linear-gradient(135deg, #f9f9fb 0%, #f3f4f6 100%)",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: 48,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h3 className="heading-section" style={{ fontSize: 18, margin: 0, fontWeight: 600 }}>Get Started in Seconds</h3>
        <p className="body-text" style={{ fontSize: 14, color: "#4b5563" }}>
          All requests must include your personal API key. You can generate, manage, and revoke your keys instantly via the 
          <a href="/developer/api-keys" style={{ color: "#000", fontWeight: "bold", textDecoration: "underline", marginLeft: "4px" }}>
            API Keys Dashboard
          </a>.
        </p>
      </div>

      {/* Authentication guide */}
      <section className="section" style={{ marginBottom: 56 }}>
        <h2 className="heading-section" style={{ fontSize: 24, borderBottom: "1px solid #eaeaea", paddingBottom: 12, marginBottom: 20 }}>
          Authentication
        </h2>
        <p className="body-text" style={{ marginBottom: 20 }}>
          Authenticate your requests by including your key in the HTTP <code style={{ background: "#f1f1f1", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace" }}>Authorization</code> header as a Bearer token.
        </p>
        
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 12, right: 12 }}>
            <button 
              type="button" 
              onClick={() => handleCopy("Authorization: Bearer YOUR_API_KEY", "auth")} 
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: 12, background: "#fff" }}
            >
              {copiedText === "auth" ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre 
            style={{ 
              background: "#1e1e24", 
              color: "#f8f8f2", 
              padding: "20px", 
              borderRadius: "8px", 
              overflowX: "auto", 
              fontFamily: "monospace",
              fontSize: 14,
              lineHeight: 1.5
            }}
          >
            {`GET /api/v1/jobs HTTP/1.1\nHost: findwork.dev\nAuthorization: Bearer YOUR_API_KEY\nAccept: application/json`}
          </pre>
        </div>
      </section>

      {/* Endpoints */}
      <section className="section">
        <h2 className="heading-section" style={{ fontSize: 24, borderBottom: "1px solid #eaeaea", paddingBottom: 12, marginBottom: 32 }}>
          Endpoint Reference
        </h2>

        {/* GET /api/v1/jobs */}
        <div style={{ marginBottom: 64, border: "1px solid #eaeaea", borderRadius: "12px", overflow: "hidden" }}>
          <div 
            style={{ 
              background: "#fafafa", 
              padding: "16px 24px", 
              borderBottom: "1px solid #eaeaea", 
              display: "flex", 
              alignItems: "center", 
              gap: 16,
              flexWrap: "wrap"
            }}
          >
            <span style={{ background: "#10b981", color: "#fff", fontWeight: "bold", padding: "4px 12px", borderRadius: 6, fontSize: 13 }}>
              GET
            </span>
            <code style={{ fontSize: 16, fontWeight: 600, fontFamily: "monospace" }}>/api/v1/jobs</code>
            <span style={{ color: "#666", fontSize: 14 }}>List active jobs</span>
          </div>

          <div style={{ padding: "24px" }}>
            <p className="body-text" style={{ fontSize: 15, marginBottom: 24 }}>
              Retrieves a list of all active jobs on FindWork. Results are sorted by creation date (newest first).
            </p>

            <h4 className="heading-section" style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Query Parameters</h4>
            <div style={{ overflowX: "auto", marginBottom: 32 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eaeaea" }}>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>Parameter</th>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>Type</th>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 8px" }}><code style={{ fontFamily: "monospace" }}>q</code></td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>string</td>
                    <td style={{ padding: "12px 8px" }}>Search keyword matching job titles or tags (e.g. <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>React</code>)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 8px" }}><code style={{ fontFamily: "monospace" }}>type</code></td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>string</td>
                    <td style={{ padding: "12px 8px" }}>Employment type: <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>FULL_TIME</code>, <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>PART_TIME</code>, <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>CONTRACT</code>, <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>INTERNSHIP</code></td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 8px" }}><code style={{ fontFamily: "monospace" }}>location</code></td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>string</td>
                    <td style={{ padding: "12px 8px" }}>Filter by city, country or &quot;Remote&quot; (e.g. <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>Lagos</code>)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 8px" }}><code style={{ fontFamily: "monospace" }}>page</code></td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>number</td>
                    <td style={{ padding: "12px 8px" }}>Page number for pagination. Default: <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>1</code></td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 8px" }}><code style={{ fontFamily: "monospace" }}>limit</code></td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>number</td>
                    <td style={{ padding: "12px 8px" }}>Number of items to return. Max: <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>50</code>. Default: <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>20</code></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h5 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Example curl Request</h5>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(curlListJobs, "list_curl")}
                    className="btn btn-secondary"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    {copiedText === "list_curl" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{ background: "#272822", color: "#f8f8f2", padding: "16px", borderRadius: 8, fontSize: 13, fontFamily: "monospace", overflowX: "auto" }}>
                  {curlListJobs}
                </pre>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h5 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Example Response</h5>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(listJobsResponse, "list_res")}
                    className="btn btn-secondary"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    {copiedText === "list_res" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{ background: "#272822", color: "#f8f8f2", padding: "16px", borderRadius: 8, fontSize: 13, fontFamily: "monospace", maxHeight: 320, overflowY: "auto" }}>
                  {listJobsResponse}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* GET /api/v1/jobs/[id] */}
        <div style={{ marginBottom: 48, border: "1px solid #eaeaea", borderRadius: "12px", overflow: "hidden" }}>
          <div 
            style={{ 
              background: "#fafafa", 
              padding: "16px 24px", 
              borderBottom: "1px solid #eaeaea", 
              display: "flex", 
              alignItems: "center", 
              gap: 16,
              flexWrap: "wrap"
            }}
          >
            <span style={{ background: "#10b981", color: "#fff", fontWeight: "bold", padding: "4px 12px", borderRadius: 6, fontSize: 13 }}>
              GET
            </span>
            <code style={{ fontSize: 16, fontWeight: 600, fontFamily: "monospace" }}>/api/v1/jobs/[id]</code>
            <span style={{ color: "#666", fontSize: 14 }}>Get job by ID</span>
          </div>

          <div style={{ padding: "24px" }}>
            <p className="body-text" style={{ fontSize: 15, marginBottom: 24 }}>
              Retrieves the details of a specific active job by its unique database ID.
            </p>

            <h4 className="heading-section" style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Path Parameters</h4>
            <div style={{ overflowX: "auto", marginBottom: 32 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eaeaea" }}>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>Parameter</th>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>Type</th>
                    <th style={{ padding: "12px 8px", fontWeight: 600 }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "12px 8px" }}><code style={{ fontFamily: "monospace" }}>id</code></td>
                    <td style={{ padding: "12px 8px", color: "#666" }}>string (UUID)</td>
                    <td style={{ padding: "12px 8px" }}>The unique identifier of the job posting (e.g. <code style={{ background: "#f5f5f5", padding: "2px 4px" }}>cm123abc-4567-89ef...</code>)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h5 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Example curl Request</h5>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(curlGetJob, "get_curl")}
                    className="btn btn-secondary"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    {copiedText === "get_curl" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{ background: "#272822", color: "#f8f8f2", padding: "16px", borderRadius: 8, fontSize: 13, fontFamily: "monospace", overflowX: "auto" }}>
                  {curlGetJob}
                </pre>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <h5 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333" }}>Example Response</h5>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(getJobResponse, "get_res")}
                    className="btn btn-secondary"
                    style={{ padding: "3px 8px", fontSize: 11 }}
                  >
                    {copiedText === "get_res" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre style={{ background: "#272822", color: "#f8f8f2", padding: "16px", borderRadius: 8, fontSize: 13, fontFamily: "monospace", maxHeight: 320, overflowY: "auto" }}>
                  {getJobResponse}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
