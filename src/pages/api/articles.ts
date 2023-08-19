import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  const articles = await prisma.articles.findMany({
    where: {
      Status: "1"
    },
    select: {
      Title: true,
      DisplayTitle: true,
      Abstract: true,
      Article: true,
      CustomField1_Title: true,
      CustomField1: true,
      SortOrder: true,
      ShowInNav: true,
      ModuleID: true
    }
  });
  res.json(articles)
}
