import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    jwt?: string; // ✅ must match what we add in authorize
  }

  interface Session extends DefaultSession {
    user?: DefaultSession["user"] & {
      id?: string;
      jwt?: string;
    };
  }

  interface JWT {
    uid?: string;
    jwt?: string;
  }
}
