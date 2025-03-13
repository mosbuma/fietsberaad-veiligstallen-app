import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSContactGemeente, gemeenteSelect } from "~/types/contacts";

import { getServerSession, Session } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions) as Session;
  if(!session.user) {
    res.status(401).end(); // Unauthorized
    return;
  }

  const theuser = await prisma.security_users.findUnique({
    where: {
      UserID: session.user.id
    },
    select: {
      security_users_sites: {
        select: {
          SiteID: true
        }
      }
    }
  });

  if(!theuser) {
    res.status(401).end(); // Unauthorized
    return;
  }

  const sites = theuser.security_users_sites.map((site) => site.SiteID);
  switch (req.method) {
    case "GET": {
      if ("id" in req.query) {
        if(!sites.includes(req.query.id as string)) {
          res.status(401).end(); // Unauthorized
          return;
        }

        const id: string = req.query.id as string;
        const gemeente = (await prisma.contacts.findFirst({
          where: {
            ID: id,
            ItemType: "organization",
          },
          select: gemeenteSelect
        })) as unknown as VSContactGemeente;
  
        res.status(200).json(gemeente);
      } else {
        const gemeenten = (await prisma.contacts.findMany({
          where: {
            ItemType: "organization",
            ID: { in: sites }
          },
          select: gemeenteSelect
        })) as unknown as VSContactGemeente[];
      }
      break;
    }
    // case "POST": {
    //   const gemeente = req.body as VSContactGemeente;
    //   const newGemeente = await prisma.contacts.create({
    //     data: {
    //       ...gemeente,
    //       ItemType: "organization",
    //     }
    //   });
    //   res.status(200).json(newGemeente);
    // };
    // case "PUT": {
    //   const gemeente = req.body as VSContactGemeente;
    //   const updatedGemeente = await prisma.contacts.update({
    //     where: {
    //       ID: gemeente.ID,
    //     },
    //     data: {
    //       ...gemeente,
    //       ItemType: "organization",
    //       fietsenstallingen_fietsenstallingen_SiteIDTocontacts: {
    //         update: gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts?.map(stalling => ({
    //           where: { ID: stalling.ID },
    //           data: { /* fields to update */ },
    //         })),
    //       },
    //       modules_contacts: {
    //         update: gemeente.modules_contacts?.map(module => ({
    //           where: { ID: module.module.ID },
    //           data: { /* fields to update */ },
    //         })),
    //       },
    //     }
    //   });
    //   res.status(200).json(updatedGemeente);
    // };
    // case "DELETE": {
    //   res.status(405).end(); // Method Not Allowed
    // };
    default: {
      res.status(405).end(); // Method Not Allowed
    }
  }
}
