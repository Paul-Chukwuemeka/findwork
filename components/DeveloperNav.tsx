"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function DeveloperNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Applications & Saved Jobs", href: "/developer/dashboard" },
    { name: "My Profile", href: "/developer/profile" },
    { name: "Resumes / CVs", href: "/developer/resumes" },
    { name: "Job Alerts", href: "/developer/alerts" },
    { name: "API Keys", href: "/developer/api-keys" },
  ];

  return (
    <nav className="flex gap-6 border-b border-[#e5e5e5] pb-px mb-8 overflow-x-auto w-full">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 text-sm font-medium transition-all relative -mb-px border-b-2 ${
              isActive
                ? "text-[#111] border-[#111]"
                : "text-[#666] border-transparent hover:text-[#111]"
            }`}
            style={{ textDecoration: "none", whiteSpace: "nowrap" }}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
