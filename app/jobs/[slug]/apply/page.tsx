import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ApplicationStatus } from "@/components/ApplicationStatus";
import { PageShell } from "@/components/PageShell";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatJobType } from "@/lib/format";
import { ApplyForm } from "./ApplyForm";

type ApplyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ApplyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await db.job.findUnique({
    where: { slug },
    include: { company: { select: { name: true } } },
  });

  if (!job) return {};

  return {
    title: `Apply for ${job.title} at ${job.company.name}`,
  };
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const job = await db.job.findFirst({
    where: { slug, isActive: true },
    include: { company: true },
  });

  if (!job) notFound();

  const session = await auth();
  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/jobs/${slug}/apply`)}`);
  }

  const metaParts = [
    job.company.name,
    job.location,
    formatJobType(job.type),
    job.salaryRange,
  ].filter(Boolean);

  if (session.user.role !== "DEVELOPER") {
    return (
      <PageShell active="jobs" medium>
        <p className="label-upper">Apply for role</p>
        <h1 className="heading-page">Developer account required</h1>
        <p className="page-subtitle">{metaParts.join(" \u00b7 ")}</p>

        <div className="notice">
          <p className="notice__title">This account cannot apply</p>
          <p className="body-text">
            Sign in with a developer account to apply for this role.
          </p>
          <div className="apply-actions">
            <Link href={`/jobs/${job.slug}`} className="btn btn-secondary">
              Back to role
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const [application, user] = await Promise.all([
    db.application.findUnique({
      where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
    }),
    db.user.findUnique({
      where: { id: session.user.id },
      select: { resumeUrl: true },
    }),
  ]);

  return (
    <PageShell active="jobs" medium>
      <p className="label-upper">Apply for role</p>
      <h1 className="heading-page">Apply for {job.title}</h1>
      <p className="page-subtitle">{metaParts.join(" \u00b7 ")}</p>

      {application ? (
        <div className="notice">
          <p className="notice__title">You already applied</p>
          <p className="body-text">
            Current status: <ApplicationStatus status={application.status} />
          </p>
          <div className="apply-actions">
            <Link href="/developer/dashboard" className="btn btn-primary">
              View dashboard
            </Link>
            <Link href={`/jobs/${job.slug}`} className="btn btn-secondary">
              Back to role
            </Link>
          </div>
        </div>
      ) : (
        <ApplyForm
          jobId={job.id}
          jobSlug={job.slug}
          initialResumeUrl={user?.resumeUrl}
        />
      )}
    </PageShell>
  );
}
