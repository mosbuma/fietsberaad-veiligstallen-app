import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSContactGemeente, gemeenteSelect } from "~/types/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { validateUserSession } from "~/utils/server/database-tools";
import { gemeenteSchema } from "~/types/database";

export type GemeenteResponse = {
  data?: VSContactGemeente;
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({error: "Unauthorized - no session found"}); // Unauthorized
    return;
  }

  const validationResult = await validateUserSession(session);
  if ('error' in validationResult) {
    res.status(401).json({error: validationResult.error}); // Unauthorized
    return;
  }

  const id = req.query.id as string;
  if (!validationResult.sites.includes(id)) {
    res.status(403).json({ error: "No access to this organization" });
    return;
  }

  switch (req.method) {
    case "GET": {
      if (id === "new") {
        // Return a template for a new organization
        res.status(200).json({data: {
          ...gemeenteSchema.shape,
          ItemType: "organizations"
        }});
      }

      const gemeente = (await prisma.contacts.findFirst({
        where: {
          ID: id,
          ItemType: "organizations",
        },
        select: gemeenteSelect
      })) as unknown as VSContactGemeente;
      res.status(200).json({data: gemeente});
      break;
    }
    case "PUT": {
      try {
        const validationResult = gemeenteSchema.partial().safeParse(req.body);
        if (!validationResult.success) {
          console.error("Validation error:", validationResult.error);
          res.status(400).json({error: "Validation error"});
          return;
        }

        const parsed = validationResult.data;
        const updatedOrg = await prisma.contacts.update({
          select: gemeenteSelect,
          where: { ID: id },
          data: {
            CompanyName: parsed.CompanyName,
            ItemType: "organizations",
            AlternativeCompanyName: parsed.AlternativeCompanyName ?? undefined,
            UrlName: parsed.UrlName ?? undefined,
            ZipID: parsed.ZipID ?? undefined,
            Helpdesk: parsed.Helpdesk ?? undefined,
            CompanyLogo: parsed.CompanyLogo ?? undefined,
            CompanyLogo2: parsed.CompanyLogo2 ?? undefined,
            ThemeColor1: parsed.ThemeColor1 ?? undefined,
            ThemeColor2: parsed.ThemeColor2 ?? undefined,
            DayBeginsAt: parsed.DayBeginsAt ? new Date(parsed.DayBeginsAt) : undefined,
            Coordinaten: parsed.Coordinaten ?? undefined,
            Zoom: parsed.Zoom ?? undefined,
            Bankrekeningnr: parsed.Bankrekeningnr ?? undefined,
            PlaatsBank: parsed.PlaatsBank ?? undefined,
            Tnv: parsed.Tnv ?? undefined,
            Notes: parsed.Notes ?? undefined,
            DateRegistration: parsed.DateRegistration === null ? null : parsed.DateRegistration ? new Date(parsed.DateRegistration) : undefined,
            DateConfirmed: parsed.DateConfirmed === null ? null : parsed.DateConfirmed ? new Date(parsed.DateConfirmed) : undefined,
            DateRejected: parsed.DateRejected === null ? null : parsed.DateRejected ? new Date(parsed.DateRejected) : undefined,
          }
        });
        res.status(200).json({data: updatedOrg});
      } catch (e) {
        if (e instanceof z.ZodError) {
          console.error("Validation error:", e.errors);
          res.status(400).json({error: "Validation error"});
        } else {
          res.status(500).json({error: "Error updating gemeente"});
        }
      }
      break;
    }
    case "DELETE": {
      try {
        await prisma.contacts.delete({
          where: { ID: id }
        });
        res.status(200).json({});
      } catch (e) {
        console.error("Error deleting gemeente:", e);
        res.status(500).json({error: "Error deleting gemeente"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}