import type { NextApiRequest, NextApiResponse } from "next";
import { CrudRouteHandler } from "~/backend/handlers/crud-route-handler";
import ZonesService from "~/backend/services/zones-service";

export default async (request: NextApiRequest, response: NextApiResponse) => {
  await CrudRouteHandler(request, response, ZonesService);
};
