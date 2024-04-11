import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const query: Prisma.fietstypenFindManyArgs = {
    select: {
      ID: true,
      Name: true,
      naamenkelvoud: true
    },
    orderBy: [
      {
        Name: 'asc',
      },
    ],
  }

  const result = await prisma.fietstypen.findMany(query);
  res.json(result)
}
