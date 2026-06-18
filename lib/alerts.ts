import { db } from "./db";

type JobWithCompany = {
  id: string;
  title: string;
  description: string;
  location: string;
  tags: string[];
  companyId: string;
};

/**
 * Checks if a job matches an alert subscription.
 * Matching rules:
 * 1. If alert location is specified, the job's location must contain/match it (case-insensitive).
 * 2. If alert keywords are specified, at least one keyword must match the job's title, description, or tags (case-insensitive).
 */
export function isJobMatch(job: JobWithCompany, subscription: { keywords: string[]; location: string | null }) {
  // 1. Match location
  if (subscription.location && subscription.location.trim()) {
    const subLoc = subscription.location.trim().toLowerCase();
    const jobLoc = job.location.toLowerCase();
    if (!jobLoc.includes(subLoc)) {
      return false;
    }
  }

  // 2. Match keywords (at least one must match if present)
  if (subscription.keywords && subscription.keywords.length > 0) {
    const cleanKeywords = subscription.keywords
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (cleanKeywords.length > 0) {
      const titleLower = job.title.toLowerCase();
      const descLower = job.description.toLowerCase();
      const tagsLower = job.tags.map((t) => t.toLowerCase());

      const matchesAnyKeyword = cleanKeywords.some((keyword) => {
        return (
          titleLower.includes(keyword) ||
          descLower.includes(keyword) ||
          tagsLower.some((t) => t.includes(keyword))
        );
      });

      if (!matchesAnyKeyword) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Scans all alert subscriptions, finds matching developers,
 * and processes notifications for them (e.g. logging/mocking email delivery).
 */
export async function dispatchJobAlerts(job: JobWithCompany) {
  try {
    const subscriptions = await db.alertSub.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    const matches: string[] = [];

    for (const sub of subscriptions) {
      if (isJobMatch(job, sub)) {
        matches.push(sub.user.email);
        // Here we could send an email, push notification, or create a DB notification record
        console.log(
          `[JOB ALERT] Matched: User ${sub.user.name || sub.user.email} with Alert ID ${sub.id} matches new job: "${job.title}"`
        );
      }
    }

    return {
      success: true,
      notifiedEmails: matches,
    };
  } catch (error) {
    console.error("[JOB ALERT] Error dispatching alerts:", error);
    return {
      success: false,
      error,
    };
  }
}
