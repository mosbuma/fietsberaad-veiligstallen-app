import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.cbsCode && Array.isArray(req.query.cbsCode) ||
    req.query.urlName && Array.isArray(req.query.urlName) ||
    req.query.itemType && Array.isArray(req.query.itemType)) {
    res.status(400).json({});
    return;
  }

  let where: Prisma.contactsWhereInput = {
    Status: '1'
  }
  if (req.query.cbsCode) where.Gemeentecode = Number(req.query.cbsCode);
  if (req.query.urlName) where.UrlName = req.query.urlName;
  if (req.query.itemType) where.ItemType = req.query.itemType;

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
