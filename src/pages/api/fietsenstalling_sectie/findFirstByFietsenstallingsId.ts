import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query.ID || Array.isArray(req.query.ID)) {
    res.status(400).json({ message: 'ID parameter not found or invalid' });
    return;
  }

  const result = await prisma.fietsenstalling_sectie.findFirst({
    where: {
      fietsenstallingsId: req.query.ID
    }
  });

  res.json(result)
}