/*
    support functions for login with next-auth
*/
// import type { User } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "~/server/db";
import type { User } from "next-auth";
import {
  securityUserSelect,
  VSUserGroupValues,
  VSUserRoleValuesNew,
  VSUserWithRoles,
} from "~/types/users";
import { createSecurityProfile } from "~/utils/server/securitycontext";
import { initAllTopics } from "~/types/utils";
import { checkToken } from "~/utils/token-tools";

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

    let validaccount = false;
    let account: User = {
      id: "",
      email: email.toLocaleLowerCase(),
      activeContactId: "",
      securityProfile: {
        mainContactId: "",
        roleId: VSUserRoleValuesNew.None,
        groupId: VSUserGroupValues.Extern,
        rights: initAllTopics({
          create: false,
          read: false,
          update: false,
          delete: false,
        }),
      },
    };

    const orgaccount = await prisma.security_users.findFirst({
      where: { UserName: email.toLowerCase() },
      select: { UserID: true, EncryptedPassword: true },
    });

    if (
      orgaccount !== undefined &&
      orgaccount !== null &&
      orgaccount.EncryptedPassword !== null
    ) {
      if (await bcrypt.compare(password, orgaccount.EncryptedPassword)) {
        const userdata = (await prisma.security_users.findFirst({
          where: { UserName: email.toLowerCase() },
          select: securityUserSelect,
        })) as VSUserWithRoles;
        validaccount = true;
        account.id = userdata?.UserID || "";
        account.securityProfile = await createSecurityProfile(userdata);
        if (account.securityProfile) {
          account.activeContactId = account.securityProfile.mainContactId;
        }
      } else {
        console.error(
          "### getUserFromCredentials - invalid password for security_users table",
        );
      }
    } else {
      console.error("### getUserFromCredentials - no orgaccount");
    }

    return validaccount ? account : null;
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

    let validaccount = false;
    let account: User = {
      id: "",
      email: "",
      activeContactId: "",
      securityProfile: {
        mainContactId: "",
        groupId: VSUserGroupValues.Extern,
        roleId: VSUserRoleValuesNew.None,
        rights: initAllTopics({
          create: false,
          read: false,
          update: false,
          delete: false,
        }),
      },
    };

    try {
      const tokenData = checkToken(token);

      if (
        tokenData !== false &&
        tokenData.userid.toLowerCase() === userid.toLowerCase()
      ) {
        const userdata = (await prisma.security_users.findFirst({
          where: { UserID: userid },
          select: securityUserSelect,
        })) as VSUserWithRoles;
        validaccount = true;
        account.id = userdata?.UserID || "";
        account.email = userdata?.UserName || "";
        account.securityProfile = await createSecurityProfile(userdata);
        if (account.securityProfile) {
          account.activeContactId = account.securityProfile.mainContactId;
        }
      } else {
        console.error("### getUserFromLoginCode - invalid login code");
      }
    } catch (error) {
      console.error("Error processing login code:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
    }

    return validaccount ? account : null;
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
