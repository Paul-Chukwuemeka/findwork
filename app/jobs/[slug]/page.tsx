import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ApplyButton from "./applybutton";
import SaveButton from "./SaveButton";
import { PageShell } from "@/components/PageShell";
import { formatJobType } from "@/lib/format";

export default async function JobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  const { slug } = await params;

  const job = await db.job.findUnique({
    where: { slug },
    include: { company: true },
  });
  if (!job) notFound();

  const [application, savedJob] = session
    ? await Promise.all([
        db.application.findUnique({
          where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
        }),
        db.savedJob.findUnique({
          where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
        }),
      ])
    : [null, null];

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

      <div className="row-wrap">
        <ApplyButton jobId={job.id} alreadyApplied={!!application} />
        <SaveButton jobId={job.id} initialSaved={!!savedJob} />
      </div>
    </PageShell>
  );
}
