import { abonnementsvormen, fietsenstallingtypen, contacts, security_users, security_roles, fietsenstallingen, security_users_sites, modules } from '@prisma/client';

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

export enum VSUserGroupValues {
    Intern = "intern",
    Extern = "extern",
    Exploitant = "exploitant",
    Beheerder = "beheerder",
}

export type VSUserRole = Pick<security_roles, "RoleID" | "Role" | "GroupID" | "Description">;

export enum VSUserRoleValues {
    Root = 1,
    InternAdmin = 2,
    InternEditor = 3,
    ExternAdmin = 4,
    ExternEditor = 5,
    Exploitant = 6,
    Beheerder = 7,
    ExploitantDataAnalyst = 8,
    InternDataAnalyst = 9,
    ExternDataAnalyst = 10
}

export enum VSUserRoleValuesNew {
    RootAdmin = "rootadmin",
    None = 'none',
    Admin = 'admin',
    Editor = 'editor',
    DataAnalyst = 'dataanalyst',
}

export type VSUserWithRoles = Pick<security_users, "UserID" | "UserName" | "DisplayName" | "RoleID" | "Status" | "GroupID" | "SiteID" | "ParentID" | "LastLogin"> & 
    {
        security_roles: VSUserRole | null;
        security_users_sites: Pick<security_users_sites, "UserID" | "SiteID" | "IsContact">[]
    }

export const securityUserSelect = {
    UserID: true,
    UserName: true,
    DisplayName: true,
    RoleID: true,
    Status: true,
    GroupID: true,
    SiteID: true,
    ParentID: true,
    LastLogin: true,
    security_roles: {
        select: {
            RoleID: true,
            Role: true,
            Description: true,
            GroupID: true
        }
    },
    security_users_sites: {
        select: {
            UserID: true,
            SiteID: true,
            IsContact: true
        }
    }
}

export type VSModule = Pick<modules, "ID" | "Name">;

export enum VSModuleValues {
    Abonnementen = "abonnementen",
    Buurtstallingen = "buurtstallingen",
    Fietskluizen = "fietskluizen",
    Fms = "fms",
    Veiligstallen = "veiligstallen"
}
  
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

export type VSContact = VSContactGemeente & VSContactDataprovider & VSContactExploitant;

export type VSUserSecurityProfile = {
    modules: VSModuleValues[];
    roleId: VSUserRoleValuesNew;
    rights: {
        [key in VSSecurityTopic]?: VSCRUDRight;
    };
    mainContactId: string;
    managingContactIDs: string[];
};

export interface SessionUser {
    id: string;
    name: string;
    email: string;
    activeContactId: string | null;
    securityProfile: VSUserSecurityProfile;
}

export interface Session {
    user?: SessionUser;
    expires: string;
}

export enum VSSecurityTopic {
    Abonnementen = "abonnementen",
    ApiAccess = "api_access",
    Apis = "apis",
    Beheerder = "beheerder",
    Buurtstallingen = "buurtstallingen",
    Dataproviders = "dataproviders",
    Diashow = "diashow",
    Exploitant = "exploitant",
    Exploitanten = "exploitanten",
    ExternalApis = "externalApis",
    Fietskluizen = "fietskluizen",
    Gemeente = "gemeente",
    Locaties = "locaties",
    Locations = "locations",
    Permits = "permits",
    Registranten = "registranten",
    Reports = "reports",
    Sleutelhangerreeksen = "sleutelhangerreeksen",
    Sleutelhangers = "sleutelhangers",
    Stickers = "stickers",
    System = "system",
    SystemUsers = "systemusers",
    Users = "users",
    View = "view",
    Website = "website",
}

// Define basic types for the RBAC system
export type VSCRUDRight = {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
};