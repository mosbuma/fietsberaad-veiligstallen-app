import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {

  let where = {}
  if(req.query.cbsCode) where.Gemeentecode = Number(req.query.cbsCode);
  if(req.query.urlName) where.UrlName = req.query.urlName;

  const municipality = await prisma.contacts.findFirst({
    where: where,
    select: {
      ID: true,
      CompanyName: true,
      ThemeColor1: true,
      ThemeColor2: true,
      UrlName: true,
      CompanyLogo: true,
      CompanyLogo2: true,
      Coordinaten: true
    }
  });
  res.json(municipality)
}
