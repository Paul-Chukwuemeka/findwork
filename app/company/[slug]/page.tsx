import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { formatJobType } from "@/lib/format";

export const revalidate = 60;

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const company = await db.company.findUnique({
    where: { slug },
    include: {
      jobs: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        include: { company: { select: { name: true, slug: true } } },
      },
      owner: {
        select: { name: true, email: true },
      },
    },
  });

  if (!company) notFound();

  return (
    <PageShell active="jobs" medium>
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/jobs" className="tag-line" style={{ color: "#0066cc" }}>
          ← Back to jobs
        </Link>
      </div>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", alignItems: "start" }}>
        {company.logoUrl && (
          <div
            style={{
              width: "120px",
              height: "120px",
              flexShrink: 0,
              borderRadius: "0.5rem",
              overflow: "hidden",
              backgroundColor: "#f0f0f0",
            }}
          >
            <img
              src={company.logoUrl}
              alt={company.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        )}

        <div style={{ flex: 1 }}>
          <p className="label-upper">Company profile</p>
          <h1 className="heading-page" style={{ marginBottom: "0.5rem" }}>
            {company.name}
          </h1>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
            {company.location && (
              <p className="tag-line" style={{ color: "#555" }}>
                📍 {company.location}
              </p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="tag-line"
                style={{ color: "#0066cc" }}
              >
                🌐 {new URL(company.website).hostname}
              </a>
            )}
            {company.verified && (
              <p className="tag-line" style={{ color: "#28a745" }}>
                ✓ Verified
              </p>
            )}
          </div>
        </div>
      </div>

      {company.about && (
        <section className="section">
          <h2 className="heading-section">About</h2>
          <p className="body-text" style={{ whiteSpace: "pre-wrap" }}>
            {company.about}
          </p>
        </section>
      )}

      <section className="section">
        <h2 className="heading-section">
          Open roles ({company.jobs.length})
        </h2>

        {company.jobs.length === 0 ? (
          <p className="body-text">No open positions at the moment.</p>
        ) : (
          <div className="stack-12">
            {company.jobs.map((job) => {
              const metaParts = [
                job.location,
                formatJobType(job.type),
                job.salaryRange,
              ].filter(Boolean);

              return (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="card row-between"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div>
                    <p className="card-title" style={{ marginBottom: "0.5rem" }}>
                      {job.title}
                    </p>
                    {metaParts.length > 0 && (
                      <p className="card-meta">{metaParts.join(" · ")}</p>
                    )}
                    {job.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                        {job.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              display: "inline-block",
                              padding: "0.25rem 0.75rem",
                              backgroundColor: "#e9ecef",
                              borderRadius: "0.25rem",
                              fontSize: "0.875rem",
                              color: "#555",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 3 && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.25rem 0.75rem",
                              color: "#666",
                              fontSize: "0.875rem",
                            }}
                          >
                            +{job.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: "1.5rem" }}>→</div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {company.owner && (
        <section className="section" style={{ borderTop: "1px solid #eee", paddingTop: "2rem" }}>
          <h3 className="heading-section">Hiring manager</h3>
          <p className="body-text">{company.owner.name}</p>
          {company.owner.email && (
            <p className="card-meta" style={{ marginTop: "0.5rem" }}>
              <a href={`mailto:${company.owner.email}`} style={{ color: "#0066cc" }}>
                {company.owner.email}
              </a>
            </p>
          )}
        </section>
      )}
    </PageShell>
  );
}
