import { z } from "zod";

export type VSFietsenstalling = {
  ID: string;
  StallingsID: string | null;
  SiteID: string | null;
  Title: string | null;
  StallingsIDExtern: string | null;
  Description: string | null;
  Image: string | null;
  Location: string | null;
  Postcode: string | null;
  Plaats: string | null;
  Capacity: number | null;
  Openingstijden: string | null;
  Status: string | null;
  EditorCreated: string | null;
  DateCreated: Date | null;
  EditorModified: string | null;
  DateModified: Date | null;
  Ip: string | null;
  Coordinaten: string | null;
  Type: string | null;
  Verwijssysteem: boolean;
  VerwijssysteemOverzichten: boolean | null;
  FMS: boolean;
  Open_ma: Date | null;
  Dicht_ma: Date | null;
  Open_di: Date | null;
  Dicht_di: Date | null;
  Open_wo: Date | null;
  Dicht_wo: Date | null;
  Open_do: Date | null;
  Dicht_do: Date | null;
  Open_vr: Date | null;
  Dicht_vr: Date | null;
  Open_za: Date | null;
  Dicht_za: Date | null;
  Open_zo: Date | null;
  Dicht_zo: Date | null;
  OmschrijvingTarieven: string | null;
  IsStationsstalling: boolean;
  IsPopup: boolean;
  NotaVerwijssysteem: string | null;
  Tariefcode: number | null;
  Toegangscontrole: number | null;
  Beheerder: string | null;
  BeheerderContact: string | null;
  Url: string | null;
  ExtraServices: string | null;
  dia: string | null;
  BerekentStallingskosten: boolean;
  AantalReserveerbareKluizen: number;
  MaxStallingsduur: number;
  HeeftExterneBezettingsdata: boolean;
  ExploitantID: string | null;
  hasUniSectionPrices: boolean;
  hasUniBikeTypePrices: boolean;
  shadowBikeparkID: string | null;
  BronBezettingsdata: string | null;
  reservationCostPerDay: number | null;
  wachtlijst_Id: bigint | null;
  freeHoursReservation: number | null;
  thirdPartyReservationsUrl: string | null;
};

export type VSFietsenstallingLijst = {
  ID: true,
  Title: true,
  StallingsID: true,
  Type: true,
  // ID: string;
  // StallingsID: string | null;
  // Title: string | null;
  // Location: string | null;
  // Plaats: string | null;
  // Capacity: number | null;
  // Status: string | null;
  // Type: string | null;
  // ExploitantID: string | null;
};

export const fietsenstallingSelect = {
  ID: true,
  StallingsID: true,
  SiteID: true,
  Title: true,
  StallingsIDExtern: true,
  Description: true,
  Image: true,
  Location: true,
  Postcode: true,
  Plaats: true,
  Capacity: true,
  Openingstijden: true,
  Status: true,
  EditorCreated: true,
  DateCreated: true,
  EditorModified: true,
  DateModified: true,
  Ip: true,
  Coordinaten: true,
  Type: true,
  Verwijssysteem: true,
  VerwijssysteemOverzichten: true,
  FMS: true,
  Open_ma: true,
  Dicht_ma: true,
  Open_di: true,
  Dicht_di: true,
  Open_wo: true,
  Dicht_wo: true,
  Open_do: true,
  Dicht_do: true,
  Open_vr: true,
  Dicht_vr: true,
  Open_za: true,
  Dicht_za: true,
  Open_zo: true,
  Dicht_zo: true,
  OmschrijvingTarieven: true,
  IsStationsstalling: true,
  IsPopup: true,
  NotaVerwijssysteem: true,
  Tariefcode: true,
  Toegangscontrole: true,
  Beheerder: true,
  BeheerderContact: true,
  Url: true,
  ExtraServices: true,
  dia: true,
  BerekentStallingskosten: true,
  AantalReserveerbareKluizen: true,
  MaxStallingsduur: true,
  HeeftExterneBezettingsdata: true,
  ExploitantID: true,
  hasUniSectionPrices: true,
  hasUniBikeTypePrices: true,
  shadowBikeparkID: true,
  BronBezettingsdata: true,
  reservationCostPerDay: true,
  wachtlijst_Id: true,
  freeHoursReservation: true,
  thirdPartyReservationsUrl: true,
};

export const fietsenstallingLijstSelect = {
  ID: true,
  Title: true,
  StallingsID: true,
  Type: true,
  // ID: true,
  // StallingsID: true,
  // Title: true,
  // Location: true,
  // Plaats: true,
  // Capacity: true,
  // Status: true,
  // Type: true,
  // ExploitantID: true,
};

export const fietsenstallingSchema = z.object({
  ID: z.string(),
  StallingsID: z.string().nullable(),
  SiteID: z.string().nullable(),
  Title: z.string().nullable(),
  StallingsIDExtern: z.string().nullable(),
  Description: z.string().nullable(),
  Image: z.string().nullable(),
  Location: z.string().nullable(),
  Postcode: z.string().nullable(),
  Plaats: z.string().nullable(),
  Capacity: z.number().nullable(),
  Openingstijden: z.string().nullable(),
  Status: z.string().nullable(),
  EditorCreated: z.string().nullable(),
  DateCreated: z.date().nullable(),
  EditorModified: z.string().nullable(),
  DateModified: z.date().nullable(),
  Ip: z.string().nullable(),
  Coordinaten: z.string().nullable(),
  Type: z.string().nullable(),
  Verwijssysteem: z.boolean(),
  VerwijssysteemOverzichten: z.boolean().nullable(),
  FMS: z.boolean(),
  Open_ma: z.date().nullable(),
  Dicht_ma: z.date().nullable(),
  Open_di: z.date().nullable(),
  Dicht_di: z.date().nullable(),
  Open_wo: z.date().nullable(),
  Dicht_wo: z.date().nullable(),
  Open_do: z.date().nullable(),
  Dicht_do: z.date().nullable(),
  Open_vr: z.date().nullable(),
  Dicht_vr: z.date().nullable(),
  Open_za: z.date().nullable(),
  Dicht_za: z.date().nullable(),
  Open_zo: z.date().nullable(),
  Dicht_zo: z.date().nullable(),
  OmschrijvingTarieven: z.string().nullable(),
  IsStationsstalling: z.boolean(),
  IsPopup: z.boolean(),
  NotaVerwijssysteem: z.string().nullable(),
  Tariefcode: z.number().nullable(),
  Toegangscontrole: z.number().nullable(),
  Beheerder: z.string().nullable(),
  BeheerderContact: z.string().nullable(),
  Url: z.string().nullable(),
  ExtraServices: z.string().nullable(),
  dia: z.string().nullable(),
  BerekentStallingskosten: z.boolean(),
  AantalReserveerbareKluizen: z.number(),
  MaxStallingsduur: z.number(),
  HeeftExterneBezettingsdata: z.boolean(),
  ExploitantID: z.string().nullable(),
  hasUniSectionPrices: z.boolean(),
  hasUniBikeTypePrices: z.boolean(),
  shadowBikeparkID: z.string().nullable(),
  BronBezettingsdata: z.string().nullable(),
  reservationCostPerDay: z.number().nullable(),
  wachtlijst_Id: z.bigint().nullable(),
  freeHoursReservation: z.number().nullable(),
  thirdPartyReservationsUrl: z.string().nullable(),
});

export const fietsenstallingCreateSchema = fietsenstallingSchema.omit({
  ID: true
}); 