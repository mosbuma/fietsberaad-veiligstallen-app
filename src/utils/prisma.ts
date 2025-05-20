import { Prisma } from "~/generated/prisma-client";
import { prisma } from "~/server/db";
import { Session } from "next-auth";

const getParkingsFromDatabase = async (sites: string[] | undefined, session: Session | null = null) => {
  let fietsenstallingen;

  let wherefilter = {};
  if (!session || !session.user) {
    wherefilter = {
      Status: "1",
    }
  }

  if (!sites || sites.length === 0) {
    fietsenstallingen = await prisma.fietsenstallingen.findMany({
      where: wherefilter,
      include: {
        uitzonderingenopeningstijden: true
      }
    });
  } else {
    fietsenstallingen = await prisma.fietsenstallingen.findMany({
      where: {
        OR: [
          {
            SiteID: { in: sites },
          },
          {
            Status: "new"
          },
        ]
      },
      include: {
        uitzonderingenopeningstijden: true
      }
    });
  }

  // Helper function to process Date and other special types
  const processSpecialTypes = (obj: any) => {
    Object.entries(obj).forEach(([key, prop]) => {
      if (prop instanceof Date) {
        obj[key] = new Date(obj[key]).toISOString();
      }
      if (prop instanceof BigInt) {
        obj[key] = obj[key].toString();
      }
      if (prop instanceof Prisma.Decimal) {
        delete obj[key];
      }
    });
    return obj;
  };

  fietsenstallingen.forEach((stalling: any) => {
    // Process main stalling object
    processSpecialTypes(stalling);

    // Process each uitzonderingenopeningstijden item
    if (stalling.uitzonderingenopeningstijden) {
      stalling.uitzonderingenopeningstijden = stalling.uitzonderingenopeningstijden.map(
        (uitzondering: any) => processSpecialTypes(uitzondering)
      );
    }

    delete stalling.reservationCostPerDay;
    delete stalling.wachtlijst_Id;
  });

  return fietsenstallingen;
};

export {
  getParkingsFromDatabase,
}