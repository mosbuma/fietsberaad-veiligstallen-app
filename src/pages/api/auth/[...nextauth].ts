import { prisma } from "~/server/db";

import type { Provider } from "next-auth/providers";
// import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth";
import type { NextAuthOptions, RequestInternal, User } from "next-auth";
// import EmailProvider from "next-auth/providers/email"

import CredentialsProvider from "next-auth/providers/credentials";

import {
  getUserFromCredentials,
} from "../../../utils/auth-tools";

const providers: Provider[] = [];

// https://next-auth.js.org/configuration/providers/credentials
providers.push(
  CredentialsProvider({
    // The name to display on the sign in form (e.g. 'Sign in with...')
    name: "Email and password",
    // The credentials is used to generate a suitable form on the sign in page.
    // You can specify whatever fields you are expecting to be submitted.
    // e.g. domain, username, password, 2FA token, etc.
    // You can pass any HTML attribute to the <input> tag through the object.
    credentials: {
      email: {
        label: "Email",
        type: "email",
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
  }),
  // EmailProvider({
  //   name: "Magic link",
  //   server: {
  //     host: process.env.EMAIL_SERVER_HOST,
  //     port: process.env.EMAIL_SERVER_PORT,
  //     auth: {
  //       user: process.env.EMAIL_SERVER_USER,
  //       pass: process.env.EMAIL_SERVER_PASSWORD
  //     }
  //   },
  //   from: process.env.EMAIL_FROM,
  //   maxAge: 60 * 60, // 1 hour
  //   // sendVerificationRequest({
  //   //   identifier: email,
  //   //   url,
  //   //   provider: { server, from }
  //   // }) {
  //   //   /* your function */
  //   // }
  // })
);

export const authOptions: NextAuthOptions = {
  providers,
  // adapter: PrismaAdapter(prisma),
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // augment jwt token with information that will be used on the server side
    async jwt({ user, token, _account: accountParam }: { user: User | null; token: any; _account?: any }) {
      if (token && 'OrgUserID' in token === false && user) {
        token.OrgUserID = user.OrgUserID;
      }

      return token;
    },

    // augment session with information that will be used on the client side
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user && token?.OrgUserID) {
        const account = await prisma.security_users.findFirst({ where: { UserID: token.OrgUserID } });
        if (account) {
          // console.log("session - account", JSON.stringify(account, null, 2));
          // console.log("session - token", JSON.stringify(token, null, 2));
          session.user.OrgUserID = token.OrgUserID;
          session.user.RoleID = account.RoleID;

          const sites = await prisma.security_users_sites.findMany({ where: { UserID: token.OrgUserID } });
          const role = await prisma.security_roles.findFirst({ where: { RoleID: account.RoleID || -1 } });

          session.user.sites = sites.map((s) => s.SiteID);
          session.user.GroupID = role?.GroupID;
          session.user.Role = role?.GroupID;

          session.user.name = account.DisplayName;
          // session.user.email = account.Email;
          // session.user.image = account.Image;

          // console.log(
          //   "session",
          //   JSON.stringify(session, null, 2),
          //   // JSON.stringify(token, null, 2)
          // );
        }
      } else {
        console.log("session - no user or token");
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
