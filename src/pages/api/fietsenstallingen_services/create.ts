import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if((req.method as HttpMethod) !== "POST") return;

  const data = req.body as T;
  console.log('data', data)
  const createManyResponse = await prisma.fietsenstallingen_services.createMany({
    data: data
  });

  res.json(createManyResponse)
}
