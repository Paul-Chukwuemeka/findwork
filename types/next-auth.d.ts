import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      onboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    onboarded: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    onboarded: boolean;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: Role;
    onboarded: boolean;
  }
}
