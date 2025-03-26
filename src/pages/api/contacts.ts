import type { NextApiRequest, NextApiResponse } from "next";
import { CrudRouteHandler } from "~/backend/handlers/crud-route-handler";
import ContactsService from "~/backend/services/contacts-service";
import { prisma } from "~/server/db";
import { gemeenteSelect } from "~/types/contacts";
// import { authOptions } from './auth/[...nextauth]'
// import { getServerSession } from "next-auth/next"


export default async (request: NextApiRequest, response: NextApiResponse) => {
  // const session = await getServerSession(request, response, authOptions)

  // // console.log("#### create stalling - get session");
  // if (session && session.user) {
  //   // console.log("#### create stalling while logged in");
  //   // console.log(`#### req ${JSON.stringify(Object.keys(request), null, 2)}`);
  // } else {
  //   console.log("#### create stalling while not logged in");
  // }
  console.log("/api/contacts", request.query);
  switch (request.method) {
    case "GET": {
      console.log("#### GET", request.query);
      const queryparams = request.query;
      if (queryparams.cbsCode) {
        const cbsCode = queryparams.cbsCode as string;
        const municipality = await prisma.contacts.findFirst({
          where: {
            Gemeentecode: Number(cbsCode)
          },
          select: gemeenteSelect
        });
        response.status(200).json([municipality]);
      }
      else if (queryparams.urlName) {
        const urlName = queryparams.urlName as string;
        const municipality = await prisma.contacts.findFirst({
          where: {
            UrlName: urlName
          },
          select: gemeenteSelect
        });
        response.status(200).json([municipality]);
      }
      else if (queryparams.ID) {
        const ID = queryparams.ID as string;
        const municipality = await prisma.contacts.findFirst({
          where: {
            ID: ID
          },
          select: gemeenteSelect
        });
        response.status(200).json(municipality);
      }

      console.log("GET", queryparams);
      break;
    }
    default: {// not implemented
      response.status(405).json({ error: 'Method not implemented' });
      break;
    }
  }

  await CrudRouteHandler(request, response, ContactsService);
};
