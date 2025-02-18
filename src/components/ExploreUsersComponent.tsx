import { useEffect, useState } from "react";
import { VSUserWithRoles, VSRole, VSGroup, VSContact, VSContactDataprovider, VSContactGemeente, VSContactExploitant } from "~/types";
import { useRouter } from "next/router";
import Link from "next/link";
interface ExploreUsersComponentProps {
    users: VSUserWithRoles[]
    roles: VSRole[]
    gemeenten: VSContactGemeente[]
    exploitanten: VSContactExploitant[]
    dataproviders: VSContactDataprovider[]
}

// returns an array of user IDs for users that have a mismatch between GroupID in security_users and GroupID in security_roles together with the reason
export const getDubiousUserIDs = (users: VSUserWithRoles[]) => {  
    const dubiousUserIDs: {UserID: string, Reasons: string[]}[] = [];

    const addReason = (userID: string, reason: string) => {
        const dubiousUser = dubiousUserIDs.find((dubiousUser) => dubiousUser.UserID === userID);
        if(dubiousUser) {
            // check if the reason is already in the array to prevent duplicates
            if(!dubiousUser.Reasons.includes(reason)) {
                dubiousUser.Reasons.push(reason);
            }
        } else {
            dubiousUserIDs.push({UserID: userID, Reasons: [reason]});
        }
    }
    // add all users that have a mismatch between GroupID in security_users and GroupID in security_roles
    const groupMismatch = users.filter((user) => {
        return (user.GroupID !== user.security_roles?.GroupID)
    });

    groupMismatch.forEach((user) => {
        addReason(user.UserID, `User GroupID ${user.GroupID} does not match security_roles GroupID ${user.security_roles?.GroupID}`);
    });

    const roleMismatch = users.filter((user) => user.RoleID !== user.security_roles?.RoleID);
    roleMismatch.forEach((user) => {
        addReason(user.UserID, `User RoleID ${user.RoleID} does not match security_roles RoleID ${user.security_roles?.RoleID}`);
    });

    const noLinkedSites = users.filter((user) => user.security_users_sites.length === 0 && user.SiteID === null);
    noLinkedSites.forEach((user) => {
        addReason(user.UserID, `User has no linked sites`);
    });

    const noAdminRole = users.filter((user) => user.RoleID === 7 || user.security_roles?.RoleID === 7);
    noAdminRole.forEach((user) => {
        addReason(user.UserID, `User has RoleID 7 (beheerder) - looks like these are not allowed to login`);
    });

    return dubiousUserIDs;
}

