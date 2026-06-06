import { db } from "@/lib/db";
import { notFound } from "next/navigation";

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

export default async function JobPage({
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

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{job.title}</h1>
        <p className="text-xl text-gray-600 mt-1">{job.company.name}</p>
        <div className="flex gap-3 mt-3 flex-wrap text-sm">
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            {job.location}
          </span>
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            {job.type.replace("_", " ")}
          </span>
          {job.salaryRange && (
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
              {job.salaryRange}
            </span>
          )}
        </div>
      </div>

      <div className="prose max-w-none mb-8 whitespace-pre-wrap">
        {job.description}
      </div>

      {job.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-8">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <button className="bg-black text-white px-8 py-3 rounded-lg text-lg font-medium">
        Apply for this role
      </button>
    </main>
  );
}
