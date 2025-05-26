import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { generateID, validateUserSession, updateSecurityProfile } from "~/utils/server/database-tools";
import { type VSFAQ } from "~/types/faq";

// Schema for creating a new FAQ
const faqCreateSchema = z.object({
  ParentID: z.string(),
  Question: z.string(),
  Answer: z.string(),
  SiteID: z.string().optional(),
  SortOrder: z.number().optional(),
  Status: z.string().optional(),
  ModuleID: z.string().nullable(),
});

// Schema for updating an FAQ
const faqSchema = z.object({
  ParentID: z.string().optional(),
  Question: z.string().optional(),
  Answer: z.string().optional(),
  SortOrder: z.number().optional(),
  Status: z.string().optional(),
  ModuleID: z.string().nullable(),
});

export type FaqResponse = {
  data?: VSFAQ;
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    console.error("Unauthorized - no session found");
    res.status(401).json({error: "Niet ingelogd - geen sessie gevonden"}); // Unauthorized
    return;
  }

  const validateUserSessionResult = await validateUserSession(session, "faqs");
  if ('error' in validateUserSessionResult) {
    console.error("Unauthorized - invalid session", validateUserSessionResult.error);
    res.status(401).json({error: validateUserSessionResult.error}); // Unauthorized
    return;
  }

  const { sites, userId } = validateUserSessionResult;

  const id = req.query.id as string;

  switch (req.method) {
    case "GET": {
      if (id === "new") {
        // Return default new FAQ
        const defaultRecord: VSFAQ = {
          ID: '',
          ParentID: '',
          Question: '',
          Answer: '',
          SortOrder: null,
          Status: '1',
          ModuleID: null,
          Title: null
        };
        res.status(200).json({data: defaultRecord});
        return;
      }

      const faq = await prisma.faq.findFirst({
        where: {
          ID: id,
        }
      }) as unknown as VSFAQ;
      res.status(200).json({data: faq});
      break;
    }
    case "POST": {
      try {
        const newID = generateID();
        const data = { ...req.body, ID: newID };

        const parseResult = faqCreateSchema.safeParse(data);
        if (!parseResult.success) {
          console.error("Invalid or missing data:", JSON.stringify(parseResult.error.errors,null,2));
          res.status(400).json({ error: parseResult.error.errors });
          return;
        }
        const parsed = parseResult.data;

        const newData = {
          ID: newID,
          ParentID: parsed.ParentID,
          Question: parsed.Question,
          Answer: parsed.Answer,
          Status: parsed.Status || "1",
          ModuleID: parsed.ModuleID || null,
          SortOrder: parsed.SortOrder,
          SiteID: parsed.SiteID,
        }

        const newFaq = await prisma.faq.create({data: newData}) as unknown as VSFAQ;
        if(!newFaq) {
          console.error("Error creating new FAQ:", newData);
          res.status(500).json({error: "Error creating new FAQ"});
          return;
        }

        // add a record to the security_users_sites table that links the new FAQ to the user's sites
        const newLink = await prisma.security_users_sites.create({
          data: {
            UserID: userId,
            SiteID: newFaq.ID,
            IsContact: false
          }
        });
        if(!newLink) {
          console.error("Error creating link to new FAQ:", newFaq.ID);
          res.status(500).json({error: "Error creating link to new FAQ"});
          return;
        }

        // Update security profile
        const { session: updatedSession, error: profileError } = await updateSecurityProfile(session, userId);
        if (profileError) {
          console.error("Error updating security profile:", profileError);
          res.status(500).json({error: profileError});
          return;
        }

        res.status(201).json({ 
          data: newFaq,
          session: updatedSession
        });
      } catch (e) {
        console.error("Error creating FAQ:", e);
        res.status(500).json({error: "Error creating FAQ"});
      }
      break;
    }
    case "PUT": {
      try {
        const parseResult = faqSchema.safeParse(req.body);
        if (!parseResult.success) {
          console.error("Unexpected/missing data error:", parseResult.error);
          res.status(400).json({error: "Invalid or missing data"});
          return;
        }

        const parsed = parseResult.data;
        const updatedFaq = await prisma.faq.update({
          where: { ID: id },
          data: {
            ParentID: parsed.ParentID,
            Question: parsed.Question,
            Answer: parsed.Answer,
            SortOrder: parsed.SortOrder,
            Status: parsed.Status,
            ModuleID: parsed.ModuleID,
          }
        }) as unknown as VSFAQ;

        res.status(200).json({data: updatedFaq});
      } catch (e) {
        if (e instanceof z.ZodError) {
          console.error("Invalid or missing data:", JSON.stringify(e.errors,null,2));
          res.status(400).json({ error: e.errors });
        } else {
          res.status(500).json({error: "Error updating FAQ"});
        }
      }
      break;
    }
    case "DELETE": {
      try {
        await prisma.faq.delete({
          where: { ID: id }
        });
        res.status(200).json({});
      } catch (e) {
        console.error("Error deleting FAQ:", e);
        res.status(500).json({error: "Error deleting FAQ"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
} 