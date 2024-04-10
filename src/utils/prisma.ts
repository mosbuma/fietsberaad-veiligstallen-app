import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import { Session } from "next-auth";

const getParkingsFromDatabase = async (sites: any, session: Session | null) => {

  let fietsenstallingen;

  let wherefilter = {};
  if (!session || !session.user) {
    wherefilter = {
      Status: "1",
    }
  }

  if (sites.length === 0) {
    fietsenstallingen = await prisma.fietsenstallingen.findMany({
      where: wherefilter,
    });
  } else {
    fietsenstallingen = await prisma.fietsenstallingen.findMany({
      where: {
        OR: [{
          // Status: "1",
          // Plaats: {
          //   not: "",
          // },
          SiteID: { in: sites },
        },
        {
          Status: "new"
        },
        ]
      }
    });
  }

  fietsenstallingen.forEach((stalling: any) => {
    Object.entries(stalling).forEach(([key, prop]) => {
      if (prop instanceof Date) {
        stalling[key] = new Date(stalling[key]).toISOString();
        // console.log(
        //   `@@@@ convert ${key} [${typeof prop}] to ${stalling[key]})}`
        // );
      }
      if (prop instanceof BigInt) {
        stalling[key] = stalling.toString();
        // console.log(
        //   `@@@@ convert ${key} [${typeof prop}] to ${stalling.toString()})}`
        // );
      }
      if (prop instanceof Prisma.Decimal) {
        // stalling[key] = stalling.toString();
        // console.log(
        //   `@@@@ delete ${key} [${typeof prop}]`
        // );
        delete stalling[key];
      }
    });

    delete stalling.reservationCostPerDay;
    delete stalling.wachtlijst_Id;
  });

  // fietsenstallingen.filter((x: any) => x.Plaats !== "");

  return fietsenstallingen;
};

export {
  getParkingsFromDatabase,
}