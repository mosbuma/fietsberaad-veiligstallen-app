import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSFietsenstalling, fietsenstallingSelect } from "~/types/fietsenstallingen";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { validateUserSession } from "~/utils/server/database-tools";
import { fietsenstallingSchema } from "~/types/fietsenstallingen";

export type FietsenstallingResponse = {
  data?: VSFietsenstalling;
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({error: "Unauthorized - no session found"}); // Unauthorized
    return;
  }

  const validateUserSessionResult = await validateUserSession(session, "any");
  if ('error' in validateUserSessionResult) {
    res.status(401).json({error: validateUserSessionResult.error}); // Unauthorized
    return;
  }

  const id = req.query.id as string;
  if (!validateUserSessionResult.sites.includes(id)) {
    res.status(403).json({ error: "No access to this organization" });
    return;
  }

  switch (req.method) {
    case "GET": {
      if (id === "new") {
        // Return a template for a new fietsenstalling
        res.status(200).json({data: {
          ...fietsenstallingSchema.shape,
          ItemType: "fietsenstallingen"
        }});
      }

      const fietsenstalling = (await prisma.fietsenstallingen.findFirst({
        where: {
          ID: id,
        },
        select: fietsenstallingSelect
      })) as unknown as VSFietsenstalling;
      res.status(200).json({data: fietsenstalling});
      break;
    }
    case "PUT": {
      try {
        const parseResult = fietsenstallingSchema.partial().safeParse(req.body);
        if (!parseResult.success) {
          console.error("Unexpected/missing data error:", parseResult.error);
          res.status(400).json({error: "Unexpected/missing data error:"});
          return;
        }

        const parsed = parseResult.data;
        const updatedFietsenstalling = await prisma.fietsenstallingen.update({
          select: fietsenstallingSelect,
          where: { ID: id },
          data: {
            StallingsID: parsed.StallingsID ?? undefined,
            SiteID: parsed.SiteID ?? undefined,
            Title: parsed.Title ?? undefined,
            StallingsIDExtern: parsed.StallingsIDExtern ?? undefined,
            Description: parsed.Description ?? undefined,
            Image: parsed.Image ?? undefined,
            Location: parsed.Location ?? undefined,
            Postcode: parsed.Postcode ?? undefined,
            Plaats: parsed.Plaats ?? undefined,
            Capacity: parsed.Capacity ?? undefined,
            Openingstijden: parsed.Openingstijden ?? undefined,
            Status: parsed.Status ?? undefined,
            EditorModified: parsed.EditorModified ?? undefined,
            DateModified: parsed.DateModified ? new Date(parsed.DateModified) : undefined,
            Ip: parsed.Ip ?? undefined,
            Coordinaten: parsed.Coordinaten ?? undefined,
            Type: parsed.Type ?? undefined,
            Verwijssysteem: parsed.Verwijssysteem ?? undefined,
            VerwijssysteemOverzichten: parsed.VerwijssysteemOverzichten ?? undefined,
            FMS: parsed.FMS ?? undefined,
            Open_ma: parsed.Open_ma ? new Date(parsed.Open_ma) : undefined,
            Dicht_ma: parsed.Dicht_ma ? new Date(parsed.Dicht_ma) : undefined,
            Open_di: parsed.Open_di ? new Date(parsed.Open_di) : undefined,
            Dicht_di: parsed.Dicht_di ? new Date(parsed.Dicht_di) : undefined,
            Open_wo: parsed.Open_wo ? new Date(parsed.Open_wo) : undefined,
            Dicht_wo: parsed.Dicht_wo ? new Date(parsed.Dicht_wo) : undefined,
            Open_do: parsed.Open_do ? new Date(parsed.Open_do) : undefined,
            Dicht_do: parsed.Dicht_do ? new Date(parsed.Dicht_do) : undefined,
            Open_vr: parsed.Open_vr ? new Date(parsed.Open_vr) : undefined,
            Dicht_vr: parsed.Dicht_vr ? new Date(parsed.Dicht_vr) : undefined,
            Open_za: parsed.Open_za ? new Date(parsed.Open_za) : undefined,
            Dicht_za: parsed.Dicht_za ? new Date(parsed.Dicht_za) : undefined,
            Open_zo: parsed.Open_zo ? new Date(parsed.Open_zo) : undefined,
            Dicht_zo: parsed.Dicht_zo ? new Date(parsed.Dicht_zo) : undefined,
            OmschrijvingTarieven: parsed.OmschrijvingTarieven ?? undefined,
            IsStationsstalling: parsed.IsStationsstalling ?? undefined,
            IsPopup: parsed.IsPopup ?? undefined,
            NotaVerwijssysteem: parsed.NotaVerwijssysteem ?? undefined,
            Tariefcode: parsed.Tariefcode ?? undefined,
            Toegangscontrole: parsed.Toegangscontrole ?? undefined,
            Beheerder: parsed.Beheerder ?? undefined,
            BeheerderContact: parsed.BeheerderContact ?? undefined,
            Url: parsed.Url ?? undefined,
            ExtraServices: parsed.ExtraServices ?? undefined,
            dia: parsed.dia ?? undefined,
            BerekentStallingskosten: parsed.BerekentStallingskosten ?? undefined,
            AantalReserveerbareKluizen: parsed.AantalReserveerbareKluizen ?? undefined,
            MaxStallingsduur: parsed.MaxStallingsduur ?? undefined,
            HeeftExterneBezettingsdata: parsed.HeeftExterneBezettingsdata ?? undefined,
            ExploitantID: parsed.ExploitantID ?? undefined,
            hasUniSectionPrices: parsed.hasUniSectionPrices ?? undefined,
            hasUniBikeTypePrices: parsed.hasUniBikeTypePrices ?? undefined,
            shadowBikeparkID: parsed.shadowBikeparkID ?? undefined,
            BronBezettingsdata: parsed.BronBezettingsdata ?? undefined,
            reservationCostPerDay: parsed.reservationCostPerDay ?? undefined,
            wachtlijst_Id: parsed.wachtlijst_Id ?? undefined,
            freeHoursReservation: parsed.freeHoursReservation ?? undefined,
            thirdPartyReservationsUrl: parsed.thirdPartyReservationsUrl ?? undefined,
          }
        });
        res.status(200).json({data: updatedFietsenstalling});
      } catch (e) {
        if (e instanceof z.ZodError) {
          console.error("Unexpected/missing data error:", e.errors);
          res.status(400).json({error: "Unexpected/missing data error:"});
        } else {
          res.status(500).json({error: "Error updating fietsenstalling"});
        }
      }
      break;
    }
    case "DELETE": {
      try {
        await prisma.fietsenstallingen.delete({
          where: { ID: id }
        });
        res.status(200).json({});
      } catch (e) {
        console.error("Error deleting fietsenstalling:", e);
        res.status(500).json({error: "Error deleting fietsenstalling"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Method Not Allowed"}); // Method Not Allowed
    }
  }
}