import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query.fietsenstallingId || Array.isArray(req.query.fietsenstallingId)) return;

  const result = await prisma.fietsenstallingen_services.deleteMany({
    where: {
      FietsenstallingID: req.query.fietsenstallingId
    }
  });
  res.json(result)
}
