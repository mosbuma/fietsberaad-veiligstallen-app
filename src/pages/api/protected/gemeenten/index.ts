import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSContactGemeente, type VSContactGemeenteInLijst, gemeenteSelect, gemeenteLijstSelect } from "~/types/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession } from "~/utils/server/database-tools";

export type GemeentenResponse = {
  data?: VSContactGemeente[] | VSContactGemeenteInLijst[];
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const validateUserSessionResult = await validateUserSession(session, "organizations");
  
  if ('error' in validateUserSessionResult) {
    res.status(validateUserSessionResult.status).json({exploitanten: []});
    return;
  }

  const { sites } = validateUserSessionResult;

  switch (req.method) {
    case "GET": {
      // Check if compact mode is requested
      const compact = req.query.compact === 'true';
      
      // GET all organizations user can access
      const gemeenten = (await prisma.contacts.findMany({
        where: {
          ItemType: "organizations",
          ID: { in: sites }
        },
        select: compact ? gemeenteLijstSelect : gemeenteSelect
      })) as unknown as (VSContactGemeente[] | VSContactGemeenteInLijst[]);
      
      res.status(200).json({data: gemeenten});
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}