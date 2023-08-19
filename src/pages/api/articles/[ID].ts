import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if(! req.query.ID) return;

  const articles = await prisma.articles.findFirst({
    where: {
      ID: req.query.ID,
      Status: "1",
    },
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
