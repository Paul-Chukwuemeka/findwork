"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pickRole(role: "EMPLOYER" | "DEVELOPER") {
    setLoading(true);
    await fetch("/api/user/role", {
      method: "PATCH",
      body: JSON.stringify({ role }),
      headers: { "Content-Type": "application/json" },
    });
    await update(); // refresh session
    router.push(role === "EMPLOYER" ? "/employer/company/new" : "/jobs");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Welcome{session?.user?.name ? `, ${session.user.name}` : ""}!</h1>
        <p className="text-gray-500 mb-8">How are you using DevBoard?</p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => pickRole("DEVELOPER")}
            disabled={loading}
            className="border-2 rounded-xl p-6 hover:border-black transition-colors text-left"
          >
            <div className="text-3xl mb-2">👨‍💻</div>
            <div className="font-semibold">I&apos;m looking for work</div>
            <div className="text-sm text-gray-500 mt-1">Browse and apply to jobs</div>
          </button>
          <button
            onClick={() => pickRole("EMPLOYER")}
            disabled={loading}
            className="border-2 rounded-xl p-6 hover:border-black transition-colors text-left"
          >
            <div className="text-3xl mb-2">🏢</div>
            <div className="font-semibold">I&apos;m hiring</div>
            <div className="text-sm text-gray-500 mt-1">Post jobs and find talent</div>
          </button>
        </div>
      </div>
    </div>
  );
}