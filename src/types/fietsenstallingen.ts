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

export const getDefaultNewFietsenstalling = (name: string): VSFietsenstalling => ({
  ID: "new",
  StallingsID: `T${Date.now().toString().slice(-7)}`,
  SiteID: null,
  Title: name,
  StallingsIDExtern: null,
  Description: null,
  Image: null,
  Location: "",
  Postcode: null,
  Plaats: "",
  Capacity: 0,
  Openingstijden: null,
  Status: "1",
  EditorCreated: null,
  DateCreated: null,
  EditorModified: null,
  DateModified: null,
  Ip: null,
  Coordinaten: null,
  Type: "bewaakt",
  Verwijssysteem: false,
  VerwijssysteemOverzichten: null,
  FMS: false,
  Open_ma: null,
  Dicht_ma: null,
  Open_di: null,
  Dicht_di: null,
  Open_wo: null,
  Dicht_wo: null,
  Open_do: null,
  Dicht_do: null,
  Open_vr: null,
  Dicht_vr: null,
  Open_za: null,
  Dicht_za: null,
  Open_zo: null,
  Dicht_zo: null,
  OmschrijvingTarieven: null,
  IsStationsstalling: false,
  IsPopup: false,
  NotaVerwijssysteem: null,
  Tariefcode: null,
  Toegangscontrole: null,
  Beheerder: null,
  BeheerderContact: null,
  Url: null,
  ExtraServices: null,
  dia: null,
  BerekentStallingskosten: false,
  AantalReserveerbareKluizen: 0,
  MaxStallingsduur: 0,
  HeeftExterneBezettingsdata: false,
  ExploitantID: null,
  hasUniSectionPrices: true,
  hasUniBikeTypePrices: false,
  shadowBikeparkID: null,
  BronBezettingsdata: "FMS",
  reservationCostPerDay: null,
  wachtlijst_Id: null,
  freeHoursReservation: null,
  thirdPartyReservationsUrl: null
});

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
  StallingsID: z.string().max(8).nullable(),
  SiteID: z.string().max(35).nullable(),
  Title: z.string().max(255).nullable(),
  StallingsIDExtern: z.string().max(100).nullable(),
  Description: z.string().nullable(),
  Image: z.string().max(255).nullable(),
  Location: z.string().max(255).nullable(),
  Postcode: z.string().max(7).nullable(),
  Plaats: z.string().max(100).nullable(),
  Capacity: z.number().nullable(),
  Openingstijden: z.string().nullable(),
  Status: z.string().max(4).nullable(),
  EditorCreated: z.string().max(255).nullable(),
  DateCreated: z.string().nullable().transform((val) => val ? new Date(val) : null),
  EditorModified: z.string().max(255).nullable(),
  DateModified: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Ip: z.string().max(24).nullable(),
  Coordinaten: z.string().max(255).nullable(),
  Type: z.string().max(15).nullable(),
  Verwijssysteem: z.boolean(),
  VerwijssysteemOverzichten: z.boolean().nullable(),
  FMS: z.boolean(),
  Open_ma: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Dicht_ma: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Open_di: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Dicht_di: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Open_wo: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Dicht_wo: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Open_do: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Dicht_do: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Open_vr: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Dicht_vr: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Open_za: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Dicht_za: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Open_zo: z.string().nullable().transform((val) => val ? new Date(val) : null),
  Dicht_zo: z.string().nullable().transform((val) => val ? new Date(val) : null),
  OmschrijvingTarieven: z.string().nullable(),
  IsStationsstalling: z.boolean(),
  IsPopup: z.boolean(),
  NotaVerwijssysteem: z.string().nullable(),
  Tariefcode: z.number().nullable(),
  Toegangscontrole: z.number().nullable(),
  Beheerder: z.string().max(100).nullable(),
  BeheerderContact: z.string().max(255).nullable(),
  Url: z.string().nullable(),
  ExtraServices: z.string().nullable(),
  dia: z.string().nullable(),
  BerekentStallingskosten: z.boolean(),
  AantalReserveerbareKluizen: z.number(),
  MaxStallingsduur: z.number(),
  HeeftExterneBezettingsdata: z.boolean(),
  ExploitantID: z.string().max(35).nullable(),
  hasUniSectionPrices: z.boolean(),
  hasUniBikeTypePrices: z.boolean(),
  shadowBikeparkID: z.string().max(35).nullable(),
  BronBezettingsdata: z.string().max(20).nullable(),
  reservationCostPerDay: z.number().nullable(),
  wachtlijst_Id: z.bigint().nullable(),
  freeHoursReservation: z.number().nullable(),
  thirdPartyReservationsUrl: z.string().max(255).nullable(),
});

