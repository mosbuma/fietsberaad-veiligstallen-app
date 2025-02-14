import { useEffect, useState } from "react";
import { VSContactDataprovider, VSContactExploitant, VSContactGemeente, VSParking, VSUserWithRoles } from "~/types";
import { ReportBikepark } from '~/components/beheer/reports/ReportsFilter'; // Adjust the import path if necessary

// import moment from "moment";
interface ExploreGemeenteComponentProps {
    users: VSUserWithRoles[];
    gemeenten: VSContactGemeente[];
    exploitanten: VSContactExploitant[];
    dataproviders: VSContactDataprovider[];
    stallingen: ReportBikepark[];
}

const ExploreGemeenteComponent = (props: ExploreGemeenteComponentProps) => {   

    console.log("#### GOT USERS", props.users.length);
    console.log("#### GOT GEMEENTEN", props.gemeenten.length);

    const { gemeenten, exploitanten, dataproviders, users } = props;
    const [filteredGemeenten, setFilteredGemeenten] = useState<VSContactGemeente[]>(gemeenten);
    const [selectedGemeenteID, setSelectedGemeenteID] = useState<string | null>("E1991A95-08EF-F11D-FF946CE1AA0578FB");

    const [nameFilter, setNameFilter] = useState<string>("");
    const [showGemeentenWithoutStallingen, setShowGemeentenWithoutStallingen] = useState<"yes"|"no"|"only">("no");
    const [showGemeentenWithoutUsers, setShowGemeentenWithoutUsers] = useState<"yes"|"no"|"only">("no");

    useEffect(() => {
        const filtered = gemeenten
            .filter((gemeente) => 
                nameFilter === "" || 
                gemeente.CompanyName?.toLowerCase().includes(nameFilter.toLowerCase())
            )
            .filter((gemeente) => {
                const numStallingen = gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts?.length || 0;
                const hasUsers = users.some((user) => 
                    user.security_users_sites.some((site) => site.SiteID === gemeente.ID)
                );
                return (
                    (numStallingen === 0 && showGemeentenWithoutStallingen !== "no" || 
                    numStallingen > 0 && showGemeentenWithoutStallingen !== "only") &&
                    (!hasUsers && showGemeentenWithoutUsers !== "no" || 
                    hasUsers && showGemeentenWithoutUsers !== "only")
                );
            });
        setFilteredGemeenten(filtered);
    }, [nameFilter, gemeenten, showGemeentenWithoutStallingen, showGemeentenWithoutUsers]);

    const filterNameHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNameFilter(event.target.value);
    }

    const selectGemeenteHandler = (gemeenteID: string) => {
        setSelectedGemeenteID(gemeenteID);
    }

    const resetFilters = () => {
        setNameFilter("");
    };

    const renderFilterSection = () => {
        return (
            <div className="p-6 bg-white shadow-md rounded-md">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Gemeente Explorer</h1>
                    <button 
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        onClick={resetFilters}
                    >
                        Reset Filters
                    </button>
                </div>
                <form className="space-y-4">
                    <div className="flex flex-col">
                        <label htmlFor="gemeenteName" className="text-sm font-medium text-gray-700">Gemeente Name:</label>
                        <input 
                            type="text" 
                            id="gemeenteName" 
                            name="gemeenteName" 
                            placeholder="Type to search..." 
                            className="mt-1 p-2 border border-gray-300 rounded-md" 
                            value={nameFilter}
                            onChange={filterNameHandler} 
                        />
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="showGemeentenWithoutStallingen" className="text-sm font-medium text-gray-700">Show Gemeenten Without Stallingen:</label>
                        <select 
                            id="showGemeentenWithoutStallingen" 
                            name="showGemeentenWithoutStallingen" 
                            value={showGemeentenWithoutStallingen}
                            onChange={(e) => setShowGemeentenWithoutStallingen(e.target.value as "yes"|"no"|"only")}
                            className="ml-2 p-2 border border-gray-300 rounded-md"
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="only">Only</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label htmlFor="showGemeentenWithoutUsers" className="text-sm font-medium text-gray-700">Show Gemeenten Without Users:</label>
                        <select 
                            id="showGemeentenWithoutUsers" 
                            name="showGemeentenWithoutUsers" 
                            value={showGemeentenWithoutUsers}
                            onChange={(e) => setShowGemeentenWithoutUsers(e.target.value as "yes"|"no"|"only")}
                            className="ml-2 p-2 border border-gray-300 rounded-md"
                        >
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                            <option value="only">Only</option>
                        </select>
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold mt-6">List of Gemeenten</h2>
                        <ul className="list-disc list-inside max-h-fit overflow-y-auto">
                            {filteredGemeenten.map((gemeente) => (
                                <li 
                                    key={gemeente.ID} 
                                    className={`cursor-pointer p-2 ${selectedGemeenteID === gemeente.ID ? 'bg-blue-100' : ''}`} 
                                    onClick={() => selectGemeenteHandler(gemeente.ID)}
                                >
                                    {gemeente.CompanyName}
                                </li>
                            ))}
                        </ul>
                    </div>
                </form>
            </div>
        );
    }

    const getUserInfo = (siteID: string, user: VSUserWithRoles) => {
        const gemeente = gemeenten.find((gemeente) => gemeente.ID === siteID)?.CompanyName || false;
        const exploitant = exploitanten.find((exploitant) => exploitant.ID === siteID)?.CompanyName || false;
        const dataprovider = dataproviders.find((dataprovider) => dataprovider.ID === siteID)?.CompanyName || false;

        return {
            id: user.UserID,
            username: user.UserName,
            siteID: siteID,
            gemeente: gemeente,
            exploitant: exploitant,
            dataprovider: dataprovider,
            group: user.GroupID,
            role: user.security_roles?.Role
        }
    }

    const relatedUsers = props.users.filter((user) => { 
        return (
            user.security_users_sites.some((site) => (site.SiteID === selectedGemeenteID))
        )
    })

    const renderGemeenteDetailsSection = () => {
        const selectedGemeente = gemeenten.find(gemeente => gemeente.ID === selectedGemeenteID);
        if (!selectedGemeente) return null;


        const isManagingContacts = selectedGemeente.isManagingContacts?.map((contactinfo) => {
            return gemeenten.find((gemeente) => gemeente.ID === contactinfo.childSiteID);
        })

        const isManagedByContacts = selectedGemeente.isManagedByContacts?.map((contactinfo) => {
            return exploitanten.find((exploitant) => exploitant.ID === contactinfo.parentSiteID);
        })

        return (
            <div className="p-6 bg-white shadow-md rounded-md">
                <div className="text-2xl font-bold mb-4">Gemeente Details</div>
                <div className="space-y-2">
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">ID:</label>
                        <span className="text-gray-900">{selectedGemeente.ID}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Name:</label>
                        <span className="text-gray-900">{selectedGemeente.CompanyName}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Alternative Name:</label>
                        <span className="text-gray-900">{selectedGemeente.AlternativeCompanyName}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">URL Name:</label>
                        <span className="text-gray-900">{selectedGemeente.UrlName}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Zip ID:</label>
                        <span className="text-gray-900">{selectedGemeente.ZipID}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Helpdesk:</label>
                        <span className="text-gray-900">{selectedGemeente.Helpdesk}</span>
                    </div>
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Day Begins At:</label>
                        <span className="text-gray-900">{selectedGemeente.DayBeginsAt.toString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Coordinaten:</label>
                        <span className="text-gray-900">{selectedGemeente.Coordinaten}</span>
                    </div>
                    
                    {/* render these fields for the selected gemeente here:
                            "UrlName" | 
                            "ZipID" | 
                            "Helpdesk" | 
                            "DayBeginsAt" | 
                            "Coordinaten" | 
                            "Zoom" | 
                            "Bankrekeningnr" | 
                            "PlaatsBank" | 
                            "Tnv" | 
                            "Notes" | 
                            "DateRegistration" | 
                            "CompanyLogo" | 
                            "CompanyLogo2" |
                            "ThemeColor1" |
                            "ThemeColor2"
                    */}

                    {/* Add more fields as needed */}

                    <div className="flex flex-row items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Managed By Contacts:</label>
                        <ul className="list-disc list-inside pl-4">
                            {isManagedByContacts?.map((contact) => (
                                <li key={contact.ID}>{contact.CompanyName}</li>
                            ))}
                        </ul>   
                    </div>
                    
                    { isManagingContacts && isManagingContacts?.length > 0 && (
                        <div className="flex flex-row items-center">
                            <label className="w-32 text-sm font-medium text-gray-700">Managing Contacts:</label>
                            <ul className="list-disc list-inside pl-4">
                                {isManagingContacts?.map((contact) => (
                                    <li key={contact.ID}>{contact.CompanyName}</li>
                                ))}
                            </ul>   
                        </div>
                    )}

                    <div className="flex items-center"> 
                        <label className="w-32 text-sm font-medium text-gray-700">Modules:</label>
                        <ul className="list-disc list-inside pl-4">
                            {selectedGemeente.modules_contacts?.map((module) => (
                                <li key={module.module.ID}>{module.module.Name}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-row items-center">
                        <label className="w-32 text-sm font-medium text-gray-700">Users:</label>
                        <ul className="list-disc list-inside pl-4">
                            {relatedUsers.map((userinfo, idx) => { 
                                const info = getUserInfo(selectedGemeente.ID, userinfo);
                                return (
                                    <li key={info.id}>
                                        <span className="text-gray-900">{info.username} / {info.role}]</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    <div className="text-xl font-bold mb-4">Fietsenstallingen</div>
                    <ul className="list-disc list-inside">
                        {selectedGemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts?.map((stalling) => (
                            <li key={stalling.ID}>{stalling.Title} [{stalling.Type}]</li>
                        ))}
                    </ul> 
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
                {renderGemeenteDetailsSection()}
            </div>
        </div>
    );
}

export default ExploreGemeenteComponent;