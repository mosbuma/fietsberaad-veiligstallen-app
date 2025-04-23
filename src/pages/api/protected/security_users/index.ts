import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSUserWithRoles, securityUserSelect } from "~/types/users";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { validateUserSession, generateID } from "~/utils/server/database-tools";
import bcrypt from "bcrypt";

// TODO: implement filtering on accessible security_users

export type SecurityUsersResponse = {
  data?: VSUserWithRoles[];
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
  const validationResult = await validateUserSession(session);
  
  if ('error' in validationResult) {
    res.status(validationResult.status).json({error: validationResult.error});
    return;
  }

  const { sites, userId } = validationResult;

  switch (req.method) {
    case "GET": {
      // GET all security users
      const users = await prisma.security_users.findMany({
        // where: {
        //   SiteID: { in: sites }
        // },
        select: securityUserSelect
      }) as VSUserWithRoles[];
      res.status(200).json({data: users});
      break;
    }
    case "POST": {
      try {
        const validationResult = securityUserCreateSchema.safeParse(req.body);
        if (!validationResult.success) {
          console.error("Validation error:", validationResult.error);
          res.status(400).json({ error: "Validation error" });
          return;
        }
        const parsed = validationResult.data;
        console.log(">>> security_user data parsed", parsed);
        
        // Generate a new UserID
        const newUserID = generateID();
        console.log(">>> security_user data parsed", parsed);
        
        // Hash the password
        const hashedPassword = await bcrypt.hash(parsed.Password, 10);
        
        const newUser = await prisma.security_users.create({
          data: {
            UserID: newUserID,
            UserName: parsed.UserName,
            DisplayName: parsed.DisplayName,
            RoleID: parsed.RoleID,
            GroupID: parsed.GroupID,
            Status: parsed.Status ?? "1",
            EncryptedPassword: hashedPassword,
            SiteID: sites[0] // Use the first site as default
          },
          select: securityUserSelect
        }) as VSUserWithRoles;

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