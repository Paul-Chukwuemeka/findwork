import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const session = await auth();

  // Restrict access to ADMIN users only
  if (!session || session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  // Fetch initial listings for jobs
  const jobs = await db.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          verified: true,
        },
      },
      _count: {
        select: {
          reports: true,
          applications: true,
        },
      },
    },
  });

  // Fetch initial companies
  const companies = await db.company.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          jobs: true,
        },
      },
    },
  });

  // Fetch active flagged reports
  const reports = await db.jobReport.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          slug: true,
          isActive: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      },
      reporter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <PageShell active="admin">
      <p className="label-upper">Admin Panel</p>
      <h1 className="heading-page" style={{ marginBottom: "2rem" }}>Moderation Dashboard</h1>
      <AdminDashboard
        initialJobs={jobs}
        initialCompanies={companies}
        initialReports={reports}
      />
    </PageShell>
  );
}
