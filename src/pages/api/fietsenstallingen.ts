import type { NextApiRequest, NextApiResponse } from "next";
import { CrudRouteHandler } from "~/backend/handlers/crud-route-handler";
import FietsenstallingenService from "~/backend/services/fietsenstallingen-service";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  await CrudRouteHandler(request, response, FietsenstallingenService);
};
