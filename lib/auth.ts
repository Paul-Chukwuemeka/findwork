import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";

const resendApiKey =
  process.env.AUTH_RESEND_KEY ??
  process.env.RESEND_API_KEY ??
  process.env.RESEND_KEY;

if (!resendApiKey) {
  throw new Error(
    "Missing Resend API key. Set AUTH_RESEND_KEY, RESEND_API_KEY, or RESEND_KEY."
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: resendApiKey,
      from: process.env.RESEND_FROM ?? "DevBoard <onboarding@resend.dev>",
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
});
