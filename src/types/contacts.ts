import type { contacts } from "@prisma/client";
import type { VSParking } from "~/types/parking";
import type { VSModule } from "~/types/modules";

export interface VSContactExploitant {
    ID: string;
    Helpdesk: string | null;
    CompanyName: string | null;
    ItemType: string | null;
    UrlName: string | null;
    Status: string | null;
    ParentID: string | null;
    isManagingContacts: {
      ID: number;
      childSiteID: string;
      admin: boolean;
    }[];
    isManagedByContacts: {
      ID: number;
      parentSiteID: string;
      admin: boolean;
    }[];
    modules_contacts: {
      module: VSModule;
    }[];
  }
  
  export const exploitantSelect = {
      ID: true,
      CompanyName: true,
      ItemType: true,
      UrlName: true,
      Status: true,
      Helpdesk: true,
      ParentID: true,
      isManagedByContacts: {
          select: {
              ID: true,
              parentSiteID: true,
              admin: true
          }
      },
      isManagingContacts: {
          select: {
              ID: true,
              childSiteID: true,
              admin: true
          }
      },
      modules_contacts: {
          select: {
              module: {
                  select: {
                      ID: true,
                      Name: true
                  }
              }
          }
      }
  }
  
  export type VSContactGemeente = Pick<contacts, 
      "ID" | 
      "CompanyName" |
      "ItemType" | 
      "AlternativeCompanyName" | 
      "UrlName" | 
      "ZipID" | 
      "Helpdesk" | 
      "DayBeginsAt" | 
      "Coordinaten" | 
      "Zoom" | 
      "Bankrekeningnr" | 
      "PlaatsBank" | 
      "Tnv" | 
      "Notes" | 
      "DateRegistration" | 
      "CompanyLogo" | 
      "CompanyLogo2" |
      "ThemeColor1" |
      "ThemeColor2" 
  > & {
          fietsenstallingen_fietsenstallingen_SiteIDTocontacts?: VSParking[];
      } & {
          modules_contacts?: { module: VSModule }[];
      } & {
          isManagingContacts?: {
              ID: number;
              childSiteID: string;
              admin: boolean;
          }[];
      } & {   
          isManagedByContacts?: {
              ID: number;
              parentSiteID: string;
              admin: boolean;
          }[];
      };
  
  export const gemeenteSelect = {
      ID: true, 
      CompanyName: true, 
      ItemType: true,
      AlternativeCompanyName: true,
      UrlName: true,
      ZipID: true,
      Helpdesk: true,
      CompanyLogo: true,
      CompanyLogo2: true,
      ThemeColor1: true,
      ThemeColor2: true,
      DayBeginsAt: true,
      Coordinaten: true,
      Zoom: true,
      Bankrekeningnr: true,
      PlaatsBank: true,
      Tnv: true,
      Notes: true,
      DateRegistration: true,
      fietsenstallingen_fietsenstallingen_SiteIDTocontacts: {
        select: {
          ID: true,
          Title: true,
          StallingsID: true,
          Type: true,
        }
      },
      isManagingContacts: {
          select: {
              ID: true,
              childSiteID: true,
              admin: true
          }
      },
      isManagedByContacts: {
          select: {
              ID: true,
              parentSiteID: true,
              admin: true
          }
      },
      modules_contacts: {
        select: {
          module: {
              select : {
                  ID: true,
                  Name: true
              }
          }
        }
      }
    }
  
  export type VSContactDataprovider = Pick<contacts,
  "ID" |
  "CompanyName" |
  "ItemType" |
  "UrlName" | 
  "Password"
  >
  
  export const dataproviderSelect = {
  ID: true,
  CompanyName: true,
  ItemType: true,
  UrlName: true,
  Password: true
  }
  
  export type VSContact = VSContactGemeente | VSContactDataprovider | VSContactExploitant;
    