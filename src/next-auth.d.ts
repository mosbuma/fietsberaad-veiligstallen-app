import NextAuth, { DefaultSession, NextAuthOptions as OriginalNextAuthOptions, RequestInternal as OriginalRequestInternal } from "next-auth";

declare module "next-auth" {
  export type ISODateString = string

  interface User extends DefaultSession["user"] {
    id: string;
    OrgUserID?: string;
    RoleID?: string;
    Role?: string;
    GroupID?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    sites?: string[];
  } 

  interface Session {
    expires: ISODateString
    user: User; // overwrite the user type
  }

  // Re-export the original NextAuthOptions
  export type NextAuthOptions = OriginalNextAuthOptions;

  export type RequestInternal = OriginalRequestInternal;

  export type NextAuthOptions = OriginalNextAuthOptions;

  export function NextAuth(options: NextAuthOptions): NextAuthOptions;
}

