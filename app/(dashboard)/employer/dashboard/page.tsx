import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";

export default async function EmployerDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "EMPLOYER") redirect("/developer/dashboard");

  const [companies, applications] = await Promise.all([
    db.company.findMany({
      where: { ownerId: session.user.id },
      include: {
        jobs: {
          where: { isActive: true },
          select: { id: true, title: true, slug: true, createdAt: true },
        },
      },
    }),
    db.application.findMany({
      where: {
        job: {
          company: {
            ownerId: session.user.id,
          },
        },
      },
      include: {
        job: { include: { company: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <PageShell>
      <h1 className="heading-page">Employer Dashboard</h1>
      <p className="page-subtitle">Manage your companies and job postings</p>

      <section className="section" style={{ marginTop: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 className="heading-section">Companies ({companies.length})</h2>
          <Link href="/employer/company/new" className="btn btn-primary">
            + New Company
          </Link>
        </div>

        {companies.length === 0 ? (
          <p className="body-text">
            No companies yet.{" "}
            <Link href="/employer/company/new">Create your first company</Link>
          </p>
        ) : (
          <div className="stack-12">
            {companies.map((company) => (
              <div key={company.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1 }}>
                    <Link href={`/employer/company/${company.id}`} className="card-link">
                      <p className="card-title">{company.name}</p>
                    </Link>
                    {company.website && (
                      <p className="card-meta">
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          {company.website}
                        </a>
                      </p>
                    )}
                    <p className="card-meta" style={{ marginTop: "0.5rem" }}>
                      {company.jobs.length} active job{company.jobs.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Link href={`/employer/jobs/new?company=${company.id}`} className="btn btn-secondary">
                    Post Job
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ marginTop: "2rem" }}>
        <h2 className="heading-section">Recent Applications ({applications.length})</h2>

        {applications.length === 0 ? (
          <p className="body-text">No applications yet.</p>
        ) : (
          <div className="stack-12">
            {applications.map((app) => (
              <div key={app.id} className="card row-between">
                <div>
                  <p className="card-title">{app.user.name}</p>
                  <p className="card-meta">{app.user.email}</p>
                  <p className="card-meta" style={{ marginTop: "0.5rem" }}>
                    Applied for:{" "}
                    <Link href={`/jobs/${app.job.slug}`} style={{ color: "#007bff" }}>
                      {app.job.title}
                    </Link>
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className="card-meta">{new Date(app.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
