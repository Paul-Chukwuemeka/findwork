import Link from "next/link";
import { db } from "@/lib/db";
import type { Job, Company } from "@prisma/client";
import { Poppins } from "next/font/google";

export const revalidate = 60;

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-ui" });

type FeaturedJob = Job & { company: { name: string; location?: string | null } };

export default async function HomePage() {
  const [jobCount, companyCount, featuredJobsRaw, companiesRaw] = await Promise.all([
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
    { title: "Senior Frontend Engineer", company: "Paystack", location: "Lagos" },
    { title: "Backend Engineer", company: "Flutterwave", location: "Remote" },
    { title: "Product Designer", company: "Andela", location: "Nairobi" },
  ];

  const companies = companiesRaw && companiesRaw.length > 0 ? companiesRaw : [
    { id: 'fb1', name: 'Paystack' },
    { id: 'fb2', name: 'Flutterwave' },
    { id: 'fb3', name: 'Andela' },
    { id: 'fb4', name: 'Interswitch' },
    { id: 'fb5', name: 'Moniepoint' },
    { id: 'fb6', name: 'SeamlessHR' },
  ] as Company[];

  return (
    <div className={poppins.variable} style={{ minHeight: "100vh", background: "#fff", fontFamily: "Georgia, serif" }}>

      <div className="root">
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          .root { max-width: 1100px; margin: 0 auto; }

          /* UI font uses variable from next/font */
          .ui { font-family: var(--font-ui), system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }

          nav { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 2.5rem; border-bottom: 1px solid #e5e5e5; }
          nav .brand { font-size: 17px; font-weight: 400; letter-spacing: -0.2px; color: #111; }
          nav .nav-links { display: flex; gap: 2rem; align-items: center; }
          nav .nav-links a { font-size: 14px; color: #555; text-decoration: none; transition: color 0.15s ease; }
          nav .nav-links a:hover { color: #111; }
          .signin { font-size: 13px; color: #111; text-decoration: none; border: 1px solid #ccc; border-radius: 6px; padding: 6px 14px; background: transparent; transition: background 0.15s ease; }
          .signin:hover { background: #f5f5f5; cursor: pointer; }

          /* Hero */
          .hero { max-width: 680px; margin: 0 auto; padding: 6rem 2rem 5rem; text-align: center; }
          .hero h1 { font-size: 48px; font-weight: 400; line-height: 1.05; color: #111; letter-spacing: -1.5px; margin-bottom: 1.25rem; }
          .hero p.subtitle { font-size: 18px; color: #777; line-height: 1.6; max-width: 420px; margin: 0 auto 2.5rem; }
          .btn { border-radius: 6px; padding: 11px 22px; font-size: 14px; text-decoration: none; display: inline-block; }
          .btn-primary { background: #111; color: #fff; transition: background 0.15s ease; cursor: pointer; }
          .btn-primary:hover { background: #333; }
          .btn-secondary { background: transparent; color: #111; border: 1px solid #ccc; transition: background 0.15s ease; cursor: pointer; }
          .btn-secondary:hover { background: #f9f9f9; }

          /* Stats */
          .stats { border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: center; gap: 4rem; padding: 2rem; margin: 0 2.5rem; }
          .stat { text-align: center; position: relative; padding: 0 1rem; }
          .stat .number { font-size: 26px; font-weight: 400; color: #111; letter-spacing: -0.5px; }
          .stat:not(:last-child)::after { content: ""; position: absolute; right: 0; top: 12px; bottom: 12px; width: 1px; background: #e5e5e5; }
          .stat .label { font-size: 12px; color: #888; margin-top: 3px; }

          /* Split panels */
          .split { display: grid; grid-template-columns: 1fr 1fr; margin: 3rem 2.5rem; border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden; }
          .panel { padding: 3rem; }
          .panel.devs { border-right: 1px solid #e5e5e5; }
          .panel h2 { font-size: 20px; font-weight: 400; color: #111; margin-bottom: 0.5rem; line-height: 1.3; }
          .panel p.lead { font-size: 14px; color: #666; line-height: 1.6; margin-bottom: 1.75rem; }

          /* Job cards */
          .jobs { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1.75rem; }
          .job-card { border: 1px solid #e5e5e5; border-radius: 6px; padding: 10px 12px; text-decoration: none; color: inherit; position: relative; transition: all 0.15s ease; }
          .job-card:hover { border-color: #bbb; background: #fafafa; }
          .job-card .title { font-size: 13px; font-weight: 500; color: #111; margin-bottom: 3px; }
          .job-card .meta { font-size: 12px; color: #888; }
          .job-card::after { content: "→"; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); opacity: 0; transition: opacity 0.15s ease; }
          .job-card:hover::after { opacity: 1; }

          /* Checklist */
          .checklist { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.75rem; padding: 0; }
          .checklist li { font-size: 13px; color: #555; display: flex; align-items: center; gap: 10px; }
          .checklist .dot { width: 16px; height: 16px; border-radius: 50%; border: 1px solid #ccc; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; flex-shrink: 0; }

          /* Companies */
          .companies { padding: 1rem 2.5rem 3rem; text-align: center; }
          .company-chip { font-size: 13px; color: #666; background: #f5f5f5; border-radius: 6px; padding: 6px 14px; transition: background 0.15s ease; }
          .company-chip:hover { background: #ebebeb; cursor: pointer; }

          /* Footer */
          footer.site-footer { border-top: 1px solid #e5e5e5; padding: 1.5rem 2.5rem; display: flex; align-items: center; }
          footer .left { font-size: 13px; color: #aaa; }
          footer .center { flex: 1; text-align: center; font-size: 13px; color: #888; }
          footer .right { display: flex; gap: 1.5rem; }
          footer .right a { font-size: 13px; color: #aaa; text-decoration: none; transition: color 0.15s ease; }
          footer .right a:hover { color: #555; }
        `}</style>

        {/* Nav */}
        <nav className="ui">
          <span className="brand">DevBoard</span>
          <div className="nav-links">
            <Link href="/jobs">Browse jobs</Link>
            <Link href="/companies">Companies</Link>
            <Link href="/api/v1/jobs">API</Link>
            <Link href="/login" className="signin">Sign in</Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="hero">
          <h1>Tech jobs across Africa</h1>
          <p className="subtitle">Connecting developers with companies in Lagos, Nairobi, Accra, Cape Town, and beyond.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Link href="/jobs" className="btn btn-primary ui">Browse open roles</Link>
            <Link href="/onboarding" className="btn btn-secondary ui">Post a job</Link>
          </div>
        </section>

        {/* Stats */}
        <div className="stats">
          {stats.map(({ value, label }) => (
            <div key={label} className="stat">
              <div className="number">{value}</div>
              <div className="label">{label}</div>
            </div>
          ))}
        </div>

        {/* Split panels */}
        <div className="split">
          <div className="panel devs">
            <p style={{ fontSize: 11, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>For developers</p>
            <h2>Find your next role</h2>
            <p className="lead">Browse roles at top African tech companies. Apply in minutes and track your applications.</p>

            <div className="jobs">
              {featuredJobs.length > 0 ? featuredJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.slug}`} className="job-card ui">
                  <div className="title">{job.title}</div>
                  <div className="meta">{job.company?.name} · { (job as any).location ?? job.company?.location }</div>
                </Link>
              )) : fallbackJobs.map((job) => (
                <div key={job.title} className="job-card">
                  <div className="title">{job.title}</div>
                  <div className="meta">{job.company} · {job.location}</div>
                </div>
              ))}
            </div>

            <Link href="/jobs" className="ui" style={{ fontSize: 13, color: '#111', textDecoration: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '7px 14px', display: 'inline-block' }}>Browse all jobs →</Link>
          </div>

          <div className="panel">
            <p style={{ fontSize: 11, color: '#999', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>For employers</p>
            <h2>Hire African tech talent</h2>
            <p className="lead">Post jobs to thousands of developers. Manage applications and access our API to integrate listings into your own tools.</p>

            <ul className="checklist">
              {checklist.map((item) => (
                <li key={item}><span className="dot">✓</span>{item}</li>
              ))}
            </ul>

            <Link href="/onboarding" className="ui" style={{ fontSize: 13, color: '#111', textDecoration: 'none', border: '1px solid #ccc', borderRadius: 6, padding: '7px 14px', display: 'inline-block' }}>Post a job →</Link>
          </div>
        </div>

        {/* Companies row */}
        <div className="companies">
          <p style={{ fontSize: 12, color: '#aaa', marginBottom: '1.25rem' }}>Companies on DevBoard</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {companies.map((c: any) => (
              <span key={c.id || c.name} className="company-chip ui">{c.name}</span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="site-footer">
          <div className="left">© 2026 DevBoard</div>
          <div className="center">Built for African tech</div>
          <div className="right">
            {["API docs", "Privacy", "GitHub"].map((label) => (
              <a key={label} href="#">{label}</a>
            ))}
          </div>
        </footer>
      </div>

    </div>
  );
}