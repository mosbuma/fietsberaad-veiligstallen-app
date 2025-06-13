/*
    support functions for login with next-auth
*/
// import type { User } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "~/server/db";
import { security_users } from "@prisma/client";
import type { User } from "next-auth";
import {
  VSUserRoleValuesNew,
  getDefaultSecurityProfile,
} from "~/types/users";
import { createSecurityProfile } from "~/utils/server/securitycontext";
import { initAllTopics } from "~/types/utils";
import { checkToken } from "~/utils/token-tools";

type OrgAccountData = Pick<security_users, "UserID" | "GroupID" | "ParentID" | "SiteID" | "EncryptedPassword"> & {
  security_users_sites: { SiteID: string }[];
};

const getProfileUser = async(orgaccount: OrgAccountData): Promise<User|false> => {
  let profileUserAccount: User = {
    id: "",
    name: "",
    email: "",
    mainContactId: "",
    activeContactId: "",
    securityProfile: getDefaultSecurityProfile(),
  };
  let mainContactId: string | undefined = undefined;
    switch(orgaccount.GroupID) {
      case "intern":
        mainContactId="1";
        break;
      case "extern":
        mainContactId = orgaccount.security_users_sites[0]?.SiteID || undefined;
        break;
      case "beheerder":
      case "exploitant":
        if(orgaccount.ParentID) { // sub exploitant user
          const parentUser = await prisma.security_users.findUnique({
            where: {
              UserID: orgaccount.ParentID,
            },
          });
          mainContactId = parentUser?.SiteID || undefined;
        } else { // main exploitant user
          mainContactId = orgaccount.SiteID || undefined;
        }
        break;
      default:
        mainContactId = undefined;
        break;
    }

    if (mainContactId === undefined) {
      return false;
    }

    const userdata = await prisma.security_users.findFirst({
      where: { UserID: orgaccount.UserID },
      select: {
        UserName: true,
        DisplayName: true,
        user_contact_roles: {
            select: {
                ID: true,
                UserID: true,
                ContactID: true,
                NewRoleID: true,
            }
        },
      }
    });

    let roleId = userdata?.user_contact_roles.find((role) => role.ContactID === profileUserAccount.activeContactId)?.NewRoleID as VSUserRoleValuesNew || VSUserRoleValuesNew.None;

    profileUserAccount.id = orgaccount.UserID || "";
    profileUserAccount.name = userdata?.DisplayName || "";
    profileUserAccount.email = userdata?.UserName || "";
    profileUserAccount.mainContactId = mainContactId;
    profileUserAccount.activeContactId = mainContactId;
    profileUserAccount.securityProfile = createSecurityProfile(roleId);

    return profileUserAccount;
}

// always returns the user's main account
export const getUserFromCredentials = async (
  credentials: Record<"email" | "password", string> | undefined,
): Promise<User | null> => {
  try {
    if (!credentials) {
      console.error("### getUserFromCredentials - no credentials provided");
      return null;
    }

    const { email, password } = credentials;
    if (!email || !password) {
      console.error("### getUserFromCredentials - missing email or password");
      return null;
    }

    const orgaccount = await prisma.security_users.findFirst({
      where: { UserName: email.toLowerCase() },
      select: { 
        UserID: true, 
        GroupID: true,
        ParentID: true,
        SiteID: true,
        EncryptedPassword: true,
        security_users_sites: {
          select: {
            SiteID: true,
          }
        }
      },
    }) as OrgAccountData;

    if (
      orgaccount !== undefined &&
      orgaccount !== null &&
      orgaccount.EncryptedPassword !== null
    ) {
      if (await bcrypt.compare(password, orgaccount.EncryptedPassword)) {
        const profileUserAccount = await getProfileUser(orgaccount);
        if (profileUserAccount) {
          return profileUserAccount;
        } else {
          console.error("### getUserFromCredentials - no profile user account");
          return null;
        }
      } else {
        console.error(
          "### getUserFromCredentials - invalid password for security_users table",
        );
        return null;
      }
    } else {
      console.error("### getUserFromCredentials - no orgaccount");
      return null;
    }
  } catch (error) {
    console.error("Error in getUserFromCredentials:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return null;
  }
};

export const getUserFromLoginCode = async (
  credentials: Record<"userid" | "token", string> | undefined,
): Promise<User | null> => {
  try {
    if (!credentials) {
      console.error("### getUserFromLoginCode - no credentials provided");
      return null;
    }

    const { userid, token } = credentials;
    if (!userid || !token) {
      console.error("### getUserFromLoginCode - missing userid or token");
      return null;
    }

    const tokenData = checkToken(token);

    if (
      tokenData !== false &&
      tokenData.userid.toLowerCase() === userid.toLowerCase()
    ) {
      const orgaccount = await prisma.security_users.findFirst({
        where: { UserID: userid },
        select: { 
          UserID: true, 
          GroupID: true,
          ParentID: true,
          SiteID: true,
          EncryptedPassword: true,
          security_users_sites: {
            select: {
              SiteID: true,
            }
          }
  
        },
      }) as OrgAccountData;

      const profileUserAccount = await getProfileUser(orgaccount);
      if (profileUserAccount) {
        return profileUserAccount;
      } else {
        console.error("### getUserFromCredentials - no profile user account");
        return null;
      }
    } else {
      console.error("### getUserFromLoginCode - invalid login code");
      return null;
    }
  } catch (error) {
    console.error("Error in getUserFromLoginCode:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return null;
  }
};
