import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { type VSContact, VSContactItemType, contactSelect } from "~/types/contacts";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { validateUserSession } from "~/utils/server/database-tools";
import { contactSchema } from "~/types/database";

export const contactValidationSchema = z.object({
  FirstName: z.string().min(1, "Voornaam is verplicht"),
  LastName: z.string().min(1, "Achternaam is verplicht"),
  Email: z.string().email("Ongeldig e-mailadres").optional(),
  Phone: z.string().optional(),
  Mobile: z.string().optional(),
  Function: z.string().optional(),
  Notes: z.string().optional(),
});

export type ContactValidationSchema = z.infer<typeof contactValidationSchema>;

export type ContactValidateResponse = {
  valid: boolean;
  message: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    console.error("Niet geautoriseerd - geen sessie gevonden");
    res.status(401).json({valid: false, error: "Niet geautoriseerd - geen sessie gevonden"}); // Unauthorized
    return;
  }

  const validateUserSessionResult = await validateUserSession(session, "contacts");
  if ('error' in validateUserSessionResult) {
    console.error("Niet geautoriseerd - ongeldige sessie", validateUserSessionResult.error);
    res.status(401).json({valid: false, error: validateUserSessionResult.error}); // Unauthorized
    return;
  }

  switch (req.method) {
    case "GET": {
      const id = req.query.id as string;
      if (!id) {
        res.status(400).json({valid: false, message: "Geen id opgegeven"});
        return;
      }

      if (!validateUserSessionResult.sites.includes(id)) {
        res.status(403).json({ valid: false, error: "Geen toegang tot dit contact" });
        return;
      }

      const contact = await prisma.contacts.findUnique({
        where: {
          ID: id,
          ItemType: VSContactItemType.Organizations
        },
        select: contactSelect
      });

      if (!contact) {
        res.status(404).json({valid: false, message: "Contact niet gevonden"});
        return;
      }

      // Validate the contact against the schema
      const parseResult = contactSchema.safeParse(contact);
      if (!parseResult.success) {
        res.status(200).json({
          valid: false,
          message: parseResult.error.issues.map(e => e.message).join(", ")
        });
        return;
      }

      res.status(200).json({valid: true, message: ""});
      break;
    }
    case "POST": {
      // get id from the query params and the data from the body
      const data = req.body as VSContact | undefined;
      if(!data) {
        res.status(400).json({valid: false, message: "Geen data opgegeven"});
        return;
      }

      if(!data.ID) {
        res.status(200).json({valid: false, message: "Geen id opgegeven"});
        return;
      }

      if (!validateUserSessionResult.sites.includes(data.ID) && data.ID !== "new") {
        res.status(403).json({ valid: false, error: "Geen toegang tot dit contact" });
        return;
      }

      // check data against zod schema
      let parseResult;
      const isNew = data.ID === "new";
      if(isNew) {
        parseResult = contactSchema.omit({ID: true}).safeParse(data); // will be set later
      } else {
        parseResult = contactSchema.safeParse(data);
      }

      if (!parseResult.success) {
        res.status(200).json({valid: false, message: parseResult.error.issues.map(e => e.message).join(", ")});
        return;
      }

      // Check for unique fields
      const uniqueFields: {field: keyof VSContact, message: string}[] = [
        {field: "Email1", message: "Er bestaat al een contact met dit e-mailadres"},
        {field: "Phone1", message: "Er bestaat al een contact met dit telefoonnummer"},
        {field: "Mobile1", message: "Er bestaat al een contact met dit mobiele nummer"}
      ];

      const oldValues = !isNew ? await prisma.contacts.findUnique({
        where: {
          ID: data.ID,
        },
        select: contactSelect
      }) : undefined;

      for(const field of uniqueFields) {
        // Skip if the field is managesFietsenstallingen as it's a relation
        if (field.field === 'managesFietsenstallingen') continue;

        const isChanged = oldValues && (oldValues?.[field.field] !== data[field.field]);
        // check if the field value has changed
        if(isNew || isChanged) {
          const duplicate = await prisma.contacts.findFirst({
            where: {
              [field.field]: data[field.field],
              ItemType: VSContactItemType.Organizations
            },
          });

          if(duplicate) {
            res.status(200).json({valid: false, message: field.message});
            return;
          }      
        }
      }

      res.status(200).json({valid: true, message: ""});
      break;
    }
   default: {
      res.status(405).json({valid: false, message: "Deze methode is niet toegestaan"}); // Method Not Allowed
    }
  }
} 