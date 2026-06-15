import { db } from "@/lib/db";
import { JobType } from "@prisma/client";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { formatJobType } from "@/lib/format";

export const revalidate = 60;

const JOB_TYPES = Object.values(JobType);

type JobsSearchParams = {
  q?: string | string[];
  type?: string | string[];
  location?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<JobsSearchParams>;
}) {
  const params = await searchParams;
  const q = firstParam(params.q);
  const type = firstParam(params.type);
  const location = firstParam(params.location);
  const selectedType =
    type && Object.values(JobType).includes(type as JobType)
      ? (type as JobType)
      : undefined;

  const jobs = await db.job.findMany({
    where: {
      isActive: true,
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      }),
      ...(selectedType && { type: selectedType }),
      ...(location && { location: { contains: location, mode: "insensitive" } }),
    },
    include: { company: { select: { name: true, slug: true, logoUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const hasFilters = Boolean(q || location || selectedType);

  return (
    <PageShell active="jobs" medium>
      <header className="page-header">
        <p className="label-upper">Job listings</p>
        <h1 className="heading-page">Tech jobs in Africa</h1>
        <p className="page-subtitle">
          {jobs.length} open {jobs.length === 1 ? "position" : "positions"}
        </p>
      </header>

      <form className="search-panel">
        <div className="search-panel__grid">
          <div className="form-field search-panel__field">
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
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>

      <section className="jobs-section">
        {jobs.length > 0 ? (
          <>
            <div className="jobs-list">
              {jobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.slug}`}
                  className="jobs-list__link"
                >
                  <div>
                    <h2 className="jobs-list__title">{job.title}</h2>
                    <Link
                      href={`/company/${job.company.slug}`}
                      className="jobs-list__company"
                      style={{ color: "#0066cc", textDecoration: "none" }}
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
                </Link>
              ))}
            </div>
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
