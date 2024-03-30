import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    let parking = undefined;
    if (undefined !== req.query.stallingid && true !== Array.isArray(req.query.stallingid)) {
      const query = {
        where: { ID: req.query.stallingId as string }, // Cast the ID to string
      }

      parking = await prisma.fietsenstallingen.findFirst(query);
      res.json(parking)
    } else {
      res.status(405).end() // Method Not Allowed
    }
  } else {
    res.status(405).end() // Method Not Allowed
  }
}
