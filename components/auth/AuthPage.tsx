import { Suspense } from "react";
import { AuthForm } from "./AuthForm";
import { AuthShell } from "./AuthShell";

type AuthPageProps = {
  mode: "login" | "signup";
  redirectTo?: string;
};

export function AuthPage({ mode, redirectTo = "/onboarding" }: AuthPageProps) {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

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
