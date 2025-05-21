import { prisma } from "~/server/db";
import { zones } from "~/generated/prisma-client";
import { ICrudService } from "~/backend/handlers/crud-service-interface";

// inspired by https://medium.com/@brandonlostboy/build-it-better-next-js-crud-api-b45d2e923896
const ZonesService: ICrudService<zones> = {
  getAll: async () => {
    return await prisma.zones.findMany({
      where: {
        zone_type: 'municipality'
      }
    });
  },
  getOne: async (id: string) => {
    return await prisma.zones.findFirst({ where: { ID: id } });
  },
  create: async (data: zones): Promise<zones> => {
    throw new Error("Function not implemented.");
  },
  update: async (
    id: string,
    data: zones
  ): Promise<zones> => {
    throw new Error("Function not implemented.");
  },
  delete: async (id: string): Promise<zones> => {
    throw new Error("Function not implemented.");
  },
};

export default ZonesService;
