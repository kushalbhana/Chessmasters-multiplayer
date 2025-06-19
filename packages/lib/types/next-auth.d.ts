// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      jwt: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    jwt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: string;
    jwt: string;
  }
}
