import { useEffect, useState } from "react";
import { VSUserWithRoles, VSRole, VSGroup, VSContact, VSContactDataprovider, VSContactGemeente, VSContactExploitant } from "~/types";

interface ExploreUsersComponentProps {
    users: VSUserWithRoles[]
    roles: VSRole[]
    gemeenten: VSContactGemeente[]
    exploitanten: VSContactExploitant[]
    dataproviders: VSContactDataprovider[]
}

const ExploreUsersComponent = (props: ExploreUsersComponentProps) => {   

    const { roles, users, gemeenten, exploitanten, dataproviders } = props;
    const [filteredUsers, setFilteredUsers] = useState<VSUserWithRoles[]>(users);
    const [selectedUser, setSelectedUser] = useState<VSUserWithRoles | null>(null);

    const [emailFilter, setEmailFilter] = useState<string>("");
    const [groupFilter, setGroupFilter] = useState<string>("");
    const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
    const [contactFilter, setContactFilter] = useState<"Yes" | "No">("No");
    const [gemeenteFilter, setGemeenteFilter] = useState<string>("");

    const groups = Object.values(VSGroup);

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
            ));
        setFilteredUsers(filteredUsers);
    }, [emailFilter, groupFilter, roleFilter, contactFilter, gemeenteFilter]);

    const filterEmailHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmailFilter(event.target.value);
    }

    const selectUserHandler = (user: VSUserWithRoles) => {
        setSelectedUser(user);
    }

    const resetFilters = () => {
        setEmailFilter("");
        setGroupFilter("");
        setRoleFilter(undefined);
        setContactFilter("No");
        setGemeenteFilter("");
    };

    const renderFilterSection = () => {
        // only show gemeenten that are associated with one or more users
        const filterlijstgemeenten = gemeenten.filter((gemeente) => users.some((user) => user.security_users_sites.some((site) => site.SiteID === gemeente.ID)));

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
                        <label htmlFor="contact" className="text-sm font-medium text-gray-700">Show only contacts:</label>
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
                    <div>
                        <h2 className="text-xl font-semibold mt-6">List of Users</h2>
                        <ul className="list-disc list-inside max-h-fit overflow-y-auto">
                            {filteredUsers.map((user) => (
                                <li 
                                    key={user.UserID} 
                                    className={`cursor-pointer p-2 ${selectedUser?.UserID === user.UserID ? 'bg-blue-100' : ''}`} 
                                    onClick={() => selectUserHandler(user)}
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

    const renderUserDetailsSection = () => {
        if (!selectedUser) return null;

        const visibleGemeenten = gemeenten.filter((gemeente) => selectedUser.security_users_sites.some((site) => site.SiteID === gemeente.ID));
        const visibleExploitanten = exploitanten.filter(
            (exploitant) => selectedUser.security_users_sites.some((site) => {
                return (
                    exploitant.isManaging.find((managed) => managed.childSiteID === site.SiteID)) 
                }
                // exploitant.isManagedBy.find((managed) => managed.parentSiteID === site.SiteID) ||
            ))
        const visibleDataproviders = dataproviders.filter((dataprovider) => selectedUser.security_users_sites.some((site) => site.SiteID === dataprovider.ID));

        const contactinfo = gemeenten.filter((gemeente) => selectedUser.SiteID === gemeente.ID);

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
                        <label className="w-32 text-sm font-medium text-gray-700">Group:</label>
                        <span className="text-gray-900">{selectedUser.GroupID}</span>
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
                    <div className="flex items-center"> 
                        <label className="w-32 text-sm font-medium text-gray-700">SiteID</label>
                        <span className="text-gray-900">{selectedUser.SiteID}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Exploitanten:</label>
                        <ul className="list-disc list-inside text-gray-900">
                            { visibleExploitanten.map((exploitant) => { 
                                return (
                                <li key={exploitant.ID}>{exploitant.CompanyName}</li>
                            )})}
                        </ul>
                    </div>
                    {/*
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Dataproviders:</label>
                        <ul className="list-disc list-inside text-gray-900">
                            { visibleDataproviders.map((dataprovider) => { 
                                return (
                                <li key={dataprovider.ID}>{dataprovider.CompanyName}</li>
                            )})}
                        </ul>
                    </div> */}
                </div>
            </div>
        );
    }

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