import { type VSCRUDRight, type VSUserSecurityProfile, VSSecurityTopic } from "~/types/index";    
import { VSModuleValues } from "~/types/modules";
import { type VSContactGemeente, type VSContactExploitant, gemeenteSelect, exploitantSelect } from "~/types/contacts";    
import { type VSUserWithRoles, VSUserRoleValues,VSUserRoleValuesNew } from '~/types/users';

import { changeTopics, initAllTopics } from "~/types/utils";

const allowNone: VSCRUDRight = {
    create: false,
    read: false,
    update: false,
    delete: false
};
const allowCRUD: VSCRUDRight = {
    create: true,
    read: true,
    update: true,
    delete: true
};
const allowRead: VSCRUDRight = {
    create: false,
    read: true,
    update: false,
    delete: false
};
const allowReadUpdate: VSCRUDRight = {
    create: false,
    read: true,
    update: true,
    delete: false
};

// Module access definitions per contact type
// type ModuleAccess = {
//     [key in VSModuleValues]: boolean;
// };

// Role definitions with CRUD rights per topic
export type RoleRights = {
    [key in VSSecurityTopic]?: VSCRUDRight;
};

export const convertRoleToNewRole = (roleID: VSUserRoleValues | null, isOwnOrganization: boolean): VSUserRoleValuesNew => {
    let newRoleID: VSUserRoleValuesNew = VSUserRoleValuesNew.None;

    switch(roleID) {
        case VSUserRoleValues.Root:
            newRoleID = isOwnOrganization ? VSUserRoleValuesNew.RootAdmin : VSUserRoleValuesNew.Admin;
            break;
        case VSUserRoleValues.Exploitant:
        case VSUserRoleValues.InternAdmin:
            newRoleID = VSUserRoleValuesNew.Admin;
            break;
        case VSUserRoleValues.InternEditor:
            newRoleID = VSUserRoleValuesNew.Editor;
            break;
        case VSUserRoleValues.ExploitantDataAnalyst:
        case VSUserRoleValues.InternDataAnalyst:
            newRoleID = VSUserRoleValuesNew.DataAnalyst;
            break;
        case VSUserRoleValues.ExternAdmin:
            newRoleID = isOwnOrganization ? VSUserRoleValuesNew.Admin : VSUserRoleValuesNew.None;
            break;
        case VSUserRoleValues.ExternEditor:
            newRoleID = isOwnOrganization ? VSUserRoleValuesNew.Editor : VSUserRoleValuesNew.None;
            break;
        case VSUserRoleValues.ExternEditor:
            newRoleID = isOwnOrganization ? VSUserRoleValuesNew.Editor : VSUserRoleValuesNew.None;
            break;
        case VSUserRoleValues.ExternDataAnalyst:
            newRoleID = isOwnOrganization ? VSUserRoleValuesNew.DataAnalyst : VSUserRoleValuesNew.None;
            break;
        case VSUserRoleValues.Beheerder:
            newRoleID = isOwnOrganization ? VSUserRoleValuesNew.Admin : VSUserRoleValuesNew.None;
            break;
        default:
            break;
    }

    return newRoleID;
}

export const getRights = (profile: VSUserSecurityProfile | null, topic: VSSecurityTopic): VSCRUDRight => {
    if (!profile) {
        return allowNone;
    }

    const baseRights = profile.rights[topic] || allowNone;
    return baseRights;
}

export const hasModuleAccess = (profile: VSUserSecurityProfile | null, module: VSModuleValues): boolean => {
    if (!profile) {
        return false;
    }

    return profile.modules.includes(module);
}

export const getRoleRights = (
    roleID: VSUserRoleValuesNew | null, 
): RoleRights => {
    const noRights = initAllTopics(allowNone);
    const allrights = initAllTopics(allowCRUD);

    switch(roleID) {
        case VSUserRoleValuesNew.RootAdmin:
            return allrights;
        case VSUserRoleValuesNew.Admin:
            // only root admin gets to manage system settings and users
            return changeTopics(allrights, [
                VSSecurityTopic.System,
                VSSecurityTopic.Development,
            ], allowNone);
        case VSUserRoleValuesNew.Editor:
            return changeTopics(noRights, [
                // VSSecurityTopic.ContactsGemeenten,
                // VSSecurityTopic.ContactsExploitanten,
                // VSSecurityTopic.Report,
                // VSSecurityTopic.Buurtstallingen,
                // VSSecurityTopic.Fietskluizen,
                VSSecurityTopic.Website,
            ], allowCRUD);
        case VSUserRoleValuesNew.DataAnalyst:
            let rights = changeTopics(noRights, [
                VSSecurityTopic.ContactsGemeenten,
                VSSecurityTopic.ContactsExploitanten,
                VSSecurityTopic.Buurtstallingen,
                VSSecurityTopic.Fietskluizen,
                VSSecurityTopic.ApisGekoppeldeLocaties,
            ], allowRead);
            rights = changeTopics(rights, [
                VSSecurityTopic.Report,
            ], allowCRUD);
            return rights;
        case VSUserRoleValuesNew.None:  
            return noRights;
    }   

    return noRights;
};
