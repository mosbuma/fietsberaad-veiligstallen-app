import { prisma } from "~/server/db";
import { fietsenstallingtypen } from "@prisma/client";
import { ICrudService } from "~/backend/handlers/crud-service-interface";

// inspired by https://medium.com/@brandonlostboy/build-it-better-next-js-crud-api-b45d2e923896
const FietsenstallingTypenService: ICrudService<fietsenstallingtypen> = {
  getAll: async () => {
    return await prisma.fietsenstallingtypen.findMany({});
  },
  getOne: async (id: string) => {
    return await prisma.fietsenstallingtypen.findFirst({ where: { id: id } });
  },
  create: async (data: fietsenstallingtypen): Promise<fietsenstallingtypen> => {
    throw new Error("Function not implemented.");
  },
  update: async (
    id: string,
    data: fietsenstallingtypen
  ): Promise<fietsenstallingtypen> => {
    throw new Error("Function not implemented.");
  },
  delete: async (id: string): Promise<fietsenstallingtypen> => {
    throw new Error("Function not implemented.");
  },
};

export default FietsenstallingTypenService;
