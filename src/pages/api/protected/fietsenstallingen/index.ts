import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSFietsenstalling, type VSFietsenstallingLijst, fietsenstallingSelect, fietsenstallingLijstSelect } from "~/types/fietsenstallingen";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession } from "~/utils/server/database-tools";

export type FietsenstallingenResponse = {
  data?: VSFietsenstalling[] | VSFietsenstallingLijst[];
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const validationResult = await validateUserSession(session, "any");
  
  if ('error' in validationResult) {
    res.status(validationResult.status).json({error: validationResult.error});
    return;
  }

  const { sites } = validationResult;

  switch (req.method) {
    case "GET": {
      // Check if compact mode is requested
      const compact = req.query.compact === 'true';
      
      // GET all fietsenstallingen user can access
      const fietsenstallingen = (await prisma.fietsenstallingen.findMany({
        where: {
          ID: { in: sites }
        },
        select: compact ? fietsenstallingLijstSelect : fietsenstallingSelect
      })) as unknown as (VSFietsenstalling[] | VSFietsenstallingLijst[]);
      
      res.status(200).json({data: fietsenstallingen});
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}