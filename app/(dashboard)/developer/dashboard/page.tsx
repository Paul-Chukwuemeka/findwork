import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { ApplicationStatus } from "@/components/ApplicationStatus";

export default async function DeveloperDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "DEVELOPER") redirect("/employer/dashboard");

  const [applications, savedJobs] = await Promise.all([
    db.application.findMany({
      where: { userId: session.user.id },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.savedJob.findMany({
      where: { userId: session.user.id },
      include: { job: { include: { company: true } } },
      orderBy: { savedAt: "desc" },
    }),
  ]);

  return (
    <PageShell>
      <h1 className="heading-page">My dashboard</h1>
      <p className="page-subtitle">Applications and saved jobs</p>

      <section className="section">
        <h2 className="heading-section">
          Applications ({applications.length})
        </h2>
        {applications.length === 0 && (
          <p className="body-text" style={{ fontSize: 16 }}>
            No applications yet.{" "}
            <Link href="/jobs" style={{ color: "#111" }}>
              Browse jobs
            </Link>
          </p>
        )}
        <div className="stack-12" style={{ marginTop: 16 }}>
          {applications.map((app) => (
            <div key={app.id} className="card row-between">
              <div>
                <Link href={`/jobs/${app.job.slug}`} className="card-link">
                  <p className="card-title">{app.job.title}</p>
                </Link>
                <p className="card-meta" style={{ color: "#555" }}>
                  {app.job.company.name} · {app.job.location}
                </p>
              </div>
              <ApplicationStatus status={app.status} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="heading-section">Saved jobs ({savedJobs.length})</h2>
        {savedJobs.length === 0 && (
          <p className="body-text" style={{ fontSize: 16 }}>
            No saved jobs yet.
          </p>
        )}
        <div className="stack-12" style={{ marginTop: 16 }}>
          {savedJobs.map(({ job, savedAt }) => (
            <div key={job.id} className="card row-between">
              <div>
                <Link href={`/jobs/${job.slug}`} className="card-link">
                  <p className="card-title">{job.title}</p>
                </Link>
                <p className="card-meta" style={{ color: "#555" }}>
                  {job.company.name} · {job.location}
                </p>
              </div>
              <span className="meta">
                {new Date(savedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
