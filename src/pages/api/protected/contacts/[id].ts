import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { z } from "zod";
import { generateID, validateUserSession, updateSecurityProfile } from "~/utils/server/database-tools";
import { contactSchema, contactCreateSchema, getDefaultNewContact } from "~/types/database";
import { type VSContact, VSContactItemType, contactSelect } from "~/types/contacts";

export type ContactResponse = {
  data?: VSContact;
  error?: string;
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    console.error("Unauthorized - no session found");
    res.status(401).json({error: "Niet ingelogd - geen sessie gevonden"}); // Unauthorized
    return;
  }

  const validateUserSessionResult = await validateUserSession(session, "contacts");
  if ('error' in validateUserSessionResult) {
    console.error("Unauthorized - invalid session", validateUserSessionResult.error);
    res.status(401).json({error: validateUserSessionResult.error}); // Unauthorized
    return;
  }

  const { sites, userId } = validateUserSessionResult;

  const id = req.query.id as string;
  if (!sites.includes(id) && id !== "new") {
    console.error("Unauthorized - no access to this contact", id);
    res.status(403).json({ error: "Geen toegang tot dit contact" });
    return;
  }

  switch (req.method) {
    case "GET": {
      if (id === "new") {
        // add timestamp to the name
        const defaultRecord = getDefaultNewContact('Nieuw ' + new Date().toISOString());
        res.status(200).json({data: defaultRecord});
        return;
      }

      const contact = (await prisma.contacts.findFirst({
        where: {
          ID: id,
          ItemType: VSContactItemType.Organizations,
        },
        select: contactSelect
      })) as unknown as VSContact;
      res.status(200).json({data: contact});
      break;
    }
    case "POST": {
      try {
        const newID = generateID();
        const data = { ...req.body, ID: newID };

        const parseResult = contactCreateSchema.safeParse(data);
        if (!parseResult.success) {
          console.error("Ongeldige of ontbrekende gegevens:", JSON.stringify(parseResult.error.errors,null,2));
          res.status(400).json({ error: parseResult.error.errors });
          return;
        }
        const parsed = parseResult.data;

        const newData = {
          ID: newID,
          // Required fields
          ItemType: VSContactItemType.Organizations,
          FirstName: parsed.FirstName,
          LastName: parsed.LastName,
          Status: "1", // Default status
            
          // Optional fields with defaults
          Email1: parsed.Email1 ?? undefined,
          Phone1: parsed.Phone1 ?? undefined,
          Mobile1: parsed.Mobile1 ?? undefined,
          JobTitle: parsed.JobTitle ?? undefined,
          Notes: parsed.Notes ?? undefined,
          DateRegistration: parsed.DateRegistration ?? undefined,
        }

        const newContact = await prisma.contacts.create({data: newData, select: contactSelect}) as unknown as VSContact;
        if(!newContact) {
          console.error("Fout bij het aanmaken van nieuw contact:", newData);
          res.status(500).json({error: "Fout bij het aanmaken van nieuw contact"});
          return;
        }

        // add a record to the security_users_sites table that links the new contact to the user's sites
        const newLink = await prisma.security_users_sites.create({
          data: {
            UserID: userId,
            SiteID: newContact.ID,
            IsContact: true
          }
        });
        if(!newLink) {
          console.error("Fout bij het aanmaken van koppeling naar nieuw contact:", newContact.ID);
          res.status(500).json({error: "Fout bij het aanmaken van koppeling naar nieuw contact"});
          return;
        }

        // Update security profile
        const { session: updatedSession, error: profileError } = await updateSecurityProfile(session, userId);
        if (profileError) {
          console.error("Fout bij het bijwerken van beveiligingsprofiel:", profileError);
          res.status(500).json({error: profileError});
          return;
        }

        res.status(201).json({ 
          data: [newContact],
          session: updatedSession
        });
      } catch (e) {
        console.error("Fout bij het aanmaken van contact:", e);
        res.status(500).json({error: "Fout bij het aanmaken van contact"});
      }
      break;
    }
    case "PUT": {
      try {
        const parseResult = contactSchema.partial().safeParse(req.body);
        if (!parseResult.success) {
          console.error("Unexpected/missing data error:", parseResult.error);
          res.status(400).json({error: "Ongeldige of ontbrekende gegevens"});
          return;
        }

        const parsed = parseResult.data;

        const updatedContact = await prisma.contacts.update({
          select: contactSelect,
          where: { ID: id },
          data: {
            FirstName: parsed.FirstName,
            LastName: parsed.LastName,
            Email1: parsed.Email1 ?? undefined,
            Phone1: parsed.Phone1 ?? undefined,
            Mobile1: parsed.Mobile1 ?? undefined,
            JobTitle: parsed.JobTitle ?? undefined,
            Notes: parsed.Notes ?? undefined,
            CompanyLogo: parsed.CompanyLogo ?? undefined,
            CompanyLogo2: parsed.CompanyLogo2 ?? undefined,
            DateRegistration: parsed.DateRegistration === null ? null : parsed.DateRegistration ? new Date(parsed.DateRegistration) : undefined,
            DateConfirmed: parsed.DateConfirmed === null ? null : parsed.DateConfirmed ? new Date(parsed.DateConfirmed) : undefined,
            DateRejected: parsed.DateRejected === null ? null : parsed.DateRejected ? new Date(parsed.DateRejected) : undefined,
          }
        });
        console.log("==updatedContact", updatedContact);
        res.status(200).json({data: updatedContact});
      } catch (e) {
        if (e instanceof z.ZodError) {
          console.error("Ongeldige of ontbrekende gegevens:", JSON.stringify(e.errors,null,2));
          res.status(400).json({ error: e.errors });
        } else {
          res.status(500).json({error: "Fout bij het bijwerken van het contact"});
        }
      }
      break;
    }
    case "DELETE": {
      try {
        await prisma.contacts.delete({
          where: { ID: id }
        });
        res.status(200).json({});
      } catch (e) {
        console.error("Fout bij het verwijderen van het contact:", e);
        res.status(500).json({error: "Fout bij het verwijderen van het contact"});
      }
      break;
    }
    default: {
      res.status(405).json({error: "Methode niet toegestaan"}); // Method Not Allowed
    }
  }
}