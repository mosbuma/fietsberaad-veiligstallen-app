import type { NextApiRequest, NextApiResponse } from "next";
import { CrudRouteHandler } from "~/backend/handlers/crud-route-handler";
import UsersService from "~/backend/services/users-service";
// import { authOptions } from './auth/[...nextauth]'
// import { getServerSession } from "next-auth/next"

export default async (request: NextApiRequest, response: NextApiResponse) => {
  // const session = await getServerSession(request, response, authOptions)
  // console.log("#### api - users - session", session);

  await CrudRouteHandler(request, response, UsersService);
};
