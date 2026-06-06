import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DeveloperDashboard() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "DEVELOPER") redirect("/employer/dashboard");

  const [applications, savedJobs] = await Promise.all([
    db.application.findMany({
      where: { userId: session.user.id },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.savedJob.findMany({
      where: { userId: session.user.id },
      include: { job: { include: { company: true } } },
      orderBy: { savedAt: "desc" },
    }),
  ]);

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-8">My Dashboard</h1>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Applications ({applications.length})</h2>
        {applications.length === 0 && <p className="text-gray-500">No applications yet. <Link href="/jobs" className="underline">Browse jobs</Link></p>}
        <div className="space-y-3">
          {applications.map(app => (
            <div key={app.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <Link href={`/jobs/${app.job.slug}`} className="font-medium hover:underline">{app.job.title}</Link>
                <p className="text-sm text-gray-500">{app.job.company.name} · {app.job.location}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                app.status === "SHORTLISTED" ? "bg-green-100 text-green-700" :
                app.status === "REJECTED" ? "bg-red-100 text-red-700" :
                app.status === "REVIEWED" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-600"
              }`}>
                {app.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Saved Jobs ({savedJobs.length})</h2>
        {savedJobs.length === 0 && <p className="text-gray-500">No saved jobs yet.</p>}
        <div className="space-y-3">
          {savedJobs.map(({ job, savedAt }) => (
            <div key={job.id} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <Link href={`/jobs/${job.slug}`} className="font-medium hover:underline">{job.title}</Link>
                <p className="text-sm text-gray-500">{job.company.name} · {job.location}</p>
              </div>
              <span className="text-xs text-gray-400">{new Date(savedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}