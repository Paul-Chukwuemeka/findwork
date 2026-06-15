import Link from "next/link";
import { db } from "@/lib/db";
import type { Job, Company } from "@prisma/client";
import { SiteNav } from "@/components/SiteNav";

export const revalidate = 60;

type FeaturedJob = Job & {
  company: { name: string; location?: string | null };
};

export default async function HomePage() {
  const [jobCount, companyCount, featuredJobsRaw, companiesRaw] =
    await Promise.all([
      db.job.count({ where: { isActive: true } }),
      db.company.count(),
      db.job.findMany({
        where: { isActive: true },
        include: { company: { select: { name: true, location: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      db.company.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
    ]);

  const featuredJobs = featuredJobsRaw as FeaturedJob[];

  const stats = [
    { value: `${jobCount}`, label: "open positions" },
    { value: `${companyCount}`, label: "companies hiring" },
    { value: "12", label: "countries" },
    { value: "Free API", label: "open access" },
  ];

  const checklist = [
    "Post and manage job listings",
    "Track applicants with status updates",
    "Public REST API with key auth",
    "Company profile page",
  ];

  const fallbackJobs = [
    {
      title: "Senior Frontend Engineer",
      company: "Paystack",
      location: "Lagos",
    },
    { title: "Backend Engineer", company: "Flutterwave", location: "Remote" },
    { title: "Product Designer", company: "Andela", location: "Nairobi" },
  ];

  const companies =
    companiesRaw && companiesRaw.length > 0
      ? companiesRaw
      : ([
          { id: "fb1", name: "Paystack" },
          { id: "fb2", name: "Flutterwave" },
          { id: "fb3", name: "Andela" },
          { id: "fb4", name: "Interswitch" },
          { id: "fb5", name: "Moniepoint" },
          { id: "fb6", name: "SeamlessHR" },
        ] as Company[]);

  return (
    <div className="page">
      <SiteNav />

      <div className="page-inner">
        <section className="landing-hero">
          <h1 className="heading-display">Tech jobs across Africa</h1>
          <p className="body-text">
            Connecting developers with companies in Lagos, Nairobi, Accra, Cape
            Town, and beyond.
          </p>
          <div className="landing-actions">
            <Link href="/jobs" className="btn btn-primary">
              Browse open roles
            </Link>
            <Link href="/signup" className="btn btn-secondary">
              Post a job
            </Link>
          </div>
        </section>

        <div className="landing-stats">
          {stats.map(({ value, label }) => (
            <div key={label} className="landing-stat">
              <div className="landing-stat__value">{value}</div>
              <div className="landing-stat__label">{label}</div>
            </div>
          ))}
        </div>

        <div className="landing-split">
          <div className="landing-panel">
            <p className="label-upper">For developers</p>
            <h2 className="heading-section">Find your next role</h2>
            <p className="body-text" style={{ fontSize: 16, marginBottom: 24 }}>
              Browse roles at top African tech companies. Apply in minutes and
              track your applications.
            </p>

            <div className="stack-8" style={{ marginBottom: 24 }}>
              {featuredJobs.length > 0 &&
                featuredJobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.slug}`}
                    className="card card--interactive"
                  >
                    <p className="card-title">{job.title}</p>
                    <p className="card-meta">
                      {job.company?.name} ·{" "}
                      {job.location ?? job.company?.location}
                    </p>
                  </Link>
                ))}
            </div>

            <Link href="/jobs" className="btn btn-secondary">
              Browse all jobs
            </Link>
          </div>

          <div className="landing-panel">
            <p className="label-upper">For employers</p>
            <h2 className="heading-section">Hire African tech talent</h2>
            <p className="body-text" style={{ fontSize: 16, marginBottom: 24 }}>
              Post jobs to thousands of developers. Manage applications and
              access our API to integrate listings into your own tools.
            </p>

            <ul className="landing-checklist">
              {checklist.map((item) => (
                <li key={item}>
                  <span className="landing-checklist__mark">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <Link href="/signup" className="btn btn-secondary">
              Post a job
            </Link>
          </div>
        </div>

        <div className="landing-companies">
          <p className="landing-companies__label">Companies on FindWork</p>
          <div className="landing-companies__list">
            {companies.map((c) => (
              <Link
                key={c.id || c.name}
                href={`/company/${c.slug}`}
                className="pill"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <footer className="site-footer">
          <div className="site-footer__left">© 2026 FindWork</div>
          <div className="site-footer__center">Built for African tech</div>
          <div className="site-footer__right">
            {["API docs", "Privacy", "GitHub"].map((label) => (
              <a key={label} href="#">
                {label}
              </a>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
}
