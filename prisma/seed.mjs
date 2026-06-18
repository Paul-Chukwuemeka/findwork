import pkg from "@next/env";

import bcrypt from "bcryptjs";
import { PrismaClient, Role, JobType, ApplicationStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const { loadEnvConfig } = pkg;
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL. Set it before running the seed.");
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const password = await bcrypt.hash("password123", 12);

  await prisma.application.deleteMany();
  await prisma.savedJob.deleteMany();
  await prisma.alertSub.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const employer = await prisma.user.create({
    data: {
      name: "Amina Yusuf",
      email: "amina@findwork.dev",
      password,
      role: Role.EMPLOYER,
      onboarded: true,
      createdAt: daysAgo(30),
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin Moderator",
      email: "admin@findwork.dev",
      password,
      role: Role.ADMIN,
      onboarded: true,
      createdAt: daysAgo(30),
    },
  });

  const developer = await prisma.user.create({
    data: {
      name: "Tunde Okafor",
      email: "tunde@findwork.dev",
      password,
      role: Role.DEVELOPER,
      onboarded: true,
      resumeUrl: "https://example.com/resumes/tunde-okafor.pdf",
      createdAt: daysAgo(24),
    },
  });

  const newDeveloper = await prisma.user.create({
    data: {
      name: "Aisha Mensah",
      email: "aisha@findwork.dev",
      password,
      role: Role.DEVELOPER,
      onboarded: false,
      createdAt: daysAgo(6),
    },
  });

  const koraLabs = await prisma.company.create({
    data: {
      ownerId: employer.id,
      name: "Kora Labs",
      slug: slugify("Kora Labs"),
      website: "https://koralabs.dev",
      location: "Lagos, Nigeria",
      about:
        "Builds developer tooling and hiring workflows for fast-growing African startups.",
      verified: true,
      createdAt: daysAgo(21),
    },
  });

  const koraStudio = await prisma.company.create({
    data: {
      ownerId: employer.id,
      name: "Kora Studio",
      slug: slugify("Kora Studio"),
      website: "https://studio.koralabs.dev",
      location: "Remote",
      about:
        "A product studio shipping internal tools, customer portals, and launch pages.",
      verified: false,
      createdAt: daysAgo(18),
    },
  });

  const jobs = [
    {
      companyId: koraLabs.id,
      title: "Frontend Engineer",
      type: JobType.FULL_TIME,
      location: "Lagos, Nigeria",
      salaryRange: "$55k - $85k",
      tags: ["React", "Next.js", "TypeScript"],
      description:
        "Own the core product experience across the FindWork web app and related dashboards.",
      createdAt: daysAgo(14),
    },
    {
      companyId: koraLabs.id,
      title: "Backend Engineer",
      type: JobType.FULL_TIME,
      location: "Remote",
      salaryRange: "$60k - $95k",
      tags: ["Node.js", "PostgreSQL", "Prisma"],
      description:
        "Design APIs, evolve the data model, and keep the job marketplace fast and reliable.",
      createdAt: daysAgo(12),
    },
    {
      companyId: koraLabs.id,
      title: "Product Designer",
      type: JobType.CONTRACT,
      location: "Accra, Ghana",
      salaryRange: "$4k - $6k/mo",
      tags: ["Figma", "Design Systems", "UX"],
      description:
        "Shape a clean, high-conviction interface for candidates and hiring teams.",
      createdAt: daysAgo(10),
    },
    {
      companyId: koraStudio.id,
      title: "Developer Relations Engineer",
      type: JobType.FULL_TIME,
      location: "Remote",
      salaryRange: "$50k - $80k",
      tags: ["Community", "Writing", "TypeScript"],
      description:
        "Create demos, launch tutorials, and help developers build on the platform.",
      createdAt: daysAgo(9),
    },
    {
      companyId: koraStudio.id,
      title: "Mobile Engineer",
      type: JobType.INTERNSHIP,
      location: "Nairobi, Kenya",
      salaryRange: "$1.5k/mo",
      tags: ["React Native", "Expo", "Mobile"],
      description:
        "Help ship the mobile companion app and improve the candidate experience on smaller screens.",
      createdAt: daysAgo(7),
    },
    {
      companyId: koraStudio.id,
      title: "Technical Writer",
      type: JobType.PART_TIME,
      location: "Remote",
      salaryRange: "$2k - $3k/mo",
      tags: ["Docs", "API", "Developer Experience"],
      description:
        "Document API flows, onboarding steps, and feature launches for the public site.",
      createdAt: daysAgo(4),
    },
  ];

  const createdJobs = [];

  for (const job of jobs) {
    const createdJob = await prisma.job.create({
      data: {
        ...job,
        slug: slugify(
          `${job.title} ${job.companyId === koraLabs.id ? koraLabs.slug : koraStudio.slug}`,
        ),
      },
    });

    createdJobs.push(createdJob);
  }

  await prisma.application.create({
    data: {
      jobId: createdJobs[0].id,
      userId: developer.id,
      resumeUrl: "https://example.com/resumes/tunde-okafor.pdf",
      coverLetter:
        "I have shipped product interfaces in production and enjoy turning design into reliable UI.",
      status: ApplicationStatus.PENDING,
      createdAt: daysAgo(3),
    },
  });

  await prisma.application.create({
    data: {
      jobId: createdJobs[1].id,
      userId: developer.id,
      resumeUrl: "https://example.com/resumes/tunde-okafor.pdf",
      coverLetter:
        "I like working close to the product and database layers. Prisma and Postgres are a strong fit for me.",
      status: ApplicationStatus.REVIEWED,
      createdAt: daysAgo(2),
    },
  });

  await prisma.application.create({
    data: {
      jobId: createdJobs[3].id,
      userId: developer.id,
      resumeUrl: "https://example.com/resumes/tunde-okafor.pdf",
      coverLetter:
        "I have written docs for shipped APIs and can help with tutorials, examples, and launch content.",
      status: ApplicationStatus.SHORTLISTED,
      createdAt: daysAgo(1),
    },
  });

  await prisma.savedJob.create({
    data: {
      jobId: createdJobs[0].id,
      userId: developer.id,
      savedAt: daysAgo(5),
    },
  });

  await prisma.savedJob.create({
    data: {
      jobId: createdJobs[3].id,
      userId: developer.id,
      savedAt: daysAgo(4),
    },
  });

  await prisma.savedJob.create({
    data: {
      jobId: createdJobs[5].id,
      userId: developer.id,
      savedAt: daysAgo(2),
    },
  });

  await prisma.alertSub.create({
    data: {
      userId: developer.id,
      keywords: ["Next.js", "TypeScript", "Remote"],
      location: "Lagos, Nigeria",
      createdAt: daysAgo(8),
    },
  });

  await prisma.alertSub.create({
    data: {
      userId: newDeveloper.id,
      keywords: ["Design", "Product"],
      location: "Remote",
      createdAt: daysAgo(6),
    },
  });

  await prisma.apiKey.create({
    data: {
      userId: developer.id,
      key: "db_dev_tunde_local_key",
      label: "Local development key",
      lastUsed: daysAgo(1),
      createdAt: daysAgo(11),
    },
  });

  console.log("Seeded development data:");
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Employer: ${employer.email}`);
  console.log(`- Developer: ${developer.email}`);
  console.log(`- Onboarding user: ${newDeveloper.email}`);
  console.log(`- API key: db_dev_tunde_local_key`);
  console.log(`- Jobs: ${createdJobs.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
