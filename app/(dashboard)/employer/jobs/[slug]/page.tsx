import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { formatJobType } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await db.job.findUnique({
    where: { slug },
    include: { company: true },
  });
  if (!job) return {};
  return { title: `${job.title} at ${job.company.name}` };
}

export default async function EmployerJobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const job = await db.job.findFirst({
    where: { slug, isActive: true },
    include: { company: true },
  });

  if (!job) notFound();

  const metaParts = [
    job.location,
    formatJobType(job.type),
    job.salaryRange,
  ].filter(Boolean);

  return (
    <PageShell active="jobs" medium>
      <p className="label-upper">Job listing</p>
      <h1 className="heading-page">{job.title}</h1>
      <p className="page-subtitle">{job.company.name}</p>

      <p className="tag-line" style={{ marginBottom: 32 }}>
        {metaParts.join(" · ")}
      </p>

      <div className="job-description">{job.description}</div>

      {job.tags.length > 0 && (
        <p className="tag-line" style={{ marginBottom: 32 }}>
          {job.tags.join(" · ")}
        </p>
      )}
    </PageShell>
  );
}
