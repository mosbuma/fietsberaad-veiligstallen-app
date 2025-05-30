import { PrismaClient } from "~/generated/prisma-client";

import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"], // "query" -> add to development to see queries
    log: ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
