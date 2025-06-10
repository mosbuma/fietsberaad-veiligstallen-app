import { prisma } from "~/server/db";
import { type VSCRUDRight, type VSUserSecurityProfile, VSSecurityTopic, VSUserSecurityProfileCompact } from "~/types/index";    
import { VSModuleValues } from "~/types/modules";
import { type VSContactGemeente, type VSContactExploitant, gemeenteSelect, exploitantSelect } from "~/types/contacts";    
import { type VSUserWithRoles, VSUserGroupValues, VSUserRoleValues,VSUserRoleValuesNew } from '~/types/users';

import { convertRoleToNewRole, getRoleRights } from "~/utils/securitycontext";

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

export const getMainContactId = (user: VSUserWithRoles): string | undefined => {
    switch(user.GroupID) {
        case 'intern': {
            return "1";
        }
        case 'extern': {
            const relatedSites = user.security_users_sites;
            return relatedSites[0]?.SiteID
        }
        case 'exploitant': {
            return user?.SiteID || undefined;
        }
        case 'dataprovider':
        default:
            return undefined;
    }
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

export const getManagedContacts = async (user: VSUserWithRoles): Promise<(VSContactGemeente | VSContactExploitant)[]> => {
    if(!user) return [];

    let mainContact = await getMainContact(user);

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

export const createSecurityProfile = async (
    user: VSUserWithRoles,
    activeContactId?: string | undefined
): Promise<VSUserSecurityProfile> => {
    if (!user) {
        throw new Error("User not found");
    }

    console.log("*** USER", user.user_contact_roles);

    // map old groupID / RoleID values to new RoleID values for simplified RBAC
    const mainContactId = getMainContactId(user) || "";
    //const newRoleID = (user?.user_contact_roles[0]?.NewRoleID as VSUserRoleValuesNew) || VSUserRoleValuesNew.None;
    const newRoleID = convertRoleToNewRole(user.RoleID, activeContactId ? mainContactId === activeContactId : false);
    const rights = getRoleRights(newRoleID);

    const managingContactIDs: string[] = (await getManagedContacts(user)).map((contact) => contact.ID);
    const modules: VSModuleValues[] = activeContactId ? await getModuleIDs(activeContactId) : [];

    const profile: VSUserSecurityProfile = {
        roleId: newRoleID,
        groupId: user.GroupID as VSUserGroupValues,
        rights,
        mainContactId,
        modules,
        managingContactIDs,
    };
    return profile;
}

export const createSecurityProfileCompact = (
    user: VSUserWithRoles,
    activeContactId?: string | undefined
): VSUserSecurityProfileCompact => {
    if (!user) {
        throw new Error("User not found");
    }

    // map old groupID / RoleID values to new RoleID values for simplified RBAC
    const mainContactId = getMainContactId(user) || "";
    const newRoleID = convertRoleToNewRole(user.RoleID, activeContactId ? mainContactId === activeContactId : false);
    const rights = getRoleRights(newRoleID);

    const profile: VSUserSecurityProfileCompact = {
        roleId: newRoleID,
        rights,
        // modules,
        mainContactId: mainContactId || "",
        // managingContactIDs,
    };
    return profile;
}