import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  const where = {
    Status: "1"
  }
  if(req.query.SiteID) {
    where.SiteID = req.query.SiteID;
  }

  const articles = await prisma.articles.findMany({
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
  });
  res.json(articles)
}
