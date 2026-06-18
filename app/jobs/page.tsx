import { db } from "@/lib/db";
import { JobType } from "@prisma/client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { formatJobType } from "@/lib/format";
import { SubscribeAlertButton } from "@/components/SubscribeAlertButton";
import { auth } from "@/lib/auth";
import SaveButton from "@/components/SaveButton";

export const revalidate = 60;

const JOB_TYPES = Object.values(JobType);

type JobsSearchParams = {
  q?: string | string[];
  type?: string | string[];
  location?: string | string[];
  remote?: string | string[];
  salary?: string | string[];
  page?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<JobsSearchParams>;
}) {
  const session = await auth();
  const savedJobIds = session
    ? new Set(
        (
          await db.savedJob.findMany({
            where: { userId: session.user.id },
            select: { jobId: true },
          })
        ).map((sj) => sj.jobId)
      )
    : new Set<string>();

  const params = await searchParams;
  const q = firstParam(params.q);
  const type = firstParam(params.type);
  const location = firstParam(params.location);
  const remote = firstParam(params.remote);
  const salary = firstParam(params.salary);
  const page = Math.max(1, parseInt(firstParam(params.page) || "1", 10));
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const selectedType =
    type && Object.values(JobType).includes(type as JobType)
      ? (type as JobType)
      : undefined;

  const whereClause = {
    isActive: true,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" as const } },
        { tags: { has: q } },
      ],
    }),
    ...(selectedType && { type: selectedType }),
    ...(location && { location: { contains: location, mode: "insensitive" as const } }),
    ...(remote === "true" && {
      OR: [
        { location: { contains: "remote", mode: "insensitive" as const } },
        { title: { contains: "remote", mode: "insensitive" as const } },
      ],
    }),
    ...(salary === "paid" && {
      AND: [
        { salaryRange: { not: null } },
        { salaryRange: { not: "" } },
      ],
    }),
    ...(salary === "50k" && {
      AND: [
        { salaryRange: { not: null } },
        {
          OR: [
            { salaryRange: { contains: "5" } },
            { salaryRange: { contains: "6" } },
            { salaryRange: { contains: "7" } },
            { salaryRange: { contains: "8" } },
            { salaryRange: { contains: "9" } },
            { salaryRange: { contains: "1" } },
          ],
        },
      ],
    }),
  };

  const [jobs, totalJobs] = await Promise.all([
    db.job.findMany({
      where: whereClause,
      include: { company: { select: { name: true, slug: true, logoUrl: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    db.job.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalJobs / pageSize);
  const hasFilters = Boolean(q || location || selectedType || remote || salary);

  return (
    <PageShell active="jobs" medium>
      <header className="page-header" style={{ marginBottom: 24 }}>
        <p className="label-upper">Job listings</p>
        <h1 className="heading-page">Tech jobs in Africa</h1>
        <p className="page-subtitle" style={{ marginBottom: 12 }}>
          {totalJobs} open {totalJobs === 1 ? "position" : "positions"}
        </p>
        <SubscribeAlertButton query={q} location={location} />
      </header>

      <form className="search-panel" method="GET" action="/jobs">
        <div className="search-panel__grid">
          <div className="form-field search-panel__field search-panel__field--search">
            <label htmlFor="q" className="form-label">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Role or skill"
              className="input"
            />
          </div>
          <div className="form-field search-panel__field">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              id="location"
              name="location"
              defaultValue={location}
              placeholder="City or remote"
              className="input"
            />
          </div>
          <div className="form-field search-panel__field">
            <label htmlFor="type" className="form-label">
              Type
            </label>
            <select id="type" name="type" defaultValue={selectedType ?? ""} className="select">
              <option value="">All types</option>
              {JOB_TYPES.map((jobType) => (
                <option key={jobType} value={jobType}>
                  {formatJobType(jobType)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field search-panel__field">
            <label htmlFor="salary" className="form-label">
              Salary
            </label>
            <select id="salary" name="salary" defaultValue={salary ?? ""} className="select">
              <option value="">All Salaries</option>
              <option value="paid">Paid only</option>
              <option value="50k">$50k+/year</option>
            </select>
          </div>
          <div className="search-panel__field search-panel__field--checkbox">
            <input
              id="remote"
              name="remote"
              type="checkbox"
              value="true"
              defaultChecked={remote === "true"}
              className="search-panel__checkbox-input"
            />
            <label htmlFor="remote" className="search-panel__checkbox-label">
              Remote Only
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: "38px" }}>
            Search
          </button>
        </div>
      </form>

      <section className="jobs-section">
        {jobs.length > 0 ? (
          <>
            <div className="jobs-list">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="jobs-list__item"
                >
                  <div>
                    <h2 className="jobs-list__title">
                      <Link
                        href={`/jobs/${job.slug}`}
                        className="jobs-list__title-link"
                      >
                        {job.title}
                      </Link>
                    </h2>
                    <Link
                      href={`/company/${job.company.slug}`}
                      className="jobs-list__company-link"
                    >
                      {job.company.name}
                    </Link>
                    <p className="jobs-list__company" style={{ color: "inherit", marginTop: "0.25rem" }}>
                      {job.location}
                    </p>
                    <p className="tag-line">
                      {formatJobType(job.type)}
                      {job.salaryRange ? ` · ${job.salaryRange}` : ""}
                      {job.tags.length > 0
                        ? ` · ${job.tags.slice(0, 4).join(" · ")}`
                        : ""}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "end", gap: "12px", position: "relative", zIndex: 2 }}>
                    <time
                      className="jobs-list__date"
                      dateTime={job.createdAt.toISOString()}
                    >
                      {new Date(job.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                    <SaveButton jobId={job.id} initialSaved={savedJobIds.has(job.id)} variant="icon" />
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "32px" }}>
                {page > 1 ? (
                  <Link
                    href={`/jobs?${new URLSearchParams({
                      ...(q && { q }),
                      ...(location && { location }),
                      ...(type && { type }),
                      ...(remote && { remote }),
                      ...(salary && { salary }),
                      page: String(page - 1),
                    }).toString()}`}
                    className="btn btn-secondary"
                  >
                    ← Previous
                  </Link>
                ) : (
                  <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                    ← Previous
                  </button>
                )}

                <span style={{ fontSize: "14px", fontWeight: 500, color: "#666" }}>
                  Page {page} of {totalPages}
                </span>

                {page < totalPages ? (
                  <Link
                    href={`/jobs?${new URLSearchParams({
                      ...(q && { q }),
                      ...(location && { location }),
                      ...(type && { type }),
                      ...(remote && { remote }),
                      ...(salary && { salary }),
                      page: String(page + 1),
                    }).toString()}`}
                    className="btn btn-secondary"
                  >
                    Next →
                  </Link>
                ) : (
                  <button className="btn btn-secondary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>
                    Next →
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <h2 className="empty-state__title">No positions found</h2>
            <p className="empty-state__text">
              {hasFilters
                ? "Try broadening your search or clearing filters to see more roles."
                : "New roles are added regularly. Check back soon or post a job if you are hiring."}
            </p>
            {hasFilters ? (
              <Link href="/jobs" className="btn btn-secondary">
                Clear filters
              </Link>
            ) : (
              <Link href="/signup" className="btn btn-secondary">
                Post a job
              </Link>
            )}
          </div>
        )}
      </section>
    </PageShell>
  );
}