export const fietsenstallingCreateSchema = z.object({
  StallingsID: z.string().min(1, { message: "StallingsID is verplicht" }).max(8, { message: "StallingsID mag maximaal 8 karakters lang zijn" }),
  Title: z.string().min(1, { message: "Titel is verplicht" }).max(255),
  SiteID: z.string().max(35).nullable().optional(),
  StallingsIDExtern: z.string().max(100).nullable().optional(),
  Description: z.string().nullable().optional(),
  Image: z.string().max(255).nullable().optional(),
  Location: z.string().max(255).nullable().optional(),
  Postcode: z.string().max(7).nullable().optional(),
  Plaats: z.string().max(100).nullable().optional(),
  Capacity: z.number().nullable().optional(),
  Openingstijden: z.string().nullable().optional(),
  Status: z.string().max(4).nullable().optional(),
  EditorCreated: z.string().max(255).nullable().optional(),
  DateCreated: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  EditorModified: z.string().max(255).nullable().optional(),
  DateModified: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Ip: z.string().max(24).nullable().optional(),
  Coordinaten: z.string().max(255).nullable().optional(),
  Type: z.string().max(15).nullable().optional(),
  Verwijssysteem: z.boolean().optional(),
  VerwijssysteemOverzichten: z.boolean().nullable().optional(),
  FMS: z.boolean().optional(),
  Open_ma: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Dicht_ma: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Open_di: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Dicht_di: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Open_wo: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Dicht_wo: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Open_do: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Dicht_do: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Open_vr: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Dicht_vr: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Open_za: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Dicht_za: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Open_zo: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  Dicht_zo: z.string().nullable().optional().transform((val) => val ? new Date(val) : null),
  OmschrijvingTarieven: z.string().nullable().optional(),
  IsStationsstalling: z.boolean().optional(),
  IsPopup: z.boolean().optional(),
  NotaVerwijssysteem: z.string().nullable().optional(),
  Tariefcode: z.number().nullable().optional(),
  Toegangscontrole: z.number().nullable().optional(),
  Beheerder: z.string().max(100).nullable().optional(),
  BeheerderContact: z.string().max(255).nullable().optional(),
  Url: z.string().nullable().optional(),
  ExtraServices: z.string().nullable().optional(),
  dia: z.string().nullable().optional(),
  BerekentStallingskosten: z.boolean().optional(),
  AantalReserveerbareKluizen: z.number().optional(),
  MaxStallingsduur: z.number().optional(),
  HeeftExterneBezettingsdata: z.boolean().optional(),
  ExploitantID: z.string().max(35).nullable().optional(),
  hasUniSectionPrices: z.boolean().optional(),
  hasUniBikeTypePrices: z.boolean().optional(),
  shadowBikeparkID: z.string().max(35).nullable().optional(),
  BronBezettingsdata: z.string().max(20).nullable().optional(),
  reservationCostPerDay: z.number().nullable().optional(),
  wachtlijst_Id: z.bigint().nullable().optional(),
  freeHoursReservation: z.number().nullable().optional(),
  thirdPartyReservationsUrl: z.string().max(255).nullable().optional(),
}); 