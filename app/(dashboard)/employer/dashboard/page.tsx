import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { EmployerNav } from "@/components/EmployerNav";
import ApplicationsManager from "./ApplicationsManager";

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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            skills: true,
            githubUrl: true,
            linkedinUrl: true,
            portfolioUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <PageShell active="dashboard">
      <EmployerNav />
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
                      <p className="card-title" style={{ fontSize: "16px", fontWeight: "600" }}>{company.name}</p>
                    </Link>
                    {company.website && (
                      <p className="card-meta">
                        <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ color: "#0066cc", textDecoration: "none" }}>
                          {company.website}
                        </a>
                      </p>
                    )}
                    <p className="card-meta" style={{ marginTop: "0.5rem" }}>
                      {company.jobs.length} active job{company.jobs.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Link href={`/employer/company/${company.id}`} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                      Edit Profile
                    </Link>
                    <Link href={`/employer/jobs/new?company=${company.id}`} className="btn btn-primary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                      Post Job
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="section" style={{ marginTop: "2rem" }}>
        <h2 className="heading-section" style={{ marginBottom: "1rem" }}>
          Recent Applications ({applications.length})
        </h2>

        {applications.length === 0 ? (
          <p className="body-text">No applications yet.</p>
        ) : (
          <ApplicationsManager initialApplications={applications} />
        )}
      </section>
    </PageShell>
  );
}

