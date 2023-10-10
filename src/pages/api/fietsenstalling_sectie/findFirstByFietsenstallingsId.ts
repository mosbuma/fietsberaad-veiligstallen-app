import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if(! req.query.ID) return;

  const result = await prisma.fietsenstalling_sectie.findFirst({
    where: {
      fietsenstallingsId: req.query.ID
    }
  });

  res.json(result)
}
