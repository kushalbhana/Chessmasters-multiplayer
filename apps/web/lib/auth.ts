import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthOptions } from "next-auth";

export const NEXT_AUTH_CONFIG: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" }, // ✅ FIXED
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔹 Authorize called with:", credentials);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        // Fetch user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        console.log("🔹 DB user:", user);

        if (!user || !user.password) {
          console.log("❌ User not found or missing password hash");
          return null;
        }

        // Validate password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log("❌ Invalid password");
          return null;
        }

        // Generate JWT
        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "24d" }
        );

        console.log("✅ Credentials authorized for:", user.email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.picture,
          jwt: token, // ✅ JWT will be attached
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const userRecord = await prisma.user.upsert({
          where: { email: profile?.email },
          update: {
            id: profile?.sub,
            name: profile?.name,
            // @ts-expect-error
            picture: profile?.picture,
            oAuthId: profile?.sub,
          },
          create: {
            id: profile?.sub,
            email: profile?.email!,
            name: profile?.name!,
            picture: profile?.image,
            oAuthId: profile?.sub,
          },
        });

        // Generate JWT for Google login
        const token = jwt.sign(
          {
            userId: userRecord.id,
            name: userRecord.name,
            email: userRecord.email,
            picture: userRecord.picture,
          },
          process.env.JWT_SECRET!,
          { expiresIn: "24d" }
        );

        // Attach token to user object
        user.jwt = token;
        user.id = userRecord.id;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.jwt = (user as any).jwt; // ✅ Include JWT
      }
      return token;
    },

    session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.jwt = token.jwt as string; // ✅ Add JWT to session
      }
      return session;
    },
  },
};
