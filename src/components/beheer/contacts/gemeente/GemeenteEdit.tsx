import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { VSMenuTopic } from "~/types";
import type { VSContactGemeente } from "~/types/contacts";
import type { VSUserWithRoles } from "~/types/users";
import { getRelatedUsersForGemeente, groupUsersByGroupID } from "~/utils/contactfilters";
import { useAppDispatch, useAppSelector } from "~/store/hooks";
import { selectGemeenteFilters } from "~/store/gemeenteFiltersSlice";
import { setNameFilter, setShowGemeentenWithoutStallingen, setShowGemeentenWithoutUsers, setShowGemeentenWithoutExploitanten, resetFilters } from "~/store/gemeenteFiltersSlice";

const GemeenteEdit = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectGemeenteFilters);
    const [activeTab, setActiveTab] = useState<'details' | 'users' | 'external'>('details');
    const [gemeente, setGemeente] = useState<VSContactGemeente | null>(null);
    const [users, setUsers] = useState<VSUserWithRoles[]>([]);
    const [exploitanten, setExploitanten] = useState<VSContactExploitant[]>([]);
    const [dataproviders, setDataproviders] = useState<VSContactDataprovider[]>([]);
    const [stallingen, setStallingen] = useState<ReportBikepark[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ... existing useEffect and other code ...

    const renderUsersTable = (users: VSUserWithRoles[]) => {
        if (!users || users.length === 0) {
            return <div className="text-gray-500">Geen gebruikers gevonden</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gebruikersnaam</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groep</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.UserID}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.UserName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.security_roles?.GroupID}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.security_roles?.Name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderContent = () => {
        if (!gemeente) return null;

        const relatedUsers = getRelatedUsersForGemeente(users, gemeente.ID);
        const relatedUsersByGroup = groupUsersByGroupID(relatedUsers);

        switch (activeTab) {
            case 'details':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Naam</label>
                                <input
                                    type="text"
                                    value={gemeente.CompanyName || ''}
                                    onChange={(e) => setGemeente({ ...gemeente, CompanyName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alternatieve Naam</label>
                                <input
                                    type="text"
                                    value={gemeente.AlternativeCompanyName || ''}
                                    onChange={(e) => setGemeente({ ...gemeente, AlternativeCompanyName: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>
                        {/* ... rest of the existing details form ... */}
                    </div>
                );
            case 'users':
                return (
                    <div className="space-y-6">
                        <h2 className="text-lg font-medium text-gray-900">Gemeente Gebruikers</h2>
                        {renderUsersTable(relatedUsersByGroup['extern'] || [])}
                    </div>
                );
            case 'external':
                return (
                    <div className="space-y-6">
                        <h2 className="text-lg font-medium text-gray-900">Externe Gebruikers</h2>
                        {renderUsersTable(relatedUsersByGroup['exploitant'] || [])}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Gemeente Bewerken</h1>
            </div>

            <div className="bg-white shadow rounded-lg">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`${
                                activeTab === 'details'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${
                                activeTab === 'users'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Gebruikers
                        </button>
                        <button
                            onClick={() => setActiveTab('external')}
                            className={`${
                                activeTab === 'external'
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Externe Gebruikers
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default GemeenteEdit; 