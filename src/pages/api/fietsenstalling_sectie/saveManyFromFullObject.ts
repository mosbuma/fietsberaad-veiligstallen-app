import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

export default async function handle(req, res) {
  if((req.method as HttpMethod) !== "POST") return;

  const data = req.body as T;
  console.log('data', data)

  // data.sectionId
  // data.parkingSections
  // data.parkingId

  // Get fietstypes
  const fietstypen = await prisma.fietstypen.findMany();

  // Go over given sections
  data.parkingSections[0].secties_fietstype.map(async (vehicleType) => {
    // Get vehicle type ID
    const vehicleTypeId = fietstypen.filter(x => {
      return x.Name === vehicleType.fietstype.Name;
    }).pop().ID;
    // Check if capaciteit for this vehicle type exists in database
    const dbCapaciteit = await prisma.sectie_fietstype.findFirst({
      where: {
        sectieID: data.sectionId,
        BikeTypeID: vehicleTypeId
      }
    });

    // Update parking section capacities
    if(dbCapaciteit && vehicleTypeId) {
      if(! dbCapaciteit.sectieID) {
        res.status(405).end();
        return;
      }
      if(! vehicleTypeId) {
        res.status(405).end();
        return;
      }

      await prisma.sectie_fietstype.update({
        where: {
          SectionBiketypeID: dbCapaciteit.SectionBiketypeID,
          BikeTypeID: vehicleTypeId
        },
        data: {
          Capaciteit: Number(vehicleType.Capaciteit),
          Toegestaan: vehicleType.Toegestaan
        }
      })
    }

    // Or create parking section capacity row
    else {
      await prisma.sectie_fietstype.create({
        data: {
          BikeTypeID: vehicleTypeId,
          sectieID: data.sectionId,
          StallingsID: data.parkingId,
          Capaciteit: number(vehicleType.Capaciteit),
          Toegestaan: vehicleType.Toegestaan
        }
      });
    }
  });

  res.json({})
}
