import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSContact, type VSContactInLijst, VSContactItemType, contactSelect, contactLijstSelect } from "~/types/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession } from "~/utils/server/database-tools";
import { contactSchema } from "~/types/database";
import { ZodError } from "zod";

export type ContactsResponse = {
  data?: VSContact[] | VSContactInLijst[];
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const validateUserSessionResult = await validateUserSession(session, "contacts");
  
  if ('error' in validateUserSessionResult) {
    res.status(validateUserSessionResult.status).json({contacts: []});
    return;
  }

  const { sites } = validateUserSessionResult;

  switch (req.method) {
    case "GET": {
      // Check if compact mode is requested
      const compact = req.query.compact === 'true';
      
      // GET all contacts user can access
      const contacts = (await prisma.contacts.findMany({
        where: {
          ItemType: VSContactItemType.Organizations,
          ID: { in: sites }
        },
        select: compact ? contactLijstSelect : contactSelect
      })) as VSContact[];

      if(compact) {
        const data: VSContactInLijst[] = [];

        // Get all SiteIDs that have users in a single query
        const sitesWithUsers = await prisma.security_users.findMany({
          where: {
            security_users_sites: {
              some: {
                SiteID: {
                  in: contacts.map(c => c.ID)
                }
              }
            }
          },
          select: {
            security_users_sites: {
              select: {
                SiteID: true
              }
            }
          }
        });

        // Create a Set of SiteIDs for O(1) lookup
        const siteIdsWithUsers = new Set(
          sitesWithUsers.flatMap(user => 
            user.security_users_sites.map(site => site.SiteID)
          )
        );

        for(const contact of contacts) {
          const hasUsers = siteIdsWithUsers.has(contact.ID);
          const hasStallingen = (contact.managesFietsenstallingen?.length || 0) > 0;
          
          data.push({
            ID: contact.ID,
            FirstName: contact.FirstName,
            LastName: contact.LastName,
            Email1: contact.Email1,
            Phone1: contact.Phone1,
            hasUsers,
            hasStallingen
          })
        };
        res.status(200).json({data})
      } else {
        res.status(200).json({data: contacts})
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
} 