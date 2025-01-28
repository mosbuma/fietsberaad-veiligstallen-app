import { abonnementsvormen, fietsenstallingtypen, contacts, security_users, security_roles, fietsenstallingen, security_users_sites, modules, contact_contact } from '@prisma/client';

/* This type is used when returning parking details to the client                */
/* By adding fields to this structure, it is possible to keep track which fields */
/* from the "old" database are in use                                            */
export type DayPrefix = 'ma' | 'di' | 'wo' | 'do' | 'vr' | 'za' | 'zo';

export type ParkingSectionPerBikeType = {
    Toegestaan: boolean | null,
    Capaciteit: number | null,
    fietstype: {
        Name: string // Assuming Name is of type string
    }
}

export type ParkingSection = {
    titel: string,
    secties_fietstype: ParkingSectionPerBikeType[] // base data for capacity
}

export type UpdateParkingSectionsData = {
    parkingId: string,
    sectionId: number,
    parkingSections: ParkingSections
}

export type ParkingSections = ParkingSection[];

export type ParkingDetailsType = {
    ID: string,
    Status: string,
    EditorCreated: string,
    Title: string,
    Location: string,
    Postcode: string,
    Plaats: string,
    Type: string,
    SiteID: string,
    StallingsID: string,
    Description: string;
    Image: any;
    Open_ma: Date,
    Dicht_ma: Date,
    Open_di: Date,
    Dicht_di: Date,
    Open_wo: Date,
    Dicht_wo: Date,
    Open_do: Date,
    Dicht_do: Date,
    Open_vr: Date,
    Dicht_vr: Date,
    Open_za: Date,
    Dicht_za: Date,
    Open_zo: Date,
    Dicht_zo: Date,
    Openingstijden: string,
    Capacity: number,
    Coordinaten: string,
    DateCreated: Date,
    DateModified: Date,
    FMS: boolean,
    Beheerder: string,
    BeheerderContact: string,
    BerekentStallingskosten: boolean,
    fietsenstalling_type: fietsenstallingtypen[],
    fietsenstalling_secties: ParkingSections,
    // abonnementen: abonnementsvorm_fietsenstalling[],
    abonnementsvorm_fietsenstalling: {
        SubscriptionTypeID: number,
        BikeparkID: string,
        abonnementsvormen: abonnementsvormen
    }[],
    Tariefcode: number,
    ExtraServices: string,
    // abonnementsvormen: {
    //     ID: string,
    //     naam: string,
    //     omschrijving: string,
    //     prijs: string,
    //     tijdsduur: string,
    //     conditions: string,
    //     siteID: string,
    //     bikeparkTypeID: string,
    //     isActief: string,
    //     exploitantSiteID: string,
    //     idmiddelen: string,
    //     contractID: string,
    //     paymentAuthorizationID: string,
    //     conditionsID: string
    // }[]
    // },
    ExploitantID: string,
    exploitant: {
        ID: string,
        Helpdesk: string,
        CompanyName: string,
    },
    fietsenstallingen_services:
    {
        services: {
            ID: string,
            Name: string
        }
    }[]
}

export type VSUserWithRoles = Pick<security_users, "UserID" | "UserName" | "DisplayName" | "RoleID" | "Status" | "GroupID"> & 
    {
        security_roles: Pick<security_roles, "RoleID" | "Role" | "Description">  | null;
        security_users_sites: Pick<security_users_sites, "SiteID" | "IsContact">[]
    }

export const securityUserSelect = {
    UserID: true,
    UserName: true,
    DisplayName: true,
    RoleID: true,
    Status: true,
    GroupID: true,
    security_roles: {
        select: {
            RoleID: true,
            Role: true,
            Description: true
        }
    },
    security_users_sites: {
        select: {
            SiteID: true,
            IsContact: true
        }
    }
}

export type VSModule = Pick<modules, "ID" | "Name">;
  
export type VSParking = Pick<fietsenstallingen,
"ID" | 
"StallingsID" | 
"Title" |
"Type"
>

export interface VSContactExploitant {
  ID: string;
  Helpdesk: string | null;
  CompanyName: string | null;
  UrlName: string | null;
  Status: string | null;
  isManaging: {
    ID: number;
    childSiteID: string;
    admin: boolean;
  }[];
  isManagedBy: {
    ID: number;
    parentSiteID: string;
    admin: boolean;
  }[];
}

export const exploitantSelect = {
    ID: true,
    CompanyName: true,
    UrlName: true,
    Status: true,
    Helpdesk: true,
    isManagedBy: {
        select: {
            ID: true,
            parentSiteID: true,
            admin: true
        }
    },
    isManaging: {
        select: {
            ID: true,
            childSiteID: true,
            admin: true
        }
    }
}

export type VSContactGemeente = Pick<contacts, 
    "ID" | 
    "CompanyName" | 
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
    };

export const gemeenteSelect = {
    ID: true, 
    CompanyName: true, 
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
    "UrlName" | 
    "Password"
  >

  export const dataproviderSelect = {
    ID: true,
    CompanyName: true,
    UrlName: true,
    Password: true
  }