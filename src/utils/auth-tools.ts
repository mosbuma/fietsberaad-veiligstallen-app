/*
    support functions for login with next-auth
*/
// import type { User } from "next-auth";
import bcrypt from "bcrypt";

export type Account = {
    email: string;
    password_hash: string;
  };

export const accounts: { [key: string]: Account } = {
  "97e766bf-91c2-4be1-a876-69f1e08da07e": {
    email: "testuser@veiligstallen.nl",
    password_hash: bcrypt.hashSync("hellothere!", 10)
  },
};

export const getUserFromCredentials = (
  credentials: Record<"email" | "password", string> | undefined
) => {
  if (!credentials) return undefined;

  const { email, password } = credentials;
  if (!email || !password) return undefined;

  if(accounts!==undefined) {
    const account = Object.values(accounts).find(account => account.email.toLowerCase() === email.toLowerCase())
    if(account!==undefined) {
      if(bcrypt.compareSync(password, account.password_hash)) {
        console.log("*** getUserFromCredentials: found account ", account);
        return account
      }
    }
  }

  console.log("### getUserFromCredentials: account not found");
  return undefined;
};  