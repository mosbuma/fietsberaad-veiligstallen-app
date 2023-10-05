import type { NextApiRequest, NextApiResponse } from "next";
import {
  Prisma,
  type fietsenstallingen,
} from "@prisma/client";
import { prisma } from "~/server/db";
import { ParkingDetailsType } from "~/types";

const fixFieldsForParking = (parking: fietsenstallingen) => {
  for (const [key, prop] of Object.entries(parking)) {
    if (prop instanceof Date) {
      (parking as any)[key] = prop.toString();
    }
    if (prop instanceof BigInt) {
      (parking as any)[key] = prop.toString();
    }
    if (prop instanceof Prisma.Decimal) {
      delete (parking as any)[key];
    }
  }
  delete parking.reservationCostPerDay;
  delete parking.wachtlijst_Id;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    if ("stallingid" in req.query) {
      const stallingId: string = req.query.stallingid as string;

      const parking = (await prisma.fietsenstallingen.findFirst({
        where: {
          ID: stallingId,
        },
        select: {
          Title: true,
          ID: true,
          SiteID: true,
          Location: true,
          Postcode: true,
          Plaats: true,
          Type: true,
          Image: true,
          Open_ma : true,
          Dicht_ma: true,
          Open_di : true,
          Dicht_di: true,
          Open_wo : true,
          Dicht_wo: true,
          Open_do : true,
          Dicht_do: true,
          Open_vr : true,
          Dicht_vr: true,
          Open_za : true,
          Dicht_za: true,
          Open_zo : true,
          Dicht_zo: true,
          Openingstijden: true,
          Capacity: true,
          Coordinaten: true,
          Beheerder: true,
          BeheerderContact: true,
          fietsenstalling_type: {
            select: {
              id: true,
              name: true,
              sequence: true,
            }
          },
          fietsenstalling_secties: {
            select: {
              titel: true,
              secties_fietstype: {
                select: {
                  Toegestaan: true,
                  Capaciteit: true,
                  fietstype: { select: { Name: true } },
                },
              },
            },
          },
          abonnementsvorm_fietsenstalling: {
            select: {
              abonnementsvormen: {
                select: {
                    ID: true,
                    naam: true,
                    omschrijving: true,
                    prijs: true,
                    tijdsduur: true,
                    conditions: true,
                    siteID: true,
                    bikeparkTypeID: true,
                    isActief: true,
                    exploitantSiteID: true,
                    idmiddelen: true,
                    contractID: true,
                    paymentAuthorizationID: true,
                    conditionsID: true
                  }
                }
              }
          },
          exploitant: {
            select: {
              ID: true,
              Helpdesk: true,
              CompanyName: true,
            }
          },
          fietsenstallingen_services: {
            select: {
              services: {
                select: {
                  ID: true,
                  Name: true
                }
              }
            }
          }
        }
      })) as unknown as ParkingDetailsType;


      if(parking!==null) {
        fixFieldsForParking(parking);
      }

      // console.log("#### parking fixed", JSON.stringify(parking,0,2));
      res.status(200).json(parking);
    } else {
      // let allcapacity = [];


      // const parkings = await prisma.fietsenstallingen.findMany({
      //   select: { ID: true, Title: true, Plaats: true },
      //   take: 100,
      // });
      // for (let parking of parkings) {
      //   const capacity = await getCapacityDataForParking(parking.ID);
      //   getCapacityDataForParkingif (capacity) {
      //     allcapacity.push({
      //       ID: parking.ID,
      //       Title: parking.Title,
      //       Plaats: parking.Plaats,
      //       data: capacity,
      //     });
      //   }
      // }

      // // console.log("collect capacity info");
      // allcapacity.map((capacityinfo, index) => {
      //   capacityinfo.details.map((detailinfo, index) => {
      //     console.log(`capacityinfo ${index} ${JSON.stringify(detailinfo)}`);
      //   });

      //   let capacitystr = Object.keys(capacityinfo.data);
      //   //   .map((infoitem) => {
      //   //     return `\t${infoitem.typename} - ${infoitem.allowed} - ${infoitem.capacity}`;
      //   //   })
      //   //   .join("\n");
      //   console.log(
      //     `${capacityinfo.Title}-${capacityinfo.Plaats}-${capacityinfo.data.total}\n${capacitystr}`
      //   );
      // });

      // // console.log("allcapacity", allcapacity);
      // res.status(200).json(allcapacity);
      res.status(405).end(); // Method Not Allowed
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
