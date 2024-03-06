import type { NextApiRequest, NextApiResponse } from "next";
import { CrudRouteHandler } from "~/backend/handlers/crud-route-handler";
import FietsenstallingenService from "~/backend/services/fietsenstallingen-service";
import { authOptions } from './auth/[...nextauth]'
import { getServerSession } from "next-auth/next"


export default async (request: NextApiRequest, response: NextApiResponse) => {
  // const session = await getServerSession(request, response, authOptions)

  // // console.log("#### create stalling - get session");
  // if (session && session.user) {
  //   // console.log("#### create stalling while logged in");
  //   // console.log(`#### req ${JSON.stringify(Object.keys(request), null, 2)}`);
  // } else {
  //   console.log("#### create stalling while not logged in");
  // }

  await CrudRouteHandler(request, response, FietsenstallingenService);
};
