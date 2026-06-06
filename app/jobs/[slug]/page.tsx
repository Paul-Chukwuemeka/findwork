import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ApplyButton from "./applybutton";
import SaveButton from "./SaveButton";

export default async function JobPage({ params }: { params: { slug: string } }) {
  const session = await auth();

  const {slug} = await params

  const job = await db.job.findUnique({
    where: { slug: slug! },
    include: { company: true },
  });
  if (!job) notFound();

  const [application, savedJob] = session ? await Promise.all([
    db.application.findUnique({
      where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
    }),
    db.savedJob.findUnique({
      where: { jobId_userId: { jobId: job.id, userId: session.user.id } },
    }),
  ]) : [null, null];

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-xl text-gray-600 mt-1">{job.company.name}</p>
        <div className="flex gap-3 mt-3 flex-wrap text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded-full">{job.location}</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">{job.type.replace("_", " ")}</span>
          {job.salaryRange && <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">{job.salaryRange}</span>}
        </div>
      </div>

      <div className="prose max-w-none mb-8 whitespace-pre-wrap">{job.description}</div>

      {job.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {job.tags.map(tag => (
            <span key={tag} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full">{tag}</span>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <ApplyButton jobId={job.id} alreadyApplied={!!application} />
        <SaveButton jobId={job.id} initialSaved={!!savedJob} />
      </div>
    </main>
  );
}