import { prisma } from "~/server/db";
import { VSUserWithRoles, VSUserRoleValues, VSModuleValues, VSContactGemeente, VSContactExploitant, gemeenteSelect, exploitantSelect, VSUserRoleValuesNew, VSCRUDRight, VSSecurityTopic } from "~/types";    
import { VSUserSecurityProfile } from "~/types";
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
type ModuleAccess = {
    [key in VSModuleValues]: boolean;
};

// Role definitions with CRUD rights per topic
type RoleRights = {
    [key in VSSecurityTopic]?: VSCRUDRight;
};

const getModuleIDs = async (contactID: string): Promise<VSModuleValues[]> => {
    const modules = await prisma.modules_contacts.findMany({
        where: {
            contact: {
                ID: contactID
            }
        }
    });

    const IDs = modules.map((module) => module.ModuleID) as VSModuleValues[];
    return IDs;
};

const convertRoleToNewRole = (roleID: VSUserRoleValues | null, isOwnOrganization: boolean): VSUserRoleValuesNew => {
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

export const getMainContact = async (user: VSUserWithRoles | undefined): Promise<VSContactGemeente | VSContactExploitant | undefined> => {
    if (!user) {
        console.error("))) GET MAIN CONTACT: No user given");
        return undefined;
    }

    let contact: VSContactGemeente | VSContactExploitant | undefined = undefined;
    switch(user.GroupID) {
        case 'intern': {
            const gemeente = await prisma.contacts.findFirst({ where: { ID: "1" } }) as VSContactGemeente;
            return gemeente;
        }
        case 'extern': {
            // SiteID is not used for extern users

            const relatedSites = user.security_users_sites;
            contact = await prisma.contacts.findFirst({ where: { ID: relatedSites[0]?.SiteID, ItemType: "organizations" } , select: gemeenteSelect }) as VSContactGemeente;
            break;
        }
        case 'exploitant': {
            // first check direct link
            // contact = exploitanten.find((contact) => {
            //     return (
            //         contact.ID === user.SiteID
            //     )
            // });
            contact = await prisma.contacts.findFirst({ where: { ID: user?.SiteID || "", ItemType: "exploitant" } , select: exploitantSelect }) as VSContactExploitant;  
            // check link via parentID
            if(!contact) {
                if(user?.ParentID) {
                    const parentuser = await prisma.security_users.findFirst({ where: { UserID: user.ParentID } });
                    if(parentuser) {
                        contact = await prisma.contacts.findFirst({ where: { ID: parentuser?.SiteID || "", ItemType: "exploitant" } , select: exploitantSelect }) as VSContactExploitant;
                    } else {
                        console.error(`No parent user found for user ${user.DisplayName} [${user.UserName}]`);
                    }
                } else {
                    console.error(`No parentID found for user ${user.DisplayName} [${user.UserName}]`);
                }
            }

            if(!contact) {
                console.error(`No contact found for user ${user.DisplayName} [${user.UserName}]`);
            }
            
            break;
        }
        case 'dataprovider':
            break;
        default:
            break;
    }

    return contact;
}

export const getManagedContacts = async (user: VSUserWithRoles, mainContact: VSContactGemeente | VSContactExploitant | undefined | null): Promise<(VSContactGemeente | VSContactExploitant)[]> => {
    if(!user) return [];

    let managedContacts: (VSContactGemeente | VSContactExploitant)[] = [];
    if(mainContact) {
        managedContacts.push(mainContact);
    }

    const gemeenten = await prisma.contacts.findMany({ where: { ItemType: "organizations" }, select: gemeenteSelect });
    const exploitanten = await prisma.contacts.findMany({ where: { ItemType: "exploitant" }, select: exploitantSelect });

    switch(user.GroupID) {
        case 'intern': {
            if(user.RoleID === VSUserRoleValues.Root || user.RoleID === VSUserRoleValues.InternAdmin) {
                managedContacts.push(...gemeenten.filter((gemeente) => gemeente.ID !== "1"));
                managedContacts.push(...exploitanten);
            } else {
                const list = gemeenten.filter((gemeente) => user.security_users_sites.some((site) => site.UserID === user.UserID && site.SiteID === gemeente.ID));
                managedContacts.push(...list);
                managedContacts.push(...exploitanten);
            }
            break;
        }
        case 'extern':
            // only mainContact is managed
    
            break;
        case 'exploitant':{
            if(mainContact?.isManagingContacts) {
                const managedContactsIDs = mainContact?.isManagingContacts.map((contact) => contact.childSiteID) || [];
                const list = gemeenten.filter((gemeente) => managedContactsIDs.includes(gemeente.ID.toString()));
                managedContacts.push(...list);
            } else {
                console.error(`No managing contacts found for exploitant ${user.DisplayName} [${user.UserName}]`);
            }
            break;
        }
        case 'dataprovider':
            break;
        default:
            break;
    }

    return managedContacts;
}

const getRoleRights = (
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

export const createSecurityProfile = async (
    user: VSUserWithRoles,
    activeContactId?: string | undefined
): Promise<VSUserSecurityProfile> => {

    if (!user) {
        throw new Error("User not found");
    }

    const mainContact = await getMainContact(user);
    const managingContactIDs: string[] = (await getManagedContacts(user, mainContact)).map((contact) => contact.ID);
    const modules: VSModuleValues[] = activeContactId ? await getModuleIDs(activeContactId) : [];

    // map old groupID / RoleID values to new RoleID values for simplified RBAC
    const newRoleID = convertRoleToNewRole(user.RoleID, activeContactId ? mainContact?.ID === activeContactId : false);
    const rights = getRoleRights(newRoleID);

    const profile: VSUserSecurityProfile = {
        modules,
        roleId: newRoleID,
        rights,
        mainContactId: mainContact?.ID || "",
        managingContactIDs,
    };

    return profile;
}