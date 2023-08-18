// from: https://github.com/nextauthjs/next-auth-example/tree/main

import type { Provider } from "next-auth/providers";
import NextAuth from "next-auth";
import type { NextAuthOptions, User } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import {
  Account, getUserFromCredentials,
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
      credentials: Record<"email" | "password", string> | undefined
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // req
    ): Promise<Account | undefined> {
      const account = getUserFromCredentials(credentials);
      // console.log(
      //   "authorize user credentials",
      //   JSON.stringify(user, null, 2)
      // );
      return account;
    },
  })
);

export const authOptions: NextAuthOptions = {
  providers,

  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    // augment jwt token with information that will be used on the server side
    async jwt({ token, account: accountParam }) {
      const creatingJwtToken = !!accountParam && token.email;

      // only once, when creating a jwt token (signIn) (account !== null)
      if (creatingJwtToken) {
        // console.log("-------------------------------------------------------");
        console.log("jwt account", JSON.stringify(accountParam, null, 2));
        console.log("jwt token", JSON.stringify(token, null, 2));
        console.log(
          `"${token.name}" <${token.email}> signed in at "${new Date().toISOString()}" with account "${accountParam.email}"`
        );

        // const account_uuid =
        //   getAccountUuidWithEmail(token.email as string) || "";
        // token.account_uuid = account_uuid;

        // console.log("jwt token created", JSON.stringify(token, null, 2));
      }
      return token;
    },

    // augment session with information that will be used on the client side
    async session({ session, token }) {
      if (session?.user) {
        // session.user.account_uuid = token.account_uuid;
        // console.log(
        //   "session",
        //   JSON.stringify(session, null, 2),
        //   JSON.stringify(token, null, 2)
        // );
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
