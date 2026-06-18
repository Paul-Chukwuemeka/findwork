import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { EmployerNav } from "@/components/EmployerNav";
import CompanyManager from "./CompanyManager";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyDashboardPage({ params }: PageProps) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "EMPLOYER") redirect("/developer/dashboard");

  const { id } = await params;

  const company = await db.company.findUnique({
    where: { id },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!company) notFound();

  // Validate owner
  if (company.ownerId !== session.user.id) {
    redirect("/employer/dashboard");
  }

  // Format date or serializable elements if Next.js complains about passing non-POJOs
  const serializedCompany = {
    id: company.id,
    name: company.name,
    website: company.website,
    location: company.location,
    about: company.about,
    logoUrl: company.logoUrl,
    jobs: company.jobs.map((job) => ({
      id: job.id,
      title: job.title,
      slug: job.slug,
      type: job.type,
      location: job.location,
      isActive: job.isActive,
      createdAt: job.createdAt,
    })),
  };

  return (
    <PageShell active="dashboard">
      <EmployerNav />
      <header className="page-header">
        <p className="label-upper">Manage Company</p>
        <h1 className="heading-page">{company.name}</h1>
        <p className="page-subtitle">Configure profile and manage active job listings.</p>
      </header>

      <CompanyManager company={serializedCompany} />
    </PageShell>
  );
}
