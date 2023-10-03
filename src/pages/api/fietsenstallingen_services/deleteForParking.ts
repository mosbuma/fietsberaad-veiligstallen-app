import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if(! req.query.fietsenstallingId) return;

  const result = await prisma.fietsenstallingen_services.deleteMany({
    where: {
      FietsenstallingID: req.query.fietsenstallingId
    }
  });
  res.json(result)
}
