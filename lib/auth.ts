import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

const resendApiKey =
  process.env.AUTH_RESEND_KEY ??
  process.env.RESEND_API_KEY ??
  process.env.RESEND_KEY;

if (!resendApiKey) {
  throw new Error(
    "Missing Resend API key. Set AUTH_RESEND_KEY, RESEND_API_KEY, or RESEND_KEY.",
  );
}


export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!valid) return null;

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboarded = user.onboarded;
      } else if (token.id) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, onboarded: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.onboarded = dbUser.onboarded;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.onboarded = token.onboarded as boolean;
      }
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
