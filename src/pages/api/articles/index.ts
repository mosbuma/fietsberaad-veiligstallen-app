import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.SiteID && Array.isArray(req.query.SiteID)) return;
  if (req.query.Title && Array.isArray(req.query.Title)) return;
  if (req.query.Navigation && Array.isArray(req.query.Navigation)) return;

  const where: Prisma.articlesWhereInput = {
    Status: "1"
  }

  if (req.query.SiteID) {
    where.OR = [
      { SiteID: req.query.SiteID },
      { SiteID: "1" }// 1 = Default site / menu items
    ]
  }
  if (req.query.Title) {
    where.Title = {
      equals: req.query.Title,
    }
  }
  if (req.query.Navigation) {
    where.Navigation = req.query.Navigation;
  }

  const query: Prisma.articlesFindFirstArgs = {
    where,
    select: {
      ID: true,
      SiteID: true,
      Title: true,
      DisplayTitle: true,
      DateCreated: true,
      DateModified: true,
      Abstract: true,
      Article: true,
      CustomField1_Title: true,
      CustomField1: true,
      SortOrder: true,
      ShowInNav: true,
      ModuleID: true,
      Navigation: true
    },
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
