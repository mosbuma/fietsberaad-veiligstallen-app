import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { fietstypenSelect, VSFietstype } from "~/types/fietstypen";  

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const query: Prisma.fietstypenFindManyArgs = {
    select: fietstypenSelect,
    orderBy: [
      {
        Name: 'asc',
      },
    ],
  }

  const result = await prisma.fietstypen.findMany(query);
  res.json(result as VSFietstype[])
}
