import { VSUserGroupValues, VSUserRoleValuesNew } from './users';
import { VSModuleValues } from './modules';
import { fietsenstallingtypen } from '@prisma/client';
import { abonnementsvormen } from '@prisma/client';
import { ParkingSections } from './parking';

/* This type is used when returning parking details to the client                */
/* By adding fields to this structure, it is possible to keep track which fields */
/* from the "old" database are in use                                            */
export type DayPrefix = 'ma' | 'di' | 'wo' | 'do' | 'vr' | 'za' | 'zo';

export type VSUserSecurityProfileCompact = {
    groupId: VSUserGroupValues;
    roleId: VSUserRoleValuesNew;
    rights: {
        [key in VSSecurityTopic]?: VSCRUDRight;
    };
    mainContactId: string;
};

// Adds all items that are fetched separately from the database (slow, use at record level, not in lists)
export type VSUserSecurityProfile = VSUserSecurityProfileCompact & {
    modules: VSModuleValues[];
    managingContactIDs: string[];
};

export enum VSSecurityTopic {
    "Abonnementen" = "abonnementen",
    // "Abonnementsvormen" = "abonnementsvormen",
    "Accounts" = "accounts",
    "ApisGekoppeldeLocaties" = "apisgekoppeldelocaties",
    "ApisOverzicht" = "apisoverzicht",
    // "ArticlesAbonnementen" = "articlesabonnementen",
    // "ArticlesArticles" = "articlesarticles",
    // "ArticlesBuurtstallingen" = "articlesbuurtstallingen",
    // "ArticlesFietskluizen" = "articlesfietskluizen",
    // "ArticlesPages" = "articlespages",
    // "BarcodereeksenFietsstickers" = "barcodereeksenfietsstickers",
    "BarcodereeksenSleutelhangers" = "barcodereeksensleutelhangers",
    // "BarcodereeksenUitgifteBarcodes" = "barcodereeksenuitgiftebarcodes",
    "Buurtstallingen" = "buurtstallingen",
    // "ContactsAdmin" = "contactsadmin",
    "ContactsDataproviders" = "contactsdataproviders",
    "ContactsExploitanten" = "contactsexploitanten",
    "ContactsGemeenten" = "contactsgemeenten",
    // "Database" = "database",
    "Development" = "development",
    "Documents" = "documents",
    // "ExploreExploitanten" = "exploreexploitanten",
    // "ExploreGemeenten" = "exploregemeenten",
    // "ExploreUsers" = "exploreusers",
    // "Export" = "export",
    // "Faq" = "faq",
    // "Fietsenstallingen" = "fietsenstallingen",
    "Fietskluizen" = "fietskluizen",
    // "Home" = "home",
    // "Logboek" = "logboek",
    "Presentations" = "presentations",
    // "Products" = "products",
    "Report" = "report",
    // "Settings" = "settings",
    // "StallingInfo" = "stallinginfo",
    "System" = "system",
    // "UsersBeheerders" = "usersbeheerders",
    "UsersGebruikersbeheer" = "usersgebruikersbeheer",
    "Website" = "website",
}

export enum VSMenuTopic {
    // "Abonnementen" = "abonnementen",
    // "Abonnementsvormen" = "abonnementsvormen",
    "Accounts" = "accounts",
    "ApisGekoppeldeLocaties" = "apisgekoppeldelocaties",
    "ApisOverzicht" = "apisoverzicht",
    "ArticlesAbonnementen" = "articlesabonnementen",
    "ArticlesArticles" = "articlesarticles",
    "ArticlesBuurtstallingen" = "articlesbuurtstallingen",
    "ArticlesFietskluizen" = "articlesfietskluizen",
    "ArticlesPages" = "articlespages",
    // "BarcodereeksenFietsstickers" = "barcodereeksenfietsstickers",
    // "BarcodereeksenSleutelhangers" = "barcodereeksensleutelhangers",
    // "BarcodereeksenUitgifteBarcodes" = "barcodereeksenuitgiftebarcodes",
    "Buurtstallingen" = "buurtstallingen",
    "ContactsAdmin" = "contactsadmin",
    "ContactsDataproviders" = "contactsdataproviders",
    "ContactsExploitanten" = "contactsexploitanten",
    "ContactsGemeenten" = "contactsgemeenten",
    "Database" = "database",
    "Development" = "development",
    "Documents" = "documents",
    "ExploreExploitanten" = "exploreexploitanten",
    "ExploreGemeenten" = "exploregemeenten",
    "ExploreUsers" = "exploreusers",
    "ExplorePages" = "explorepages",
    "Export" = "export",
    "Faq" = "faq",
    "Fietsenstallingen" = "fietsenstallingen",
    "Fietskluizen" = "fietskluizen",
    "Home" = "home",
    "Logboek" = "logboek",
    // // "Presentations" = "presentations",
    // "Products" = "products",
    "Report" = "report",
    "Settings" = "settings",
    "SettingsGemeente" = "settingsgemeente",
    "SystemSettings" = "systemsettings",
    "UsersBeheerders" = "usersbeheerders",
    "UsersGebruikersbeheerFietsberaad" = "usersgebruikersbeheerfietsberaad",
    "UsersGebruikersbeheerGemeente" = "usersgebruikersbeheergemeente",
    "UsersGebruikersbeheerExploitant" = "usersgebruikersbeheerexploitant",
    "UsersGebruikersbeheerBeheerder" = "usersgebruikersbeheerbeheerder",
    "Website" = "website",

    "ExploreLeftMenu" = "exploreleftmenu",
    "TestDatabaseApi" = "testdatabaseapi",
}

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

export type UitzonderingOpeningstijden = {
  ID: string,
  closingDateTime: Date,
  fietsenstallingsID: string,
  openingDateTime: Date,
}

export type UpdateParkingSectionsData = {
  parkingId: string,
  sectionId: number,
  parkingSections: ParkingSections
}


// Define basic types for the RBAC system
export type VSCRUDRight = {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
};
export type UitzonderingenOpeningstijden = UitzonderingOpeningstijden[];

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
  uitzonderingenopeningstijden: UitzonderingenOpeningstijden,
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
