import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSArticle, type VSArticleInLijst, articleSelect, articleLijstSelect } from "~/types/articles";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession } from "~/utils/server/database-tools";

// TODO: handle adding the article to the user's sites and setting correct rights
// TODO: check if user has sufficient rights to create an article

// export type FietsenstallingenResponse = VSFietsenstalling[];
export type ArticlesResponse = {
  data?: VSArticle[] | VSArticleInLijst[];
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const validateUserSessionResult = await validateUserSession(session, "articles");
  
  if ('error' in validateUserSessionResult) {
    res.status(validateUserSessionResult.status).json({articles: []});
    return;
  }

  const { sites } = validateUserSessionResult;

  switch (req.method) {
    case "GET": {
      // Check if compact mode is requested
      const compact = req.query.compact === 'true';
      
      // GET all articles user can access
      const articles = (await prisma.articles.findMany({
        where: {
          SiteID: { in: sites }
        },
        select: compact ? articleLijstSelect : articleSelect
      })) as unknown as (VSArticle[] | VSArticleInLijst[]);
      
      res.status(200).json({data: articles});
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}