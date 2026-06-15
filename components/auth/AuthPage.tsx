"use client";

import { Suspense, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AuthForm } from "./AuthForm";
import { AuthShell } from "./AuthShell";

type AuthPageProps = {
  mode: "login" | "signup";
  redirectTo?: string;
};

export function AuthPage({ mode, redirectTo = "/onboarding" }: AuthPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  useEffect(() => {
    if (session?.user) {
      if (session.user.onboarded) {
        router.push(
          session.user.role === "EMPLOYER"
            ? "/employer/dashboard"
            : "/developer/dashboard",
        );
      } else {
        router.push("/onboarding");
      }
    }
  }, [session, router]);

  return (
    <AuthShell>
      <Suspense>
        <AuthForm
          mode={mode}
          redirectTo={redirectTo}
          googleEnabled={googleEnabled}
        />
      </Suspense>
    </AuthShell>
  );
}
