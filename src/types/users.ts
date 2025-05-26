import type { security_users, security_users_sites, security_roles } from "~/generated/prisma-client";
import type { VSUserSecurityProfile, VSUserSecurityProfileCompact } from "~/types/";

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

export interface VSUserSitesNew {
    SiteID: string;
    IsContact: boolean;
    IsOwnOrganization: boolean;
    newRoleId: VSUserRoleValuesNew;
}

export type VSUserInLijstNew = Pick<security_users, "UserID" | "UserName" | "DisplayName" | "Status" | "SiteID" | "ParentID" | "LastLogin" > & {
    sites: VSUserSitesNew[];
    securityProfile: VSUserSecurityProfileCompact;
}

export type VSUserWithRolesNew = Pick<security_users, "UserID" | "UserName" | "DisplayName" | "Status" | "SiteID" | "ParentID" | "LastLogin" > & {
    sites: VSUserSitesNew[];
    securityProfile: VSUserSecurityProfile;
}
// "EncryptedPassword" | "EncryptedPassword2"

export const securityUserSelectNew = {
    UserID: true,
    UserName: true,
    DisplayName: true,
    Status: true,
    SiteID: true,
    ParentID: true,
    LastLogin: true,
    // EncryptedPassword: true,
    // EncryptedPassword2: true,
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

export const getDefaultSecurityProfile = (): VSUserSecurityProfile => ({
    mainContactId: "",
    roleId: VSUserRoleValuesNew.None,
    rights: {},
    modules: [],
    managingContactIDs:[]
})

export const getDefaultNewUser = (name: string, siteid: string | null): VSUserWithRolesNew => ({
    UserID: 'new',
    UserName: '',
    DisplayName: name,
    Status: "1",
    SiteID: siteid,
    sites: [],
    ParentID: null,
    LastLogin: null,
    securityProfile: getDefaultSecurityProfile()
  });