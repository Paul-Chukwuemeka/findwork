"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pickRole(role: "EMPLOYER" | "DEVELOPER") {
    setLoading(true);
    await Promise.all([
      fetch("/api/user/role", {
        method: "PATCH",
        body: JSON.stringify({ role }),
        headers: { "Content-Type": "application/json" },
      }),
      fetch("/api/user/onboard", {
        method: "PATCH",
        body: JSON.stringify({ onboarded: true }),
        headers: { "Content-Type": "application/json" },
      }),
    ]);

    await update();

    router.push(role === "EMPLOYER" ? "/employer/company/new" : "/jobs");
  }

  return (
    <div className="page flex flex-col">
      <SiteNav showAuth={false} />
      <div
        style={{ padding: 50 }}
        className="flex items-start justify-center w-full flex-1 p-50"
      >
        <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
          <p className="text-[#999]  text-lg">Onboarding</p>
          <h1 className="heading-page">
            Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="page-subtitle">How are you using FindWork?</p>

          <div className="onboarding-grid">
            <button
              type="button"
              onClick={() => pickRole("DEVELOPER")}
              disabled={loading}
              className="onboarding-option"
            >
              <p className="onboarding-option__title">
                I&apos;m looking for work
              </p>
              <p className="onboarding-option__desc">
                Browse and apply to jobs
              </p>
            </button>
            <button
              type="button"
              onClick={() => pickRole("EMPLOYER")}
              disabled={loading}
              className="onboarding-option"
            >
              <p className="onboarding-option__title">I&apos;m hiring</p>
              <p className="onboarding-option__desc">
                Post jobs and find talent
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
