import { VSUserRoleValuesNew } from './users';
import { VSModuleValues } from './modules';

/* This type is used when returning parking details to the client                */
/* By adding fields to this structure, it is possible to keep track which fields */
/* from the "old" database are in use                                            */
export type DayPrefix = 'ma' | 'di' | 'wo' | 'do' | 'vr' | 'za' | 'zo';

export type VSUserSecurityProfile = {
    modules: VSModuleValues[];
    roleId: VSUserRoleValuesNew;
    rights: {
        [key in VSSecurityTopic]?: VSCRUDRight;
    };
    mainContactId: string;
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
    "UsersBeheerders" = "usersbeheerders",
    "UsersGebruikersbeheer" = "usersgebruikersbeheer",
    "Website" = "website",

    "UnderConstruction" = "underconstruction",
}



// Define basic types for the RBAC system
export type VSCRUDRight = {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
};