import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { VSUserGroupValues, VSUserRoleValues, VSUserRoleValuesNew, type VSUserWithRoles, type VSUserWithRolesNew, securityUserSelect } from "~/types/users";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { generateID, validateUserSession } from "~/utils/server/database-tools";
import { convertToNewUser } from "~/pages/api/protected/security_users/index";
import bcrypt from "bcryptjs";
import { convertNewRoleToOldRole } from "~/utils/securitycontext";
import { security_users } from "@prisma/client";
// TODO: implement filtering on accessible security_users

export type SecurityUserResponse = {
  data?: VSUserWithRolesNew;
  error?: string;
};

export const securityUserCreateSchema = z.object({
  UserID: z.string(),
  UserName: z.string().min(1),
  DisplayName: z.string().min(1),
  Status: z.string(),
  RoleID: z.nativeEnum(VSUserRoleValuesNew),
  SiteID: z.string().nullable(),
  password: z.string(),
});

export const securityUserUpdateSchema = securityUserCreateSchema.partial().required({UserID: true});

const oldSecurityUserCreateSchema = securityUserCreateSchema.omit({password: true, RoleID: true}).extend({
  RoleID: z.nativeEnum(VSUserRoleValues),
  EncryptedPassword: z.string(),
});

export const oldSecurityUserUpdateSchema = oldSecurityUserCreateSchema.partial().required({UserID: true})

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse<SecurityUserResponse>
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({error: "Unauthorized - no session found"});
    return;
  }

  const validateUserSessionResult = await validateUserSession(session, "any");
  if ('error' in validateUserSessionResult) {
    res.status(401).json({error: validateUserSessionResult.error});
    return;
  }

  const id = req.query.id as string;
  const activeContactId = session.user.activeContactId;

  switch (req.method) {
    case "GET": {
      const user = await prisma.security_users.findFirst({
        where: {
          UserID: id,
        },
        select: securityUserSelect
      }) as VSUserWithRoles;
      const newUser = await convertToNewUser(user, activeContactId);
      res.status(200).json({data: newUser || undefined});
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

        // determine the groupID based on the siteID
        let groupID: VSUserGroupValues | undefined = undefined;
        if(parsed.SiteID===null) {
          groupID = VSUserGroupValues.Intern;
        } else {
          const contact = await prisma.contacts.findFirst({
            where: {
              ID: parsed.SiteID,
            },
          });

          if(!contact) {
            console.error("Contact not found for siteID:", parsed.SiteID);
            res.status(400).json({error: "Contact not found for siteID"});
            return;
          }

          if(contact.ItemType === "organizations") {
            groupID = VSUserGroupValues.Extern;
          } else if(contact.ItemType === "exploitant") {
            groupID = VSUserGroupValues.Exploitant;
          } else if(contact.ItemType === "dataprovider") {
            console.error("Dataproviders have no users");
            res.status(400).json({error: "Contact has unknown item type"});
            return;
          } else {
            console.error("Contact has unknown item type:", contact.ItemType);
            res.status(400).json({error: "Contact has unknown item type"});
            return;
          }
        }

        const hashedPassword = await bcrypt.hash(parsed.password, 10);

        const oldRole = convertNewRoleToOldRole(parsed.RoleID);

        const data: Pick<security_users, "UserID" | "UserName" | "DisplayName" | "RoleID" | "Status" | "GroupID" | "SiteID" | "ParentID" | "LastLogin" | "EncryptedPassword">  = {
          UserID: newUserID,
          UserName: parsed.UserName,
          DisplayName: parsed.DisplayName,
          RoleID: oldRole,
          GroupID: groupID,
          Status: parsed.Status ?? "1",
          EncryptedPassword: hashedPassword,
          SiteID: parsed.SiteID,
          ParentID: null,
          LastLogin: null
        }
        
        const createdUser = await prisma.security_users.create({
          data,
          select: securityUserSelect
        }) as VSUserWithRoles;

        const newUser = await convertToNewUser(createdUser, activeContactId);

        res.status(201).json({ data: newUser || undefined });
      } catch (e) {
        console.error("Error creating security user:", e);
        res.status(500).json({error: "Error creating security user"});
      }
      break;
    }
    case "PUT": {
      try {
        const parseResult = securityUserUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
          console.error("Unexpected/missing data error:", parseResult.error);
          res.status(400).json({error: "Unexpected/missing data error:"});
          return;
        }

        const parsed = parseResult.data as z.infer<typeof securityUserUpdateSchema>;

        const updateData: z.infer<typeof oldSecurityUserUpdateSchema>  = {
          UserID: parsed.UserID,
          UserName: parsed.UserName || undefined,
          DisplayName: parsed.DisplayName || undefined,
          Status: parsed.Status || undefined,
        }

        if(parsed.password) {
          updateData.EncryptedPassword = await bcrypt.hash(parsed.password, 10);
        }

        if(parsed.RoleID) {
          updateData.RoleID = convertNewRoleToOldRole(parsed.RoleID) || undefined;
        }

        const updatedUser = await prisma.security_users.update({
          where: { UserID: id },
          data: updateData,
          select: securityUserSelect
        }) as VSUserWithRoles;
        const newUser = await convertToNewUser(updatedUser, activeContactId);
        res.status(200).json({data: newUser || undefined});
      } catch (e) {
        console.error("Error updating security user:", e);
        res.status(500).json({error: "Error updating security user"});
      }
      break;
    }
    case "DELETE": {
      try {
        await prisma.security_users.delete({
          where: { UserID: id }
        });
        res.status(200).json({});
      } catch (e) {
        console.error("Error deleting security user:", e);
        res.status(500).json({error: "Error deleting security user"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"});
    }
  }
} 