import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import prisma from "@repo/db/client";

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
                where: {
                    email: credentials.username
                }
            });

            if (!user) {
                console.log('User not found')
                return null;
            }
            if (user.password === credentials.password){
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
            }else{
                return null
            }
          },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {

      async signIn({ account, profile }: any) {
        if (account.provider === "google") {

          const upsertUser = await prisma.user.upsert({
            where: {
              email: profile.email,
            },
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
              // emailVerified: profile.email_verified
            },
          })
          
          return profile.email_verified && profile.email.endsWith("@gmail.com")
        }
        return true // Do different verification for other providers that don't have `email_verified`
      },

        jwt: async ({ user, token }: any) => {
        if (user) {
            token.uid = user.id;
        }
        return token;
        },
      session: ({ session, token, user }: any) => {
          if (session.user) {
              session.user.id = token.uid
          }
          return session
      }
    },
  }