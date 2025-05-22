import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSContactGemeente, type VSContactGemeenteInLijst, gemeenteSelect, gemeenteLijstSelect } from "~/types/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession } from "~/utils/server/database-tools";

export type GemeentenResponse = {
  data?: VSContactGemeente[] | VSContactGemeenteInLijst[];
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const validateUserSessionResult = await validateUserSession(session, "organizations");
  
  if ('error' in validateUserSessionResult) {
    res.status(validateUserSessionResult.status).json({exploitanten: []});
    return;
  }

  const { sites } = validateUserSessionResult;

  switch (req.method) {
    case "GET": {
      // Check if compact mode is requested
      const compact = req.query.compact === 'true';
      
      // GET all organizations user can access
      const gemeenten = (await prisma.contacts.findMany({
        where: {
          ItemType: "organizations",
          ID: { in: sites }
        },
        select: compact ? gemeenteLijstSelect : gemeenteSelect
      })) as VSContactGemeente[];

      if(compact) {
        const data: VSContactGemeenteInLijst[] = [];

        // Get all SiteIDs that have users in a single query
        const sitesWithUsers = await prisma.security_users.findMany({
          where: {
            security_users_sites: {
              some: {
                SiteID: {
                  in: gemeenten.map(g => g.ID)
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

        for(const gemeente of gemeenten) {
          const numNietSysteemStallingen = 
            (gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts?.
            filter((stalling) => stalling.Title !== 'Systeemstalling').length) || 0;

          const hasUsers = siteIdsWithUsers.has(gemeente.ID);
          const hasExploitanten = (gemeente.isManagedByContacts?.length || 0) > 0;
          
          data.push({
            ID: gemeente.ID,
            CompanyName: gemeente.CompanyName,
            hasStallingen: numNietSysteemStallingen > 0,
            hasUsers,
            hasExploitanten
          })
        };
        res.status(200).json({data})
      } else {
        res.status(200).json({data: gemeenten})
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}