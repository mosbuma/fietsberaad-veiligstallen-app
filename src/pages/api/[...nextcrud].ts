import NextCrud, { PrismaAdapter } from "@premieroctet/next-crud";
import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "~/server/db";

// handler for all next-crud routes
// next-crud is a helper library that creates CRUD API routes with one simple function based on a Prisma model for Next.js.
// see https://next-crud-pi.vercel.app/ for documentation
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const nextCrudHandler = await NextCrud({
    adapter: new PrismaAdapter({
      prismaClient: prisma,
    }),
  });

  return nextCrudHandler(req, res);
};

export default handler;
