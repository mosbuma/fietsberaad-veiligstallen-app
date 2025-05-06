import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSFietsenstalling, type VSFietsenstallingLijst, fietsenstallingSelect, fietsenstallingLijstSelect } from "~/types/fietsenstallingen";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { fietsenstallingCreateSchema } from "~/types/fietsenstallingen";
import { generateID, validateUserSession } from "~/utils/server/database-tools";

// TODO: handle adding the fietsenstalling to the user's sites and setting correct rights
// TODO: check if user has sufficient rights to create an fietsenstalling

// export type FietsenstallingenResponse = VSFietsenstalling[];
export type FietsenstallingenResponse = {
  data?: VSFietsenstalling[] | VSFietsenstallingLijst[];
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const validationResult = await validateUserSession(session, "any");
  
  if ('error' in validationResult) {
    res.status(validationResult.status).json({error: validationResult.error});
    return;
  }

  const { sites, userId } = validationResult;

  switch (req.method) {
    case "GET": {
      // Check if compact mode is requested
      const compact = req.query.compact === 'true';
      
      // GET all fietsenstallingen user can access
      const fietsenstallingen = (await prisma.fietsenstallingen.findMany({
        where: {
          ID: { in: sites }
        },
        select: compact ? fietsenstallingLijstSelect : fietsenstallingSelect
      })) as unknown as (VSFietsenstalling[] | VSFietsenstallingLijst[]);
      
      res.status(200).json({data: fietsenstallingen});
      break;
    }
    case "POST": {
      try {
        const newID = generateID();
        const data = { ...req.body, ID: newID };

        const parseResult = fietsenstallingCreateSchema.safeParse(data);
        if (!parseResult.success) {
          console.error("Unexpected/missing data error:", JSON.stringify(parseResult.error.errors,null,2));
          res.status(400).json({ error: parseResult.error.errors });
          return;
        }
        const parsed = parseResult.data;
        
        const newData = {
          ID: newID,
          // Required fields
          StallingsID: parsed.StallingsID,
          Title: parsed.Title,
          Status: "1", // Default status
            
          // Optional fields with defaults
          SiteID: parsed.SiteID ?? undefined,
          StallingsIDExtern: parsed.StallingsIDExtern ?? undefined,
          Description: parsed.Description ?? undefined,
          Image: parsed.Image ?? undefined,
          Location: parsed.Location ?? undefined,
          Postcode: parsed.Postcode ?? undefined,
          Plaats: parsed.Plaats ?? undefined,
          Capacity: parsed.Capacity ?? undefined,
          Openingstijden: parsed.Openingstijden ?? undefined,
          EditorCreated: parsed.EditorCreated ?? undefined,
          DateCreated: parsed.DateCreated ?? new Date(),
          EditorModified: parsed.EditorModified ?? undefined,
          DateModified: parsed.DateModified ?? new Date(),
          Ip: parsed.Ip ?? undefined,
          Coordinaten: parsed.Coordinaten ?? undefined,
          Type: parsed.Type ?? undefined,
          Verwijssysteem: parsed.Verwijssysteem ?? false,
          VerwijssysteemOverzichten: parsed.VerwijssysteemOverzichten ?? false,
          FMS: parsed.FMS ?? false,
          Open_ma: parsed.Open_ma ?? undefined,
          Dicht_ma: parsed.Dicht_ma ?? undefined,
          Open_di: parsed.Open_di ?? undefined,
          Dicht_di: parsed.Dicht_di ?? undefined,
          Open_wo: parsed.Open_wo ?? undefined,
          Dicht_wo: parsed.Dicht_wo ?? undefined,
          Open_do: parsed.Open_do ?? undefined,
          Dicht_do: parsed.Dicht_do ?? undefined,
          Open_vr: parsed.Open_vr ?? undefined,
          Dicht_vr: parsed.Dicht_vr ?? undefined,
          Open_za: parsed.Open_za ?? undefined,
          Dicht_za: parsed.Dicht_za ?? undefined,
          Open_zo: parsed.Open_zo ?? undefined,
          Dicht_zo: parsed.Dicht_zo ?? undefined,
          OmschrijvingTarieven: parsed.OmschrijvingTarieven ?? undefined,
          IsStationsstalling: parsed.IsStationsstalling ?? false,
          IsPopup: parsed.IsPopup ?? false,
          NotaVerwijssysteem: parsed.NotaVerwijssysteem ?? undefined,
          Tariefcode: parsed.Tariefcode ?? undefined,
          Toegangscontrole: parsed.Toegangscontrole ?? undefined,
          Beheerder: parsed.Beheerder ?? undefined,
          BeheerderContact: parsed.BeheerderContact ?? undefined,
          Url: parsed.Url ?? undefined,
          ExtraServices: parsed.ExtraServices ?? undefined,
          dia: parsed.dia ?? undefined,
          BerekentStallingskosten: parsed.BerekentStallingskosten ?? false,
          AantalReserveerbareKluizen: parsed.AantalReserveerbareKluizen ?? 0,
          MaxStallingsduur: parsed.MaxStallingsduur ?? 0,
          HeeftExterneBezettingsdata: parsed.HeeftExterneBezettingsdata ?? false,
          ExploitantID: parsed.ExploitantID ?? undefined,
          hasUniSectionPrices: parsed.hasUniSectionPrices ?? true,
          hasUniBikeTypePrices: parsed.hasUniBikeTypePrices ?? false,
          shadowBikeparkID: parsed.shadowBikeparkID ?? undefined,
          BronBezettingsdata: parsed.BronBezettingsdata ?? "FMS",
          reservationCostPerDay: parsed.reservationCostPerDay ?? undefined,
          wachtlijst_Id: parsed.wachtlijst_Id ?? undefined,
          freeHoursReservation: parsed.freeHoursReservation ?? undefined,
          thirdPartyReservationsUrl: parsed.thirdPartyReservationsUrl ?? undefined,
        }

        const newFietsenstalling = await prisma.fietsenstallingen.create({data: newData, select: fietsenstallingSelect}) as unknown as VSFietsenstalling;
        if(!newFietsenstalling) {
          console.error("Error creating new fietsenstalling:", newData);
          res.status(500).json({error: "Error creating new fietsenstalling"});
          return;
        }

        // add a record to the security_users_sites table that links the new fietsenstalling to the user's sites
        const newLink = await prisma.security_users_sites.create({
          data: {
            UserID: userId,
            SiteID: newFietsenstalling.ID
          }
        });
        if(!newLink) {
          console.error("Error creating link to new fietsenstalling:", newFietsenstalling.ID);
          res.status(500).json({error: "Error creating link to new fietsenstalling"});
          return;
        }

        res.status(201).json({ data: [newFietsenstalling]});
      } catch (e) {
        console.error("Error creating fietsenstalling:", e);
        res.status(500).json({error: "Error creating fietsenstalling"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}