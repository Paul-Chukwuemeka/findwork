import { AuthPage } from "@/components/auth/AuthPage";

type LoginSearchParams = {
  callbackUrl?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function safeCallbackUrl(value: string | string[] | undefined) {
  const callbackUrl = firstParam(value);
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return undefined;
  }
  return callbackUrl;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  return <AuthPage mode="login" redirectTo={safeCallbackUrl(params.callbackUrl)} />;
}
