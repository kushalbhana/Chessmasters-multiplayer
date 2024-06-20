import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import prisma from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const NEXT_AUTH_CONFIG = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'email', type: 'text', placeholder: '' },
        password: { label: 'password', type: 'password', placeholder: '' },
      },
      async authorize(credentials: any) {
        const user: any = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          console.log('User not found');
          return null;
        }

        const passwordValidation = await bcrypt.compare(credentials.password, user.password);
        if (passwordValidation) {
          // Generate jwt to authorize at websocket server
          const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET!,
            { expiresIn: '24d' }
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            token: token
          };
        } else {
          return null;
        }
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account.provider === "google") {
        const userRecord = await prisma.user.upsert({
          where: { email: profile.email },
          update: {
            id: profile.sub,
            name: profile.name,
            picture: profile.picture,
            oAuthId: profile.sub,
          },
          create: {
            id: profile.sub,
            email: profile.email,
            name: profile.name,
            picture: profile.picture,
            oAuthId: profile.sub,
          },
        });

        // Generate a JWT for the Google user
        const token = jwt.sign(
          { userId: userRecord.id, email: userRecord.email },
          process.env.JWT_SECRET!,
          { expiresIn: '24d' }
        );

        // Add token to the user object
        user.token = token;
        user.id = userRecord.id; // Ensure user ID is also set
      }
      return true;
    },

    // Handle JWT, include user ID and token
    jwt: async ({ token, user }: any) => {
      if (user) {
        token.uid = user.id; // Add user ID to token
        token.jwt = user.token; // Include JWT in the token object
      }
      return token;
    },

    // Customize session, include user ID and token
    session: ({ session, token }: any) => {
      if (session.user) {
        session.user.id = token.uid; // Add user ID to session
        session.user.jwt = token.jwt; // Include JWT in the session
      }
      return session;
    }
  },
}
