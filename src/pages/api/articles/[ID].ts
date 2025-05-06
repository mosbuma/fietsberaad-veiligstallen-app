import { prisma } from "~/server/db";
import type { NextApiRequest, NextApiResponse } from "next";
import { articlesSelect } from "~/types/articles";
// import { z } from "zod";

// Define Zod schema for VSArticle
// const articleSchema = z.object({
//   ID: z.string(),
//   SiteID: z.string(),
//   Title: z.string(),
//   DisplayTitle: z.string().nullable(),
//   Article: z.string().nullable(),
//   Abstract: z.string().nullable(),
//   SortOrder: z.string(),
//   ShowInNav: z.string(),
//   Navigation: z.string(),
//   ModuleID: z.string(),
//   Status: z.string(),
//   EditorCreated: z.date().optional(),
//   EditorModified: z.date().optional(),
//   DateCreated: z.date().optional(),
//   DateModified: z.date().optional()
// });

// Partial schema for PATCH operations
//const articlePatchSchema = articleSchema.partial().omit({ ID: true });

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query.ID || Array.isArray(req.query.ID)) {
    return res.status(400).json({ error: "Invalid ID parameter" });
  }

  const articleId = req.query.ID;

  try {
    switch (req.method) {
      case "GET":
        console.debug("#### GET articleId", articleId);
        // Get Method is available for all users
        return await handleGet(articleId, res);
      // TODO: implement and test 
      // case "PUT":
      //   return await handlePut(articleId, req, res);
      // case "PATCH":
      //   return await handlePatch(articleId, req, res);
      // case "DELETE":
      //   return await handleDelete(articleId, res);
      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function handleGet(articleId: string, res: NextApiResponse) {
  const article = await prisma.articles.findFirst({
    where: { 
      ID: articleId, 
      Status: "1" 
    },
    select: articlesSelect,
    orderBy: [
      { SiteID: 'asc' },
      { SortOrder: 'asc' },
    ],
  });

  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  return res.json(article);
}

// async function handlePut(articleId: string, req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const validatedData = articleSchema.parse({
//       ...req.body,
//       ID: articleId
//     });

//     const updatedArticle = await prisma.articles.update({
//       where: { ID: articleId },
//       data: {
//         ...validatedData,
//         // EditorModified: new Date()
//       },
//       select: articlesSelect
//     });

//     return res.json(updatedArticle);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: "Unexpected/missing data error:", details: error.errors });
//     }
//     throw error;
//   }
// }

// async function handlePatch(articleId: string, req: NextApiRequest, res: NextApiResponse) {
//   try {
//     const validatedData = articlePatchSchema.parse(req.body);

//     const updatedArticle = await prisma.articles.update({
//       where: { ID: articleId },
//       data: {
//         ...validatedData,
//         EditorModified: new Date()
//       },
//       select: articlesSelect
//     });

//     return res.json(updatedArticle);
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       return res.status(400).json({ error: "Unexpected/missing data error:", details: error.errors });
//     }
//     throw error;
//   }
// }

// async function handleDelete(articleId: string, res: NextApiResponse) {
//   const article = await prisma.articles.delete({
//     where: { ID: articleId },
//     select: articlesSelect
//   });

//   if (!article) {
//     return res.status(404).json({ error: "Article not found" });
//   }

//   return res.status(204).end();
// }
