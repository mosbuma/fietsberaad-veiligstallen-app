import { Prisma } from "~/generated/prisma-client";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { articleSelect } from "~/types/articles";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.SiteID && Array.isArray(req.query.SiteID)) return;
  if (req.query.Title && Array.isArray(req.query.Title)) return;
  if (req.query.Navigation && Array.isArray(req.query.Navigation)) return;

  // For now, only veiligstallen is supported
  const where: Prisma.articlesWhereInput = {
    ModuleID: "veiligstallen"
  }

  if (req.query.SiteID) {
    where.SiteID = req.query.SiteID as string;
  }
  if (req.query.Title) {
    where.Title = req.query.Title as string
  }
  if (req.query.Navigation) {
    where.Navigation = req.query.Navigation;
  }

  const query: Prisma.articlesFindFirstArgs = {
    where,
    select: articleSelect,
    orderBy: {
      SortOrder: 'asc',
    }
  }

  let result;
  if (req.query.options && req.query.findFirst) {
    result = await prisma.articles.findFirst(query);
  }
  else {
    result = await prisma.articles.findMany(query);
  }
  res.json(result)
}
