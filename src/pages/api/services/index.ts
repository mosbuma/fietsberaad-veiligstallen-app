import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  const query = {
    select: {
      ID: true,
      Name: true,
    },
    orderBy: [
        {
            Name: 'asc',
        },
    ],
  }

  const result = await prisma.services.findMany(query);
  res.json(result)
}
