import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSContactGemeente, gemeenteSelect } from "~/types/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { gemeenteCreateSchema, gemeenteSchema } from "~/types/database";
import { generateID, validateUserSession } from "~/utils/server/database-tools";

// TODO: handle adding the gemeente to the user's sites and setting correct rights
// TODO: check if user has sufficient rights to create an gemeente

// export type GemeentenResponse = VSContactGemeente[];
export type GemeentenResponse = {
  data?: VSContactGemeente[];
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const validationResult = await validateUserSession(session);
  
  if ('error' in validationResult) {
    res.status(validationResult.status).json({exploitanten: []});
    return;
  }

  const { sites, userId } = validationResult;

  switch (req.method) {
    case "GET": {
      // GET all organizations user can access
      const gemeenten = (await prisma.contacts.findMany({
        where: {
          ItemType: "organizations",
          ID: { in: sites }
        },
        select: gemeenteSelect
      })) as unknown as VSContactGemeente[];
      res.status(200).json({data: gemeenten});
      break;
    }
    case "POST": {
      try {
        const newID = generateID();
        const data = { ...req.body, ID: newID };

        const validationResult = gemeenteCreateSchema.safeParse(data);
        if (!validationResult.success) {
          console.error("Validation error:", JSON.stringify(validationResult.error.errors,null,2));
          res.status(400).json({ error: validationResult.error.errors });
          return;
        }
        const parsed = validationResult.data;
        
        const newData = {
          ID: newID,
          // Required fields
          ItemType: "organizations",
          CompanyName: parsed.CompanyName,
          Status: "1", // Default status
            
          // Optional fields with defaults
          AlternativeCompanyName: parsed.AlternativeCompanyName ?? undefined,
          UrlName: parsed.UrlName ?? undefined,
          ZipID: parsed.ZipID ?? undefined,
          Helpdesk: parsed.Helpdesk ?? undefined,
          CompanyLogo: parsed.CompanyLogo ?? undefined,
          CompanyLogo2: parsed.CompanyLogo2 ?? undefined,
          ThemeColor1: parsed.ThemeColor1 ?? "1f99d2", // Default theme color
          ThemeColor2: parsed.ThemeColor2 ?? "96c11f", // Default theme color
          DayBeginsAt: parsed.DayBeginsAt ?? new Date("00:00:00"), // Default day begins at
          Coordinaten: parsed.Coordinaten ?? undefined,
          Zoom: parsed.Zoom ?? 12, // Default zoom level
          Bankrekeningnr: parsed.Bankrekeningnr ?? undefined,
          PlaatsBank: parsed.PlaatsBank ?? undefined,
          Tnv: parsed.Tnv ?? undefined,
          Notes: parsed.Notes ?? undefined,
          DateRegistration: parsed.DateRegistration ?? undefined,
        }

        const newOrg = await prisma.contacts.create({data: newData, select: gemeenteSelect}) as unknown as VSContactGemeente;
        if(!newOrg) {
          console.error("Error creating new gemeente:", newData);
          res.status(500).json({error: "Error creating new gemeente"});
          return;
        }

        // add a record to the security_users_sites table that links the new gemeente to the user's sites
        const newLink = await prisma.security_users_sites.create({
          data: {
            UserID: userId,
            SiteID: newOrg.ID
          }
        });
        if(!newLink) {
          console.error("Error creating link to new gemeente:", newOrg.ID);
          res.status(500).json({error: "Error creating link to new gemeente"});
          return;
        }

        res.status(201).json({ data: [newOrg]});
      } catch (e) {
        console.error("Error creating gemeente:", e);
        res.status(500).json({error: "Error creating gemeente"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}