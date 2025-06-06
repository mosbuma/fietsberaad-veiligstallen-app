import NextAuth, { DefaultSession, NextAuthOptions as OriginalNextAuthOptions, RequestInternal as OriginalRequestInternal } from "next-auth";
import { VSUserSecurityProfile } from "~/types";

declare module "next-auth" {
  export type ISODateString = string

  interface User extends DefaultSession["user"] {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    activeContactId?: string | null;  
    securityProfile?: VSUserSecurityProfile;
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

