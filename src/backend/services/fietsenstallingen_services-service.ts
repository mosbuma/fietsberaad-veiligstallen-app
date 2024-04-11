import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import type { fietsenstallingen_services } from "@prisma/client";
import type { ICrudService } from "~/backend/handlers/crud-service-interface";

// inspired by https://medium.com/@brandonlostboy/build-it-better-next-js-crud-api-b45d2e923896
const FietsenstallingenServicesService: ICrudService<fietsenstallingen_services> = {
  getAll: async () => {
    return await prisma.fietsenstallingen_services.findMany();
  },
  getOne: async (fietsenstallingId: string) => {
    return await prisma.fietsenstallingen_services.findFirst({
      where: {
        FietsenstallingID: fietsenstallingId
      }
    });
  },
  create: async (_data: fietsenstallingen_services): Promise<fietsenstallingen_services> => {
    return await prisma.fietsenstallingen_services.create({ data: _data });
  },
  update: async (
    _id: string,
    _data: fietsenstallingen_services
  ): Promise<fietsenstallingen_services> => {
    // NB code below does not work: where selection field ID does not exist
    // return await prisma.fietsenstallingen_services.update({
    //   where: { ID: _id },
    //   data: _data,
    // });
    throw new Error("Not implemented");
  },
  delete: async (_fietsenstallingId: string): Promise<fietsenstallingen_services> => {
    return await prisma.fietsenstallingen_services.delete({
      where: { FietsenstallingID: _fietsenstallingId }
    });
  },
  // deleteMany: async (where): Promise<fietsenstallingen_services> => {
  //   return await prisma.fietsenstallingen_services.deleteMany({
  //     where: where
  //   });
  // },
};

export default FietsenstallingenServicesService;
