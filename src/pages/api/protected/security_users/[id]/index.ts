import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSUserWithRoles, type VSUserWithRolesNew, securityUserSelect } from "~/types/users";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { generateID, validateUserSession } from "~/utils/server/database-tools";
import bcrypt from "bcrypt";
import { convertToNewUser } from "~/pages/api/protected/security_users/index";
// TODO: implement filtering on accessible security_users

export type SecurityUserResponse = {
  data?: VSUserWithRolesNew;
  error?: string;
};

const securityUserUpdateSchema = z.object({
  UserName: z.string().min(1).optional(),
  DisplayName: z.string().min(1).optional(),
  NewRoleID: z.number().optional(),
  Status: z.string().optional(),
  SiteID: z.string().optional(),
});

const securityUserCreateSchema = z.object({
  UserName: z.string().min(1),
  DisplayName: z.string().min(1),
  NewRoleID: z.number(),
  Status: z.string().optional(),
  SiteID: z.string().optional(),
});

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

  console.log(">>> security_users/[id] id", id);

  switch (req.method) {
    case "GET": {
      console.log("GET", id);
      const user = await prisma.security_users.findFirst({
        where: {
          UserID: id,
        },
        select: securityUserSelect
      }) as VSUserWithRoles;
      const newUser = await convertToNewUser(user);
      res.status(200).json({data: newUser});
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
        // const hashedPassword = await bcrypt.hash(parsed.Password, 10);
        
        const createdUser = await prisma.security_users.create({
          data: {
            UserID: newUserID,
            UserName: parsed.UserName,
            DisplayName: parsed.DisplayName,
            RoleID: parsed.RoleID,
            GroupID: parsed.GroupID,
            Status: parsed.Status ?? "1",
            // EncryptedPassword: hashedPassword,
            SiteID: session.user.SiteID 
          },
          select: securityUserSelect
        }) as VSUserWithRoles;

        const newUser = await convertToNewUser(createdUser);

        res.status(201).json({ data: newUser });
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

        const parsed = parseResult.data;
        const updateData: any = {
          UserName: parsed.UserName,
          DisplayName: parsed.DisplayName,
          RoleID: parsed.RoleID,
          GroupID: parsed.GroupID,
          Status: parsed.Status,
        };

        // Only update password if provided
        if (parsed.Password) {
          updateData.EncryptedPassword = await bcrypt.hash(parsed.Password, 10);
        }

        const updatedUser = await prisma.security_users.update({
          where: { UserID: id },
          data: updateData,
          select: securityUserSelect
        }) as VSUserWithRoles;
        const newUser = await convertToNewUser(updatedUser);
        res.status(200).json({data: newUser});
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