const ExploreUsersComponent = (props: ExploreUsersComponentProps) => {   
    const router = useRouter();

    const queryUserID = Array.isArray(router.query.userID) ? router.query.userID[0] : router.query.userID;

    const { roles, users, gemeenten, exploitanten } = props;
    const [filteredUsers, setFilteredUsers] = useState<VSUserWithRoles[]>(users);
    const [selectedUserID, setSelectedUserID] = useState<string | null>(queryUserID || null);

    const [emailFilter, setEmailFilter] = useState<string>("");
    const [groupFilter, setGroupFilter] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
    const [contactFilter, setContactFilter] = useState<"Yes" | "No">("No");
    const [gemeenteFilter, setGemeenteFilter] = useState<string>("");
    const [exploitantFilter, setExploitantFilter] = useState<string>("");
    const [invalidDataFilter, setInvalidDataFilter] = useState<"Yes" | "No" | "Only">("No");
    const [inactiveUserFilter, setInactiveUserFilter] = useState<"Yes" | "No" | "Only">("Yes");

    const groups = Object.values(VSGroup);

    const dubiousUserIDs = getDubiousUserIDs(users);
    const selectedUser = users.find(user => user.UserID === selectedUserID);

    useEffect(() => {
        const currentUserID = router.query.userID;
        if (currentUserID && currentUserID !== selectedUserID) {
                setSelectedUserID(currentUserID as string);
            }
    }, [router.query.userID]);

    useEffect(() => {
        if(router.query.userID !== selectedUserID) {
            if(selectedUserID) {
            router.push({
                pathname: router.pathname,
                    query: { ...router.query, userID: selectedUserID }
                });
            }
        } else {
            // delete userID from router query
            const { userID, ...rest } = router.query;
            router.push({
                pathname: router.pathname,
                query: rest
            });
        }
    }, [selectedUserID]);


    useEffect(() => {
        const filteredUsers = users
            .filter((user) => (
                emailFilter === "" || 
                user.UserName?.toLowerCase().includes(emailFilter.toLowerCase()) || 
                user.DisplayName?.toLowerCase().includes(emailFilter.toLowerCase())
            ))
            .filter((user) => (groupFilter === "" || user.GroupID?.includes(groupFilter)))
            .filter((user) => (roleFilter === undefined || user.RoleID === roleFilter))
            .filter((user) => (contactFilter === "No" || user.security_users_sites.some((site) => site.IsContact === true)))
            .filter((user) => (
                gemeenteFilter === "" || 
                user.security_users_sites.some((site) => site.SiteID === gemeenteFilter)
            ))
            .filter((user) => {
                if (user.GroupID !== 'exploitant') return true;

                if (exploitantFilter === "") return true;

                // Check if the user is a main user with the exploitantID
                if (user.SiteID === exploitantFilter) return true;

                // Check if the user is a subuser and the main user links to the exploitantID
                const mainUser = users.find(main => main.UserID === user.ParentID);
                return mainUser?.SiteID === exploitantFilter;
            })
            .filter((user) => {
                const isDubious = dubiousUserIDs.some(dubious => dubious.UserID === user.UserID);
                if (invalidDataFilter === "Yes") {
                    return true;
                } else if (invalidDataFilter === "Only") {
                    return isDubious;
                } else {
                    return !isDubious;
                }
            })
            .filter((user) => {
                const userIsActive = user.LastLogin && new Date(user.LastLogin) > new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000);
                if (inactiveUserFilter === "Yes") {
                    return true;
                } else if (inactiveUserFilter === "Only") {
                    return !userIsActive;
                } else {
                    return userIsActive;
                }
            });

        setFilteredUsers(filteredUsers);
    }, [emailFilter, groupFilter, roleFilter, contactFilter, gemeenteFilter, exploitantFilter, invalidDataFilter, inactiveUserFilter]);

    const filterEmailHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmailFilter(event.target.value);
    }

    const selectUserHandler = (userID: string) => {
        setSelectedUserID(userID);
    }

    const resetFilters = () => {
        setEmailFilter("");
        setGroupFilter("");
        setRoleFilter(undefined);
        setContactFilter("No");
        setGemeenteFilter("");
        setExploitantFilter("");
        setInvalidDataFilter("Yes");
        setInactiveUserFilter("No");
    };

    const checkAssumptions = () => {
        let assumptionsfailed = false;
        const userlabel = (user: VSUserWithRoles) => {
            return `${user.DisplayName} [${user.UserName}/${user.UserID}]`;
        }
        switch(selectedUser?.GroupID) {
            case 'intern':
                break;
            case 'extern':
                // check that there are no users in this group that have more than one linked contact via security_users_sites
                const externUsers = users.filter((user) => user.GroupID === 'extern');
                const externUsersWithMultipleContacts = externUsers.filter((user) => user.security_users_sites.length > 1);
                if(externUsersWithMultipleContacts.length > 0) {
                    console.error(`There are users in the extern group that have more than one linked contact via security_users_sites: ${externUsersWithMultipleContacts.map(userlabel).join(", ")}`);
                    assumptionsfailed = true;
                }

                // check that for users in this group that if the siteid is set, the same siteid is also in the security_users_sites array
                const externUsersWithSiteID = externUsers.filter((user) => user.SiteID !== null);
                const externUsersWithSiteIDNotInSecurityUsersSites = externUsersWithSiteID.filter((user) => !user.security_users_sites.some((site) => site.SiteID === user.SiteID));
                if(externUsersWithSiteIDNotInSecurityUsersSites.length > 0) {
                    console.error(`There are users in the extern group that have a siteid set, but the same siteid is not in the security_users_sites array: ${externUsersWithSiteIDNotInSecurityUsersSites.map(userlabel).join(", ")}`);
                    assumptionsfailed = true;
                }

                break;
            case 'exploitant':
                const exploitantUsers = users
                    .filter((user) => user.GroupID === 'exploitant')
                    .filter((user) => user.UserID !== "F2390AFC-72D7-40A3-8C910F8C4B055938"); // known bad: no siteid and no parentid
                // assume that users in this group either have: 
                // a site id and no sites linked via a parentid related user
                exploitantUsers.forEach((user) => {
                    if(user.SiteID !== null) {
                        if(user.ParentID !== null) {
                            console.error(`User ${userlabel(user)} has a siteid and a parentid`);
                            assumptionsfailed = true;
                        }
                    }
                });
                // no site id and one site linked via a parentid related user
                exploitantUsers.forEach((user) => {
                    if(user.SiteID === null) {
                        if(user.ParentID === null) {
                            console.error(`User ${userlabel(user)} has no siteid and no parentid`);
                            assumptionsfailed = true;
                        }
                    }
                });

                break;
            case 'dataprovider':
                break;
            default:
                break;
        }

        if(assumptionsfailed) {
            console.error("One or more assumptions failed");
        }
    }

    const renderFilterSection = () => {
        // only show gemeenten that are associated with one or more users
        // const filterlijstgemeenten = gemeenten.filter((gemeente) => users.some((user) => user.security_users_sites.some((site) => site.SiteID === gemeente.ID)));

        return (
            <div className="p-6 bg-white shadow-md rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">User Explorer</h1>
                    <button 
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={resetFilters}
                    >
                        Reset Filters
                    </button>
                </div>
                <form className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="userEmail" className="text-sm font-medium text-gray-700">User Name or Email:</label>
                        <input 
                            type="text" 
                            id="userEmail" 
                            name="userEmail" 
                            placeholder="Type to search..." 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={emailFilter}
                            onChange={filterEmailHandler} 
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="group" className="text-sm font-medium text-gray-700">Select Group:</label>
                        <select 
                            id="group" 
                            name="group" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={groupFilter}
                            onChange={(e) => setGroupFilter(e.target.value)}
                        >
                            <option value="">All groups</option>
                            {groups.map((group) => (
                                <option value={group} key={group}>{group}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="role" className="text-sm font-medium text-gray-700">Select Role:</label>
                        <select 
                            id="role" 
                            name="role" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={roleFilter ?? ""}
                            onChange={(e) => setRoleFilter(Number(e.target.value) || undefined)}
                        >
                            <option value="">All roles</option>
                            {roles.map((role) => (
                                <option value={role.RoleID} key={role.RoleID}>{role.Role}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="contact" className="text-sm font-medium text-gray-700">Show only contact persons:</label>
                        <select 
                            id="contact" 
                            name="contact" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={contactFilter}
                            onChange={(e) => setContactFilter(e.target.value === "Yes" ? "Yes" : "No")}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>                        
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="gemeente" className="text-sm font-medium text-gray-700">Select Gemeente:</label>
                        <select 
                            id="gemeente" 
                            name="gemeente" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={gemeenteFilter}
                            onChange={(e) => setGemeenteFilter(e.target.value)}
                        >
                            <option value="">All gemeenten</option>
                            {gemeenten.map((gemeente) => (
                                <option value={gemeente.ID} key={gemeente.ID}>{gemeente.CompanyName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="invalidData" className="text-sm font-medium text-gray-700">Users with invalid data:</label>
                        <select 
                            id="invalidData" 
                            name="invalidData" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={invalidDataFilter}
                            onChange={(e) => setInvalidDataFilter(e.target.value as "Yes" | "No" | "Only")}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Only">Only</option>
                        </select>                        
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="inactiveUsers" className="text-sm font-medium text-gray-700">Show Inactive Users:</label>
                        <select 
                            id="inactiveUsers" 
                            name="inactiveUsers" 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={inactiveUserFilter}
                            onChange={(e) => setInactiveUserFilter(e.target.value as "Yes" | "No" | "Only")}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Only">Only</option>
                        </select>                        
                    </div>
                    {groupFilter === 'exploitant' && (
                        <div className="flex flex-col">
                            <label htmlFor="exploitant" className="text-sm font-medium text-gray-700">Select Exploitant:</label>
                            <select 
                                id="exploitant" 
                                name="exploitant" 
                                className="mt-1 p-2 border border-gray-300 rounded-md" 
                                value={exploitantFilter}
                                onChange={(e) => setExploitantFilter(e.target.value)}
                            >
                                <option value="">All exploitants</option>
                                {exploitanten.map((exploitant) => (
                                    <option value={exploitant.ID} key={exploitant.ID}>{exploitant.CompanyName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-semibold mt-6">List of Users</h2>
                        <ul className="list-disc list-inside max-h-fit overflow-y-auto">
                            {filteredUsers.map((user) => (
                                <li 
                                    key={user.UserID} 
                                    className={`cursor-pointer p-2 ${selectedUserID === user.UserID ? 'bg-blue-100' : ''}`} 
                                    onClick={() => selectUserHandler(user.UserID)}
                                >
                                    {`${user.DisplayName} [${user.UserName}]`}
                                </li>
                            ))}
                        </ul>
                    </div>
                </form>
            </div>
        );
    }

    const getMainContact = () => {
        if (!selectedUser) return null;

        let contact: VSContactGemeente | VSContactExploitant | undefined = undefined;
        switch(selectedUser.GroupID) {
            case 'intern': {
                return null; // No associated contact for intern users
            }
            case 'extern': {
                // SiteID is not used for extern users

                const relatedSites = selectedUser.security_users_sites;
                contact = gemeenten.find((gemeente) => {
                    return (
                        gemeente.ID === relatedSites[0]?.SiteID
                    )
                });
                break;
            }
            case 'exploitant': {
                // first check direct link
                contact = exploitanten.find((contact) => {
                    return (
                        contact.ID === selectedUser.SiteID
                    )
                });
                // check link via parentID
                if(!contact) {
                    if(selectedUser?.ParentID) {
                        const parentuser = users.find((user) => {
                            return (
                                user.UserID === selectedUser.ParentID
                            )
                        });
                        if(parentuser) {
                            contact = exploitanten.find((exploitant) => {
                                return (
                                    exploitant.ID === parentuser.SiteID
                                )
                            });
                        } else {
                            console.error(`No parent user found for user ${selectedUser.DisplayName} [${selectedUser.UserName}]`);
                        }
                    } else {
                        console.error(`No parentID found for user ${selectedUser.DisplayName} [${selectedUser.UserName}]`);
                    }
                }

                if(!contact) {
                    console.error(`No contact found for user ${selectedUser.DisplayName} [${selectedUser.UserName}]`);
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

    const renderUserDetailsSection = () => {
        if (!selectedUser) return null;

        const mainContact: VSContactGemeente | VSContactExploitant | undefined | null = getMainContact();
        let linkElement: React.ReactElement | null = null;
        if(mainContact) {
            switch(mainContact.ItemType) {
                case 'admin':
                    linkElement = <span className="text-gray-900">{mainContact?.CompanyName} [Admin]</span>;
                    break;
                case 'organizations':
                    linkElement = <Link href={`/beheer/explore-gemeenten/${mainContact.ID}`} target="_blank">{mainContact.CompanyName}</Link>;
                    break;
                case 'exploitant':
                    linkElement = <Link href={`/beheer/explore-exploitanten/${mainContact.ID}`} target="_blank">{mainContact.CompanyName}</Link>;
                    break;
                case 'dataprovider':
                    linkElement = <span className="text-gray-900">{mainContact?.CompanyName}</span>;
                    break;
                default:
                    linkElement = <span className="text-gray-900">{mainContact?.CompanyName} [{mainContact.ItemType}]</span>;
                    break;
            }
        } else {
            linkElement = <span className="text-gray-900">No main contact found</span>;
        }

        const visibleGemeenten = gemeenten.filter((gemeente) => selectedUser.security_users_sites.some((site) => site.UserID === selectedUser.UserID && site.SiteID === gemeente.ID));

        const baddataReasons = dubiousUserIDs.find((user) => user.UserID === selectedUser.UserID)?.Reasons || [];

        const formatLastLogin = (lastLogin: Date | null) => {
            if (!lastLogin) return "Never";
            const loginDate = new Date(lastLogin);
            const dayssince = Math.floor((new Date().getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayssince === 0) {
                return loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (dayssince === 1) {
                return loginDate.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }) + ` (yesterday)`;
            } else {
                return loginDate.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' }) + ` (${dayssince} days ago)`;
            }
        };

        return (
            <div className="p-6 bg-white shadow-md rounded-md">
                <h2 className="text-2xl font-bold mb-4">User Details</h2>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Name:</label>
                        <span className="text-gray-900">{selectedUser.DisplayName}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Email:</label>
                        <span className="text-gray-900">{selectedUser.UserName}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">User ID:</label>
                        <span className="text-gray-900">{selectedUser.UserID}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Organization:</label>
                        { linkElement }
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Group:</label>
                        { selectedUser?.GroupID === 'exploitant' ? (
                            <span className="text-gray-900">{selectedUser.GroupID} ({selectedUser.ParentID===null ? "Main user" : "Sub user"})</span>
                        ) : (
                            <span className="text-gray-900">{selectedUser.GroupID}</span>
                        )}
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Role ID:</label>
                        <span className="text-gray-900">{roles.find(role => role.RoleID === selectedUser.RoleID)?.Role} [{selectedUser.RoleID}]</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Roles:</label>
                        <span className="text-gray-900">{roles.find(role => role.RoleID === selectedUser.RoleID)?.Role}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Last Login:</label>
                        <span className="text-gray-900">{formatLastLogin(selectedUser.LastLogin)}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Gemeenten:</label>
                        <div className="flex flex-wrap gap-2 text-gray-900">
                            {visibleGemeenten.map((gemeente) => { 
                                const isContact = selectedUser.security_users_sites.some((site) => site.SiteID === gemeente.ID && site.IsContact);
                                return(
                                    <div key={gemeente.ID} className={`${isContact ? 'bg-red-200 text-black': 'bg-blue-100 text-blue-800'}  px-2 py-1 rounded-md`}>
                                        {gemeente.CompanyName}
                                    </div>)
                                })}
                        </div>
                    </div>
                    { baddataReasons.length > 0 && (
                        <div className="flex items-center">
                            <label className="w-32 text-sm font-medium text-gray-700">Invalid data:</label>
                            <ul className="list-disc list-inside max-h-fit overflow-y-auto">
                            {baddataReasons.map((reason) => {
                                return (
                                    <li key={reason}>{reason}</li>
                                )
                            })}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    checkAssumptions();

    return (
        <div className="w-3/4 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                {renderFilterSection()}
            </div>
            <div>
                {renderUserDetailsSection()}
            </div>
        </div>
    );
}

export default ExploreUsersComponent;