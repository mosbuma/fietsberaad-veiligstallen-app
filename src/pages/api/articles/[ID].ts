import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query.ID || Array.isArray(req.query.ID)) return;

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
