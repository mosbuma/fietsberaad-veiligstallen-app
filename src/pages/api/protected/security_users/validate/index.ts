import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSUserWithRolesNew, securityUserSelectNew } from "~/types/users";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession } from "~/utils/server/database-tools";
import { securityuserSchema } from "~/types/database";

export type SecurityUserValidateResponse = {
  valid: boolean;
  message: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    console.error("Niet geautoriseerd - geen sessie gevonden");
    res.status(401).json({valid: false, error: "Niet geautoriseerd - geen sessie gevonden"}); // Unauthorized
    return;
  }

  const validateUserSessionResult = await validateUserSession(session, "organizations");
  if ('error' in validateUserSessionResult) {
    console.error("Niet geautoriseerd - ongeldige sessie", validateUserSessionResult.error);
    res.status(401).json({valid: false, error: validateUserSessionResult.error}); // Unauthorized
    return;
  }

  // get id from the query params and the data from the body
  const data = req.body as VSUserWithRolesNew | undefined;
  if(!data) {
    console.error("Geen data opgegeven");
    res.status(400).json({valid: false, message: "Geen data opgegeven"});
    return;
  }

  if(!data.UserID) {
    console.error("Geen user id opgegeven");
    res.status(200).json({valid: false, message: "Geen id opgegeven"});
    return;
  }

  if (!validateUserSessionResult.sites.includes(data.UserID) && data.UserID !== "new") {
    console.error("Geen toegang tot deze organisatie", data.UserID);
    res.status(403).json({ valid: false, error: "Geen toegang tot deze organisatie" });
    return;
  }

  switch (req.method) {
    case "POST": {
      // check data against zod schema
      let parseResult;
      const isNew = data.UserID === "new";
      if(isNew) {
        parseResult = securityuserSchema.omit({UserID: true}).safeParse(data); // will be set later
      } else {
        parseResult = securityuserSchema.safeParse(data);
      }

      if (!parseResult.success) {
        res.status(200).json({valid: false, message: parseResult.error.issues.map(e => e.message).join(", ")});
        return;
      }

      const uniqueFields = [
        {field: "UserName" as const, message: "Er bestaat al een gebruiker met deze email"},
      ];

      const oldValues = !isNew ? await prisma.security_users.findUnique({
        where: {
          UserID: data.UserID,
        },
          select: securityUserSelectNew
      }) : undefined;

      for(const field of uniqueFields) {
        const isChanged = oldValues && (oldValues[field.field] !== data[field.field]);
        // check if the field value has changed
        if(isNew || isChanged) {
          const duplicate = await prisma.security_users.findFirst({
            where: {
              [field.field]: data[field.field],
            },
          });

          if(duplicate) {
            res.status(200).json({valid: false, message: field.message});
            return;
          }      
        }
      }

      res.status(200).json({valid: true, message: ""});
      break;
    }
   default: {
      res.status(405).json({valid: false, message: "Deze methode is niet toegestaan"}); // Method Not Allowed
    }
  }
}