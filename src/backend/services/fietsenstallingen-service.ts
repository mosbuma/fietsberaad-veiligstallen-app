import { prisma } from "~/server/db";
import { fietsenstallingen } from "@prisma/client";
import { ICrudService } from "~/backend/handlers/crud-service-interface";

// inspired by https://medium.com/@brandonlostboy/build-it-better-next-js-crud-api-b45d2e923896
const FietsenstallingenService: ICrudService<fietsenstallingen> = {
  getAll: async () => {
    return await prisma.fietsenstallingen.findMany();
  },
  getOne: async (id: string) => {
    return await prisma.fietsenstallingen.findFirst({ where: { ID: id } });
  },
  create: async (data: fietsenstallingen): Promise<fietsenstallingen> => {
    throw new Error("Function not implemented.");
  },
  update: async (
    id: string,
    data: fietsenstallingen
  ): Promise<fietsenstallingen> => {
    throw new Error("Function not implemented.");
  },
  delete: async (id: string): Promise<fietsenstallingen> => {
    throw new Error("Function not implemented.");
  },
};

export default FietsenstallingenService;
