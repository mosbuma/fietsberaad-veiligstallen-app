import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {

  let where = {
    Status: '1'
  }
  if(req.query.cbsCode) where.Gemeentecode = Number(req.query.cbsCode);
  if(req.query.urlName) where.UrlName = req.query.urlName;
  if(req.query.itemType) where.ItemType = req.query.itemType;

  const queryRequest = {
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
  }

  const result = await prisma.contacts.findMany(queryRequest);
  res.json(result);
}
