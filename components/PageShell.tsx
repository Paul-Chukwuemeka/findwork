"use client";

import { SiteNav } from "./SiteNav";

type PageShellProps = {
  children: React.ReactNode;
  active?: "jobs" | "companies" | "api" | "profile" | "dashboard";
  showAuth?: boolean;
  narrow?: boolean;
  medium?: boolean;
};

export function PageShell({
  children,
  active,
  showAuth = true,
  narrow,
  medium,
}: PageShellProps) {
  const widthClass = narrow
    ? "page-content--narrow"
    : medium
      ? "page-content--medium"
      : "";

  return (
    <div className="page">
      <SiteNav active={active} showAuth={showAuth} />
      <div className={`page-inner page-content ${widthClass}`.trim()}>
        {children}
      </div>
    </div>
  );
}
