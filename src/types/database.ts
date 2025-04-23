import { z } from "zod";

// Custom validation for the ID format (e.g., 0199B305-F1B5-408D-9D4927EBA0F9A80D)
export const idSchema = z.string().refine(
  (id) => {
    // Check if the ID matches the pattern: XXXX-XXXX-XXXXXXXXXXXXXXXX
    const regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{16}$/i;
    return regex.test(id);
  },
  {
    message: "ID must be in the format XXXX-XXXX-XXXXXXXXXXXXXXXX (hexadecimal, uppercase)",
  }
);

// Valid item types
export const itemTypeEnum = z.enum(["admin", "dataprovider", "exploitant", "organization"]);

// Schema for validation
export const exploitantSchema = z.object({
  ID: idSchema,
  Helpdesk: z.string().nullable().optional(),
  CompanyName: z.string().min(1).max(100),
  ItemType: itemTypeEnum,
  UrlName: z.string().nullable().optional(),
  Status: z.string().nullable().optional(),
  ParentID: z.string().nullable().optional(),
});
  // DateRegistration: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  // DateConfirmed: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  // DateRejected: z.union([z.string().datetime(), z.date(), z.null()]).optional(),

// Schema for Prisma updates
// use partial to allow optional fields
export const exploitantCreateSchema = exploitantSchema.omit({ ID: true });

// Schema for validation
export const gemeenteSchema = z.object({
  ID: idSchema,
  CompanyName: z.string().min(1).max(100),
  ItemType: itemTypeEnum,
  AlternativeCompanyName: z.string().nullable().optional(),
  UrlName: z.string().nullable().optional(),
  ZipID: z.string().refine(
    (val) => val === undefined || val === null || val.length === 2 || val.length === 4,
    { message: "ZipID must be either 2 or 4 characters long" }
  ).nullable().optional(),
  Helpdesk: z.string().nullable().optional(),
  CompanyLogo: z.string().nullable().optional(),
  CompanyLogo2: z.string().nullable().optional(),
  ThemeColor1: z.string().length(6).regex(/^[0-9a-fA-F]{6}$/).optional(),
  ThemeColor2: z.string().length(6).regex(/^[0-9a-fA-F]{6}$/).optional(),
  DayBeginsAt: z.union([z.string().datetime(), z.date()]).optional(),
  Coordinaten: z.string().max(100).regex(/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/).optional(),
  Zoom: z.number().int().min(0).max(22).optional(),
  Bankrekeningnr: z.string().nullable().optional(),
  PlaatsBank: z.string().nullable().optional(),
  Tnv: z.string().nullable().optional(),
  Notes: z.string().nullable().optional(),
  DateRegistration: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  DateConfirmed: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  DateRejected: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
});

export const gemeenteCreateSchema = gemeenteSchema.omit({ ID: true });
