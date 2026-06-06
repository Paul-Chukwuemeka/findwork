import React from "react";
import { db } from "@/lib/db";
import { JobType } from "@prisma/client";
import Link from "next/link";

export const revalidate = 60;

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

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Tech Jobs in Africa</h1>
      <p className="text-gray-500 mb-8">{jobs.length} open positions</p>

      <form className="flex gap-2 mb-8">
        <input name="q" defaultValue={q} placeholder="Search jobs or skills..." className="flex-1 border rounded px-3 py-2" />
        <input name="location" defaultValue={location} placeholder="Location" className="border rounded px-3 py-2 w-40" />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded">Search</button>
      </form>

      <div className="space-y-4">
        {jobs.map(job => (
          <Link key={job.id} href={`/jobs/${job.slug}`} className="block border rounded-lg p-4 hover:border-black transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-lg">{job.title}</h2>
                <p className="text-gray-600">{job.company.name} · {job.location}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{job.type.replace("_", " ")}</span>
                  {job.salaryRange && <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{job.salaryRange}</span>}
                  {job.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
