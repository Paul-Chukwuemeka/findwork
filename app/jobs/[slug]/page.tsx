import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import ApplyButton from "./applybutton";
import SaveButton from "@/components/SaveButton";
import ReportJobButton from "@/components/ReportJobButton";
import { PageShell } from "@/components/PageShell";
import { formatJobType } from "@/lib/format";

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  const job = await db.job.findUnique({
    where: { slug },
    include: { company: true },
  });
  if (!job) notFound();

  const [application, savedJob] = session
    ? await Promise.all([
        db.application.findUnique({
          where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
        }),
        db.savedJob.findUnique({
          where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
        }),
      ])
    : [null, null];

  const metaParts = [
    job.location,
    formatJobType(job.type),
    job.salaryRange,
  ].filter(Boolean);

  return (
    <PageShell active="jobs" medium>
      <p className="label-upper">Job listing</p>
      <h1 className="heading-page">{job.title}</h1>
      <Link
        href={`/company/${job.company.slug}`}
        className="page-subtitle"
        style={{ textDecoration: "none", color: "#0066cc" }}
      >
        {job.company.name}
      </Link>

      <p className="tag-line" style={{ marginBottom: 32 }}>
        {metaParts.join(" · ")}
      </p>

      <div className="job-description">{job.description}</div>

      {job.tags.length > 0 && (
        <p className="tag-line" style={{ marginBottom: 32 }}>
          {job.tags.join(" · ")}
        </p>
      )}

      <div className="row-wrap" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <ApplyButton jobSlug={job.slug} alreadyApplied={!!application} />
        <SaveButton jobId={job.id} initialSaved={!!savedJob} />
        <ReportJobButton jobId={job.id} />
      </div>

      <section className="section" style={{ marginTop: "2rem", borderTop: "1px solid #eee", paddingTop: "2rem" }}>
        <h2 className="heading-section">About the company</h2>
        <div className="card">
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "start" }}>
            {job.company.logoUrl && (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  flexShrink: 0,
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <img
                  src={job.company.logoUrl}
                  alt={job.company.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: "0.5rem", fontSize: "1rem", fontWeight: 600 }}>
                {job.company.name}
              </h3>
              {job.company.location && (
                <p className="card-meta" style={{ marginBottom: "0.5rem" }}>
                  📍 {job.company.location}
                </p>
              )}
              {job.company.website && (
                <p className="card-meta">
                  <a href={job.company.website} target="_blank" rel="noopener noreferrer">
                    🌐 Visit website
                  </a>
                </p>
              )}
              <Link
                href={`/company/${job.company.slug}`}
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  color: "#0066cc",
                  fontSize: "0.875rem",
                }}
              >
                View all roles →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
