type ApplicationStatusProps = {
  status: string;
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: "status--pending",
  REVIEWED: "status--reviewed",
  SHORTLISTED: "status--shortlisted",
  REJECTED: "status--rejected",
};

export function ApplicationStatus({ status }: ApplicationStatusProps) {
  const className = STATUS_CLASS[status] ?? "status--pending";

  return <span className={`status ${className}`}>{status}</span>;
}
