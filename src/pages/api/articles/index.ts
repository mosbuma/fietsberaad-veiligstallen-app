import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  const where = {
    Status: "1"
  }

  if(req.query.SiteID) {
    where.SiteID = req.query.SiteID;
  }
  if(req.query.Title) {
    where.Title = {
      equals: req.query.Title,
    }
  }

  const query = {
    where: where,
    select: {
      SiteID: true,
      Title: true,
      DisplayTitle: true,
      Abstract: true,
      Article: true,
      CustomField1_Title: true,
      CustomField1: true,
      SortOrder: true,
      ShowInNav: true,
      ModuleID: true
    },
    orderBy: [
      {
        SiteID: 'asc',
      },
      {
        SortOrder: 'asc',
      },
    ],
  }

  let result;
  if(req.query.options && req.query.findFirst) {
    result = await prisma.articles.findFirst(query);
  }
  else {
    result = await prisma.articles.findMany(query);
  }
  res.json(result)
}
