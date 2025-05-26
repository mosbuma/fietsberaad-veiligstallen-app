import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { VSUserRoleValuesNew, type VSUserWithRoles, type VSUserWithRolesNew, type VSUserInLijstNew,type VSUserSitesNew, securityUserSelect, VSUserGroupValues } from "~/types/users";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { validateUserSession, generateID } from "~/utils/server/database-tools";
import { createSecurityProfile, createSecurityProfileCompact } from "~/utils/server/securitycontext";

// TODO: implement filtering on accessible security_users

const getSitesForUser = (user: VSUserWithRoles): VSUserSitesNew[] => {
  return user.security_users_sites.map((site) => ({
    SiteID: site.SiteID,
    IsContact: site.IsContact,
    IsOwnOrganization: user.SiteID === site.SiteID,
    newRoleId: VSUserRoleValuesNew.None
  }))
}

export const convertToNewUser = async (user: VSUserWithRoles, activeContactId: string): Promise<VSUserWithRolesNew|false> => {
  if(null===user) {
    console.error("convertToNewUser: user is null");
    return false;
  }

  return {
    UserID: user.UserID, 
    UserName: user.UserName, 
    DisplayName: user.DisplayName, 
    Status: user.Status, 
    SiteID: user.SiteID, 
    ParentID: user.ParentID, 
    LastLogin: user.LastLogin, 
    // EncryptedPassword: user.EncryptedPassword, 
    // EncryptedPassword2: user.EncryptedPassword2,
    sites: getSitesForUser(user),
    securityProfile: await createSecurityProfile(user, activeContactId)
  }
}

export const convertToNewUserCompact = (user: VSUserWithRoles): VSUserInLijstNew => {
  return {
    UserID: user.UserID, 
    UserName: user.UserName, 
    DisplayName: user.DisplayName, 
    Status: user.Status, 
    SiteID: user.SiteID, 
    ParentID: user.ParentID, 
    LastLogin: user.LastLogin, 
    // EncryptedPassword: user.EncryptedPassword, 
    // EncryptedPassword2: user.EncryptedPassword2,
    sites: getSitesForUser(user),
    securityProfile: createSecurityProfileCompact(user)
  }
}

export type SecurityUsersResponse = {
  data?: VSUserWithRolesNew[] | VSUserInLijstNew[];
  error?: string;
};

export const securityUserCreateSchema = z.object({
  UserName: z.string().min(1),
  DisplayName: z.string().min(1),
  RoleID: z.number(),
  GroupID: z.string().optional(),
  Status: z.string().optional(),
  Password: z.string().min(1),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<SecurityUsersResponse>
) {
  const session = await getServerSession(req, res, authOptions);
  const validateUserSessionResult = await validateUserSession(session, "any");
  
  if ('error' in validateUserSessionResult) {
    res.status(validateUserSessionResult.status).json({error: `validate user session error:${validateUserSessionResult.status} - ${validateUserSessionResult.error}`});
    return;
  }

  const { sites, userId, activeContactId } = validateUserSessionResult;

  const activeContact = await prisma.contacts.findUnique({
    where: {
      ID: activeContactId
    }, 
    select: {
      ItemType: true
    }
  });

  let wherefilter: any = undefined;
  if(activeContactId === "1") {
    // intern users
    wherefilter = { GroupID: VSUserGroupValues.Intern };
  } else if(activeContact?.ItemType==="exploitant" || activeContact?.ItemType==="beheerder") {

    const mainusers = await prisma.security_users.findMany({
      where: { SiteID: activeContactId },
      select: { UserID: true }
    });

    const mainids = mainusers.map(u => u.UserID);
    wherefilter = {
      OR: [
        { UserID: { in: mainids } },
        { ParentID: { in: mainids} }
      ]
    }
  } else if(activeContact?.ItemType==="organizations") {
    // extern users
    wherefilter = { 
      security_users_sites: {
        some: {
          SiteID: activeContactId
        }
      }, 
      GroupID: VSUserGroupValues.Extern };
  } else if(activeContact?.ItemType==="dataprovider") {
    wherefilter = { GroupID: false };
  } else {
    console.warn("Unknown activeContact type", activeContact?.ItemType);
    wherefilter = { GroupID: false };
  }

  switch (req.method) {
    case "GET": {
      const compact = req.query.compact === 'true';

      // GET all security users
      const users = await prisma.security_users.findMany({
        where: wherefilter,
        select: securityUserSelect
      }) as VSUserWithRoles[];

      let newUsers: VSUserWithRolesNew[] | VSUserInLijstNew[] = [];

      if(compact) {
        newUsers = users.map((user) => {
          const result = convertToNewUserCompact(user);
          return result;
        });
      } else {
        newUsers = (await Promise.all(users.map(async (user) => {
          const result = convertToNewUser(user, activeContactId);
          return result;
        }))).filter((user): user is VSUserWithRolesNew => user !== false);
      }

      res.status(200).json({data: newUsers});
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"});
    }
  }
} 