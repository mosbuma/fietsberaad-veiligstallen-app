import { prisma } from "~/server/db";

import type { Provider } from "next-auth/providers";
// import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth";
import type {
  NextAuthOptions,
  RequestInternal,
  User,
  Session,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
// import EmailProvider from "next-auth/providers/email"

import CredentialsProvider from "next-auth/providers/credentials";

import {
  getUserFromCredentials,
  getUserFromLoginCode,
} from "../../../utils/auth-tools";

import { type VSUserWithRoles, securityUserSelect } from "~/types/users";
import { createSecurityProfile } from "~/utils/server/securitycontext";

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
      email: { label: "Email", type: "email", placeholder: "user@example.com" },
      password: {
        label: "Password",
        type: "password",
      },
    },
    async authorize(
      credentials: Record<"email" | "password", string> | undefined,
      req: Pick<RequestInternal, "body" | "method" | "headers" | "query">,
    ): Promise<User | null> {
      try {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials", {
            email: !!credentials?.email,
            password: !!credentials?.password,
          });
          return null;
        }

        const user = await getUserFromCredentials(credentials);

        if (!user) {
          console.error("No user found for credentials");
          return null;
        }

        return user;
      } catch (error) {
        console.error("Error in credentials authorize:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }
        return null;
      }
    },
  }),
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
      req: Pick<RequestInternal, "body" | "method" | "headers" | "query">,
    ): Promise<User | null> {
      try {
        if (!credentials?.userid || !credentials?.token) {
          console.error("Missing token credentials", {
            userid: !!credentials?.userid,
            token: !!credentials?.token,
          });
          return null;
        }

        const user = await getUserFromLoginCode(credentials);

        if (!user) {
          console.error("No user found for token");
          return null;
        }

        return user;
      } catch (error) {
        console.error("Error in token-login authorize:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }
        return null;
      }
    },
  }),
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
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: JWT;
      user?: User;
      trigger?: string;
      session?: Session;
    }) {
      try {
        if (user) {
          token.id = user.id;
          token.activeContactId = user.activeContactId;
        }

        if (trigger === "update" && session?.user?.activeContactId) {
          token.activeContactId = session.user.activeContactId;
        }

        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }
        return token;
      }
    },

    // augment session with information that will be used on the client side
    async session({ session, token }: { session: Session; token: JWT }) {
      try {
        if (session?.user && token?.id) {
          const account = (await prisma.security_users.findFirst({
            where: { UserID: token.id as string },
            select: securityUserSelect,
          })) as VSUserWithRoles;

          if (account) {
            const securityProfile = await createSecurityProfile(
              account,
              token.activeContactId as string,
            );

            session.user.id = token.id as string;
            session.user.name = account.DisplayName;
            session.user.activeContactId = token.activeContactId as string;
            session.user.securityProfile = securityProfile;
          } else {
            console.error(`No account found for user ID: ${token.id}`);
          }
        }
        return session;
      } catch (error) {
        console.error("Error in session callback:", error);
        if (error instanceof Error) {
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
          });
        }
        return session;
      }
    },
  },

  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: "/login",
    // signOut: '/',
    // error: '/login', // Error code passed in query string as ?error=
  },
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
};

//
export default NextAuth(authOptions);
