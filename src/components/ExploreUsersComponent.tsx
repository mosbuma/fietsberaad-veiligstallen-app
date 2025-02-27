import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { signIn } from "next-auth/react";

import { VSUserWithRoles, VSUserRole, VSUserGroupValues, VSContactDataprovider, VSContactGemeente, VSContactExploitant, VSUserSecurityProfile, VSMenuTopic } from "~/types";
import { getNewRoleLabel, getOldRoleLabel } from "~/types/utils";

interface ExploreUsersComponentProps {
    users: VSUserWithRoles[]
    roles: VSUserRole[]
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

    const { roles, users, gemeenten, exploitanten, dataproviders } = props;
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

    const [activeOrganization, setActiveOrganization] = useState<VSContactGemeente | VSContactExploitant | null>(null);
    const [showAllContacts, setShowAllContacts] = useState(false);
    const [showAllAccessRights, setShowAllAccessRights] = useState(false);

    const [securityProfile, setSecurityProfile] = useState<VSUserSecurityProfile | undefined>(undefined);
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);

    const groups = Object.values(VSUserGroupValues);

    const dubiousUserIDs = getDubiousUserIDs(users);

    const selectedUser = users.find(user => user.UserID === selectedUserID);

    // reset the active user if any of the filters change and the active user is not in the filtered users
    useEffect(() => {
        if(selectedUserID && !filteredUsers.some((user) => user.UserID === selectedUserID)) {
            setSelectedUserID(null);
        }
    }, [emailFilter, groupFilter, roleFilter, contactFilter, gemeenteFilter, exploitantFilter, invalidDataFilter, inactiveUserFilter, filteredUsers]);

    useEffect(() => {
        if(securityProfile) {
            const mainContact = gemeenten.find((gemeente) => gemeente.ID === securityProfile.mainContactId) || exploitanten.find((exploitant) => exploitant.ID === securityProfile.mainContactId);
            setActiveOrganization(mainContact || null);
        } else {
            setActiveOrganization(null);
        }
    }, [securityProfile?.mainContactId]);

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

    useEffect(() => {
        async function loadSecurityProfile() {
            if (!selectedUser) {
                return;
            }

            setIsLoadingProfile(true);
            setProfileError(null);

            try {
                const profile = await fetchSecurityProfile(
                    selectedUser.UserID, 
                    activeOrganization?.ID || ""
                );

                setSecurityProfile(profile);
            } catch (error) {
                console.error('Error fetching security profile:', error);
                setProfileError(error instanceof Error ? error.message : 'Failed to fetch security profile');
                setSecurityProfile(undefined);
            } finally {
                setIsLoadingProfile(false);
            }
        }

        loadSecurityProfile();
    }, [selectedUser?.UserID, activeOrganization?.ID]);

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
                                <option value={role.RoleID} key={role.RoleID}>{getOldRoleLabel(role.RoleID)}</option>
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

    const renderUserDetailsSection = (mainContact: VSContactGemeente | VSContactExploitant | undefined | null, managedContacts: (VSContactGemeente | VSContactExploitant)[]) => {
        if(!selectedUser) return null;

        const handleLoginAsUser = async () => {
            if (!selectedUser||!selectedUser.UserName) return;

            try {
                // First get the auth token
                const tokenResponse = await fetch(`/api/security/gettoken/${encodeURIComponent(selectedUser.UserID)}`);
                
                if (!tokenResponse.ok) {
                    const error = await tokenResponse.json();
                    console.error("Failed to get token:", error);
                    return;
                }

                const { token } = await tokenResponse.json();

                // Attempt to sign in using the token provider
                const result = await signIn("token-login", {
                    userid: selectedUser.UserID,
                    token,
                    redirect: true,
                    callbackUrl: "/beheer"
                });
            } catch (error) {
                console.error("Error during login:", error);
            }
        };

        let linkElement: React.ReactElement | null = null;
        if(mainContact) {
            switch(mainContact.ItemType) {
                case 'admin':
                    linkElement = <span className="text-gray-900">{mainContact?.CompanyName} [Admin]</span>;
                    break;
                case 'organizations':
                    linkElement = <Link href={`/beheer/${VSMenuTopic.ExploreGemeenten}/${mainContact.ID}`} target="_blank">{mainContact.CompanyName}</Link>;
                    break;
                case 'exploitant':
                    linkElement = <Link href={`/beheer/${VSMenuTopic.ExploreExploitanten}/${mainContact.ID}`} target="_blank">{mainContact.CompanyName}</Link>;
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
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">User Details</h2>
                    {process.env.NODE_ENV === "development" && (
                        <button
                            onClick={handleLoginAsUser}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                        >
                            Login as this user
                        </button>
                    )}
                </div>
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
                            {displayedContacts.map((gemeente) => { 
                                const isContact = managedContacts.some((contact) => contact?.ID === gemeente.ID);
                                return (
                                    <div key={gemeente.ID} className={`${isContact ? 'bg-red-200 text-black': 'bg-blue-100 text-blue-800'} px-2 py-1 rounded-md`}>
                                        <Link href={`/beheer/${VSMenuTopic.ExploreGemeenten}/${gemeente.ID}`} target="_blank">{gemeente.CompanyName}</Link>
                                    </div>
                                );
                            })}
                            {managedContacts.length > 20 && (
                                <button onClick={() => setShowAllContacts(!showAllContacts)} className="mt-2 text-blue-500">
                                    {showAllContacts ? 'Show Less' : 'Show More'}
                                </button>
                            )}
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

    const renderSelectActiveOrganization = (
        mainContact: VSContactGemeente | VSContactExploitant | undefined | null, 
        managedContacts: (VSContactGemeente | VSContactExploitant | undefined | null)[]) => {
        if (!selectedUser) return null;

        if(managedContacts.length === 0) {
            return null;
        }

        return (
            <div className="mb-6 flex flex-col">
                <label htmlFor="group" className="text-2xl font-semibold mb-2 mt-4">{managedContacts.length <2 ? "" : "Select"} Active Organization</label>
                <select 
                    id="group" 
                    name="group" 
                    className="mt-1 p-2 border border-gray-300 rounded-md" 
                    value={activeOrganization?.ID||'none'}
                    onChange={(e) => {
                        let organization = null;
                        if(e.target.value !== "none") {
                            if(e.target.value === mainContact?.ID) {
                                organization = mainContact;
                            } else {
                                organization = managedContacts.find((contact) => contact?.ID === e.target.value) || null;
                            }
                        }

                        setActiveOrganization(organization || null);
                    }}
                    disabled={managedContacts.length < 2}
                >
                    { managedContacts.map((contact) => {
                        const showMainContact = contact?.ID === mainContact?.ID && managedContacts.length > 1;
                        return (<option key={contact?.ID} value={contact?.ID}>{contact?.CompanyName} {showMainContact ? "(own organization)" : ""}</option>);
                    })}
                    { activeOrganization === null && (
                        <option value="none">No active organization</option>
                    )}
                </select>
            </div>
        );
    }    

    const renderSecurityProfileSection = (securityProfile: VSUserSecurityProfile | undefined) => {
        if (!selectedUser || !activeOrganization) {
            return null;
        }

        if(!securityProfile) {
            return null;
        }

        const displayRights = Object.entries(securityProfile.rights).filter(([topic, rights]) => rights.create || rights.read || rights.update || rights.delete || showAllAccessRights);

        const toggleShowAll = () => {
            setShowAllAccessRights(!showAllAccessRights);
        };

        return (
            <div className="p-6 bg-white shadow-md rounded-md mt-2 flex flex-col mb-6">
                {renderSelectActiveOrganization(mainContact, managedContacts)}
                
                <div className="text-2xl font-bold mb-4">Security Profile</div>

                {isLoadingProfile && (
                    <div className="text-gray-600">Loading security profile...</div>
                )}

                {profileError && (
                    <div className="text-red-600">Error: {profileError}</div>
                )}

                {!isLoadingProfile && !profileError && securityProfile && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <label className="w-32 text-sm font-medium text-gray-700">RoleID:</label>
                                <span className="text-gray-900">{getNewRoleLabel(securityProfile.roleId)}</span>
                            </div>
                        </div>

                        <div className="text-lg font-semibold mb-2 mt-4">Module Access</div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {securityProfile.modules.map(module => (
                                <span key={module} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                    {module}
                                </span>
                            ))}
                        </div>
                        <div className="text-lg font-semibold mb-6 flex flex-row items-center">
                            Access Rights
                            <button 
                                onClick={toggleShowAll}
                                className="ml-2 text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            >
                                {showAllAccessRights ? "Show Less" : "Show All"}
                            </button>
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            <div className="col-span-5 grid grid-cols-5 gap-1 text-sm font-medium">
                                <div></div> {/* Empty cell for alignment with topic labels */}
                                <div>Create</div>
                                <div>Read</div>
                                <div>Update</div>
                                <div>Delete</div>
                            </div>
                            {displayRights.map(([topic, rights]) => {
                                const hasRights = rights.create || rights.read || rights.update || rights.delete;
                                if (!showAllAccessRights && !hasRights) return null;

                                return (
                                    <div key={topic} className="col-span-5 border-b pb-2 grid grid-cols-5 gap-1 text-sm">
                                        <h4 className="font-medium">{topic}</h4>
                                        <div className={`${rights.create ? 'text-green-600' : 'text-red-600'}`}>
                                            {rights.create ? '✓' : '✗'}
                                        </div>
                                        <div className={`${rights.read ? 'text-green-600' : 'text-red-600'}`}>
                                            {rights.read ? '✓' : '✗'}
                                        </div>
                                        <div className={`${rights.update ? 'text-green-600' : 'text-red-600'}`}>
                                            {rights.update ? '✓' : '✗'}
                                        </div>
                                        <div className={`${rights.delete ? 'text-green-600' : 'text-red-600'}`}>
                                            {rights.delete ? '✓' : '✗'}
                                        </div>
                                    </div>
                                );
                            })}
                            {displayRights.length === 0 && (
                                <div className="col-span-5 text-gray-600">No access rights</div>
                            )}
                        </div>
                    </>  
                )}
            </div>
        );
    };

    checkAssumptions();

    let mainContact: VSContactGemeente | VSContactExploitant | undefined | null = undefined;
    let managedContacts: (VSContactGemeente | VSContactExploitant)[] = [];
    if(securityProfile) {
        mainContact = gemeenten.find((gemeente) => gemeente.ID === securityProfile.mainContactId) || exploitanten.find((exploitant) => exploitant.ID === securityProfile.mainContactId);

        const managedGemeenten = securityProfile.managingContactIDs.map((contactID) => gemeenten.find((gemeente) => gemeente.ID === contactID)).filter((gemeente) => gemeente !== undefined);
        const managedExploitanten = securityProfile.managingContactIDs.map((contactID) => exploitanten.find((exploitant) => exploitant.ID === contactID)).filter((exploitant) => exploitant !== undefined);
        managedContacts = [...managedGemeenten, ...managedExploitanten];
    } else {
        if(selectedUser) {
        console.error("No security profile found for user", selectedUser?.UserID);
        }
    }

    // limit list size to 20
    const displayedContacts = showAllContacts ? managedContacts : managedContacts.slice(0, 16);

    return (
        <div className="w-3/4 mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                {renderFilterSection()}
            </div>
            <div>
                {renderUserDetailsSection(mainContact, managedContacts)}
                {renderSecurityProfileSection(securityProfile)}
            </div>
        </div>
    );
}

async function fetchSecurityProfile(userId: string, activeContactId: string) {
    let url = `/api/security/profile/${userId}`;
    if (activeContactId) {
        url += `/${activeContactId}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch security profile');
    }

    const data = await response.json();
    return data.profile as VSUserSecurityProfile;
}

export default ExploreUsersComponent;