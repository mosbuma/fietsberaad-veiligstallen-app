import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if(! req.query.cbsCode) return;

  const municipality = await prisma.contacts.findFirst({
    where: {
      Gemeentecode: Number(req.query.cbsCode)
    },
    select: {
      ID: true,
      CompanyName: true,
      ThemeColor1: true,
      ThemeColor2: true,
      UrlName: true,
      CompanyLogo: true,
      CompanyLogo2: true
    }
  });
  res.json(municipality)
}
