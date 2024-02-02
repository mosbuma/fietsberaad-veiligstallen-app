import { Prisma, type fietsenstallingen } from "@prisma/client";
import { ISODateString } from "next-auth";
import { prisma } from "~/server/db";

export type vsFietsenstallingen = 
  {
    ID: string,
    StallingsID: string | null,
    SiteID: string | null,
    Title: string | null,
    StallingsIDExtern: string | null,
    Description: string | null,
    Image: string | null,
    Location: string | null,
    Postcode: string | null,
    Plaats: string | null,
    Capacity: number | null,
    Openingstijden: string | null,
    Status: string | null,
    EditorCreated: string | null,
    DateCreated: ISODateString | null,
    EditorModified: string | null,
    DateModified: ISODateString | null,
    Ip: string | null,
    Coordinaten: string | null,
    Type: string | null,
    Verwijssysteem: boolean,
    VerwijssysteemOverzichten: boolean | null,
    FMS: boolean,
    Open_ma: ISODateString | null,
    Dicht_ma: ISODateString | null,
    Open_di: ISODateString | null,
    Dicht_di: ISODateString | null,
    Open_wo: ISODateString | null,
    Dicht_wo: ISODateString | null,
    Open_do: ISODateString | null,
    Dicht_do: ISODateString | null,
    Open_vr: ISODateString | null,
    Dicht_vr: ISODateString | null,
    Open_za: ISODateString | null,
    Dicht_za: ISODateString | null,
    Open_zo: ISODateString | null,
    Dicht_zo: ISODateString | null,
    OmschrijvingTarieven: string | null,
    IsStationsstalling: boolean,
    IsPopup: boolean,
    NotaVerwijssysteem: string | null,
    Tariefcode: number | null,
    Toegangscontrole: number | null,
    Beheerder: string | null,
    BeheerderContact: string | null,
    Url: string | null,
    ExtraServices: string | null,
    dia: string | null,
    BerekentStallingskosten: boolean,
    AantalReserveerbareKluizen: number,
    MaxStallingsduur: number,
    HeeftExterneBezettingsdata: boolean,
    ExploitantID: string | null,
    hasUniSectionPrices: boolean,
    hasUniBikeTypePrices: boolean,
    shadowBikeparkID: string | null,
    BronBezettingsdata: string | null,
    // reservationCostPerDay: Prisma.Decimal | null,
    wachtlijst_Id: string | null,
    // freeHoursReservation: Prisma.Decimal | null,
    thirdPartyReservationsUrl: string | null,
  }

const getParkingsFromDatabase = async (sites:string[]): Promise<vsFietsenstallingen[]>  => {
  let fietsenstallingen: fietsenstallingen[];

  if(sites.length===0) {
    fietsenstallingen = await prisma.fietsenstallingen.findMany({
      where: {
        Status: "1",
        // Plaats: {
        //   not: "",
        // }
      },
      // select: {
      //   StallingsID: true,
      //   Title: true,
      //   Location: true,
      //   Coordinaten: true,
      //   DateCreated: true,
      // },
    });
  } else {
    fietsenstallingen = await prisma.fietsenstallingen.findMany({
      where: {
        Status: "1",
        // Plaats: {
        //   not: "",
        // },
        SiteID: { in: sites },
      },
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

  return fietsenstallingen as vsFietsenstallingen[];
};

export {
  getParkingsFromDatabase,
}