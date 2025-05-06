import type { security_users, security_users_sites, security_roles } from "@prisma/client";
import type { VSUserSecurityProfile } from "~/types/";

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

export type VSUserWithRolesNew = Pick<security_users, "UserID" | "UserName" | "DisplayName" | "Status" | "SiteID" | "ParentID" | "LastLogin"> & {
    Password?: string;
    sites: VSUserSitesNew[];
    securityProfile: VSUserSecurityProfile;
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
