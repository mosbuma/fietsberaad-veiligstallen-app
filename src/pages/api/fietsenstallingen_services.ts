import type { NextApiRequest, NextApiResponse } from "next";
import { CrudRouteHandler } from "~/backend/handlers/crud-route-handler";
import FietsenstallingenServicesService from "~/backend/services/fietsenstallingen_services-service";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  await CrudRouteHandler(request, response, FietsenstallingenServicesService);
};
