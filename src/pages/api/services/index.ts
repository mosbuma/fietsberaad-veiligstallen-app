import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { servicesSelect, VSservice } from "~/types/services";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const query: Prisma.servicesFindManyArgs = {
    select: servicesSelect,
    orderBy: [
      {
        Name: 'asc',
      },
    ],
  }

  const result = await prisma.services.findMany(query);
  res.json(result as VSservice[])
}
