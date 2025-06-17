import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { VSUserRoleValuesNew, type VSUserWithRolesNew} from "~/types/users";
import { securityUserSelect, VSUserGroupValues, VSUserWithRoles } from "~/types/users-coldfusion";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { validateUserSession } from "~/utils/server/database-tools";
import { createSecurityProfile } from "~/utils/server/securitycontext";
import { security_users_sites } from "@prisma/client";


// export const isOwnOrganization = (userGroupID: string | null, userSiteID: string | null, userSites: Pick<security_users_sites, "SiteID" | "IsContact">[], activeContactId: string): boolean => {
//   switch(userGroupID) {
//     case VSUserGroupValues.Intern:
//       return userSiteID === "1";
//     case VSUserGroupValues.Extern:
//       return userSiteID === activeContactId || userSites.some((site) => site.SiteID === activeContactId && site.IsContact);
//     case VSUserGroupValues.Exploitant:
//       return userSiteID === activeContactId;

//       return true;
//     default:
//       return false;
//   }
// }

export type SecurityUsersResponse = {
  data?: VSUserWithRolesNew[];
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

export interface VSUsersForContact {
  ID: string;
  Name: string;
  Organization: string;
  NewRoleID: string;
}

const getUsersForContact = async (contactID: string): Promise<VSUserWithRolesNew[]> => {
//   { 
//     UserID: true, UserName: true, DisplayName: true, Status: true, SiteID: true, LastLogin: true, user_contact_roles: { select: { ContactID: true, NewRoleID: true } }, security_users_sites: { select: { SiteID: true, IsContact: true } } },
//   orderBy: { UserID: 'asc' }
// }  
  const linkedusers = (await prisma.security_users.findMany({
    where: { user_contact_roles: { some: { ContactID: contactID } } },
    select: securityUserSelect,
    orderBy: { UserID: 'asc' }
  }));

  const result = linkedusers
    .map(user => { 
      const theRoleInfo = user.user_contact_roles.find((role) => role.ContactID === contactID)
      console.log("theRoleInfo - getUsersForContact", theRoleInfo);
      const currentRoleID: VSUserRoleValuesNew = theRoleInfo?.NewRoleID as VSUserRoleValuesNew || VSUserRoleValuesNew.None;
      const isContact = user.security_users_sites.some((site) => site.SiteID === contactID && site.IsContact);
      const isOwnOrganization = theRoleInfo?.isOwnOrganization || false;

      const newUserData: VSUserWithRolesNew = {
        UserID: user.UserID, 
        UserName: user.UserName, 
        DisplayName: user.DisplayName, 
        Status: user.Status, 
        LastLogin: user.LastLogin, 
        // EncryptedPassword: user.EncryptedPassword, 
        // EncryptedPassword2: user.EncryptedPassword2,
        // sites: getSitesForUser(user),
        securityProfile: createSecurityProfile(currentRoleID),
        isContact: isContact,
        isOwnOrganization: isOwnOrganization,
      }
        return newUserData;
    })
    .filter(user => user.DisplayName !== ""); // filter out users without a name or organization

  

    return result;
}

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
  const  contactId = req.query.contactId as unknown as string; // optional: get users for a specific contact, 

  const selectedContactId = contactId || activeContactId;

  const selectedContact = await prisma.contacts.findUnique({
    where: {
      ID: selectedContactId
    }, 
    select: {
      ItemType: true
    }
  });

  // let wherefilter: any = undefined;
  // if(selectedContactId === "1") {
  //   // intern users
  //   wherefilter = { GroupID: VSUserGroupValues.Intern };
  // } else if(selectedContact?.ItemType==="exploitant" || selectedContact?.ItemType==="beheerder") {

  //   const mainusers = await prisma.security_users.findMany({
  //     where: { SiteID: selectedContactId },
  //     select: { UserID: true }
  //   });

  //   const mainids = mainusers.map(u => u.UserID);
  //   wherefilter = {
  //     OR: [
  //       { UserID: { in: mainids } },
  //       { ParentID: { in: mainids} }
  //     ]
  //   }
  // } else if(selectedContact?.ItemType==="organizations") {
  //   // extern users
  //   wherefilter = { 
  //     security_users_sites: {
  //       some: {
  //         SiteID: selectedContactId
  //       }
  //     }, 
  //     GroupID: VSUserGroupValues.Extern };
  // } else if(selectedContact?.ItemType==="dataprovider") {
  //   wherefilter = { GroupID: false };
  // } else {
  //   console.warn("Unknown selectedContact type", selectedContact?.ItemType);
  //   wherefilter = { GroupID: false };
  // }

  switch (req.method) {
    case "GET": {
      // GET all security users
      const newUsers = await getUsersForContact(selectedContactId);
      res.status(200).json({data: newUsers});
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"});
    }
  }
}