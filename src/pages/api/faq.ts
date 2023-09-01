import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if(! req.query.siteId) return;

  // Get FAQ sections for site
  const queryRequest = {
    where: {
      Status: true,
      SiteID: req.query.siteId
    },
    select: {
      FaqID: true
    }
  }
  const faqsForContact = await prisma.contacts_faq.findMany(queryRequest);

  // Get FAQ section titles
  const faqSections = [];
  for await (const x of faqsForContact) {
    const faqItem = await prisma.faq.findFirst({
      where: {
        ID: x.FaqID,
        Status: '1',
      },
      select: {
        ID: true,
        Title: true,
        Question: true,
        Answer: true,
        SortOrder: true,
        ModuleID: true
      },
      orderBy: {
        SortOrder: { sort: 'asc', nulls: 'last' },
      }
    });
    if(faqItem && faqItem.Title) {
      faqSections.push(faqItem);
    }
  }

  // Get FAQ answers
  const faqFull = [];
  for await (const section of faqSections) {
    const faqQuestionAndAnswers = await prisma.faq.findMany({
      where: {
        ParentID: section.ID,
        Status: '1'
      },
      select: {
        ID: true,
        Question: true,
        Answer: true,
        SortOrder: true,
        ModuleID: true
      },
      orderBy: {
        SortOrder: { sort: 'asc', nulls: 'last' },
      }
    });
    faqFull.push({
      sectionTitle: section.Title,
      q_and_a: faqQuestionAndAnswers || []
    });
  }

  res.json(faqFull);
}
