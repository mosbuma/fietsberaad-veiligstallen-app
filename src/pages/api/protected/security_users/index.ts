import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { VSUserRoleValuesNew, type VSUserWithRoles, type VSUserWithRolesNew, type VSUserSitesNew, securityUserSelect } from "~/types/users";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { validateUserSession, generateID } from "~/utils/server/database-tools";
import bcrypt from "bcrypt";
import { createSecurityProfile } from "~/utils/server/securitycontext";

// TODO: implement filtering on accessible security_users

const getSitesForUser = (user: VSUserWithRoles): VSUserSitesNew[] => {
  return user.security_users_sites.map((site) => ({
    SiteID: site.SiteID,
    IsContact: site.IsContact,
    IsOwnOrganization: user.SiteID === site.SiteID,
    newRoleId: VSUserRoleValuesNew.None
  }))
}

export const convertToNewUser = async (user: VSUserWithRoles): Promise<VSUserWithRolesNew> => {
  return {
    ...user,
    sites: getSitesForUser(user),
    securityProfile: await createSecurityProfile(user)
  }
}

export type SecurityUsersResponse = {
  data?: VSUserWithRolesNew[];
  error?: string;
};

const securityUserCreateSchema = z.object({
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

  const { sites, userId } = validateUserSessionResult;

  switch (req.method) {
    case "GET": {
      // GET all security users
      const users = await prisma.security_users.findMany({
        where: {
          OR: [
            { SiteID: { in: sites } },
            { GroupID: { in: sites } }
          ]
        },
        select: securityUserSelect
      }) as VSUserWithRoles[];

      const newUsers = await Promise.all(users.map(async (user) => ({
        ...user,
        sites: getSitesForUser(user),
        securityProfile: await createSecurityProfile(user)
      })));

      res.status(200).json({data: newUsers});
      break;
    }
    case "POST": {
      try {
        const parseResult = securityUserCreateSchema.safeParse(req.body);
        if (!parseResult.success) {
          console.error("Unexpected/missing data error:", parseResult.error);
          res.status(400).json({ error: "Unexpected/missing data error:" });
          return;
        }
        const parsed = parseResult.data;

        const newUserID = generateID();
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(parsed.Password, 10);
        
        const createdUser = await prisma.security_users.create({
          data: {
            UserID: newUserID,
            UserName: parsed.UserName,
            DisplayName: parsed.DisplayName,
            RoleID: parsed.RoleID,
            GroupID: parsed.GroupID,
            Status: parsed.Status ?? "1",
            EncryptedPassword: hashedPassword,
            SiteID: session.user.SiteID 
          },
          select: securityUserSelect
        }) as VSUserWithRoles;

        const newUser = await convertToNewUser(createdUser);

        res.status(201).json({ data: [newUser] });
      } catch (e) {
        console.error("Error creating security user:", e);
        res.status(500).json({error: "Error creating security user"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"});
    }
  }
} 