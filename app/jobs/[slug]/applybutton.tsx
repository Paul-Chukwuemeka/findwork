import Link from "next/link";

export default function ApplyButton({
  jobSlug,
  alreadyApplied,
}: {
  jobSlug: string;
  alreadyApplied: boolean;
}) {
  if (alreadyApplied) {
    return (
      <button type="button" disabled className="btn btn-secondary">
        Applied
      </button>
    );
  }

  return (
    <Link href={`/jobs/${jobSlug}/apply`} className="btn btn-primary">
      Apply for this role
    </Link>
  );
}
