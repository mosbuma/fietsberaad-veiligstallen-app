import { prisma } from "~/server/db";

import type { Provider } from "next-auth/providers";
// import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth";
import type { NextAuthOptions, RequestInternal, User } from "next-auth";
// import EmailProvider from "next-auth/providers/email"

import CredentialsProvider from "next-auth/providers/credentials";

import {
  getUserFromCredentials,
  getUserFromLoginCode,
} from "../../../utils/auth-tools";

import { type VSUserWithRoles, securityUserSelect } from "~/types/users";
import { createSecurityProfile } from "~/utils/securitycontext";

const providers: Provider[] = [];

// https://next-auth.js.org/configuration/providers/credentials
providers.push(
  CredentialsProvider({
    id: "credentials",
    name: "Email and password",
    // The credentials is used to generate a suitable form on the sign in page.
    // You can specify whatever fields you are expecting to be submitted.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      email: { label: "Email", type: "email",
        placeholder: "user@example.com",
      },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(
      credentials: Record<"email" | "password", string> | undefined,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      req: Pick<RequestInternal, "body" | "method" | "headers" | "query">
    ): Promise<User | null> {
      const user = await getUserFromCredentials(credentials);
      return user;
    },
  })
);

// Token-based authentication provider
providers.push(
  CredentialsProvider({
    id: "token-login",
    name: "Token Login",
    credentials: {
      userid: { label: "userid", type: "text" },
      token: { label: "token", type: "text" },
    },
    async authorize(
      credentials: Record<"userid" | "token", string> | undefined,
      req: Pick<RequestInternal, "body" | "method" | "headers" | "query">
    ): Promise<User | null> {
      const user = await getUserFromLoginCode(credentials);
      return user;
    },
  })
);

// https://next-auth.js.org/configuration/providers/credentials
// providers.push(
//   CredentialsProvider({
//     // The name to display on the sign in form (e.g. 'Sign in with...')
//     name: "Email and password",
//     // The credentials is used to generate a suitable form on the sign in page.
//     // You can specify whatever fields you are expecting to be submitted.
//     // e.g. domain, username, password, 2FA token, etc.
//     // You can pass any HTML attribute to the <input> tag through the object.
//     credentials: {
//       email: {
//         label: "Email",
//         type: "email",
//         placeholder: "user@example.com",
//       },
//       password: {
//         label: "Password",
//         type: "password",
//       },
//     },
//     async authorize(
//       credentials: Record<"email" | "password", string> | undefined,
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       req: Pick<RequestInternal, "body" | "method" | "headers" | "query">
//     ): Promise<User | null> {
//       const user = await getUserFromCredentials(credentials);
//       return user;
//     },
//   }),
//   // EmailProvider({
//   //   name: "Magic link",
//   //   server: {
//   //     host: process.env.EMAIL_SERVER_HOST,
//   //     port: process.env.EMAIL_SERVER_PORT,
//   //     auth: {
//   //       user: process.env.EMAIL_SERVER_USER,
//   //       pass: process.env.EMAIL_SERVER_PASSWORD
//   //     }
//   //   },
//   //   from: process.env.EMAIL_FROM,
//   //   maxAge: 60 * 60, // 1 hour
//   //   // sendVerificationRequest({
//   //   //   identifier: email,
//   //   //   url,
//   //   //   provider: { server, from }
//   //   // }) {
//   //   //   /* your function */
//   //   // }
//   // })
// );

export const authOptions: NextAuthOptions = {
  providers,
  // adapter: PrismaAdapter(prisma),
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // augment jwt token with information that will be used on the server side
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.activeContactId = user.activeContactId;
      }

      // Update the token when the session is updated
      if (trigger === "update" && session?.user?.activeContactId) {
        token.activeContactId = session.user.activeContactId;
      }

      return token;
    },

    // augment session with information that will be used on the client side
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user && token?.id) {
        const account = await prisma.security_users.findFirst({ 
          where: { UserID: token.id }, 
          select: securityUserSelect 
        }) as VSUserWithRoles;

        if (account) {
          // Use token's activeContactId if it exists, otherwise use the main contact
          const securityProfile = await createSecurityProfile(
            account,
            token.activeContactId
          );

          session.user.id = token.id;
          session.user.name = account.DisplayName;
          session.user.activeContactId = token.activeContactId;
          session.user.securityProfile = securityProfile;
        }
      } else {
        console.log(">>> SESSION NO USER");
      }

      return session;
    },
  },

  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: '/login',
    // signOut: '/',
    // error: '/login', // Error code passed in query string as ?error=
  },
};

//
export default NextAuth(authOptions);
