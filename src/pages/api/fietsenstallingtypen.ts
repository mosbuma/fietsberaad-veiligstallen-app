import type { NextApiRequest, NextApiResponse } from "next";
import { CrudRouteHandler } from "~/backend/handlers/crud-route-handler";
import FietsenstallingTypenService from "~/backend/services/fietsenstallingtypen-service";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  await CrudRouteHandler(request, response, FietsenstallingTypenService);
};
