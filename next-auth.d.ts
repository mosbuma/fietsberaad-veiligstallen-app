import NextAuth, { DefaultSession, NextAuthOptions as OriginalNextAuthOptions, RequestInternal as OriginalRequestInternal } from "next-auth";

declare module "next-auth" {

  interface User extends DefaultSession["user"] {
    id: string;
    OrgUserID?: string;
    RoleID?: string;
    GroupID?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    sites?: string[];
  } 

  interface Session {
    user: User;
  }

  // Re-export the original NextAuthOptions
  export type NextAuthOptions = OriginalNextAuthOptions;

  export type RequestInternal = OriginalRequestInternal;

  export type NextAuthOptions = OriginalNextAuthOptions;

  export function NextAuth(options: NextAuthOptions): NextAuthOptions;
}

