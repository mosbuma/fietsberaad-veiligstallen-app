import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  const query = {
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
