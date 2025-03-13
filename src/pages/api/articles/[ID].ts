import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { articlesSelect } from "~/types/articles";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query.ID || Array.isArray(req.query.ID)) return;

  const articles = await prisma.articles.findFirst({
    where: {
      ID: req.query.ID,
      Status: "1",
    },
    select: articlesSelect,
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
