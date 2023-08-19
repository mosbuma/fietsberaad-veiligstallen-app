import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if(! req.query.cbsCode) return;

  const municipality = await prisma.contacts.findFirst({
    where: {
      Gemeentecode: Number(req.query.cbsCode)
    },
    select: {
      CompanyName: true,
      ThemeColor1: true,
      ThemeColor2: true,
      UrlName: true,
    }
  });
  res.json(municipality)
}
