import React, { useEffect, useRef } from 'react';
import CollapsibleContent from './CollapsibleContent';
import type { VSContactGemeente } from "~/types/contacts";
import type { VSUserWithRolesNew } from "~/types/users";
import { useDispatch, useSelector } from 'react-redux';

import { 
  setNameFilter,
  setShowGemeentenWithoutStallingen,
  setShowGemeentenWithoutUsers,
  setShowGemeentenWithoutExploitanten,
  resetFilters,
  selectGemeenteFilters,
} from '~/store/gemeenteFiltersSlice';

interface GemeenteFilterProps {
  gemeenten: VSContactGemeente[];
  users: VSUserWithRolesNew[];
  onFilterChange: (filteredGemeenten: VSContactGemeente[]) => void;
  showStallingenFilter?: boolean;
  showUsersFilter?: boolean;
  showExploitantenFilter?: boolean;
}

const GemeenteFilter: React.FC<GemeenteFilterProps> = ({
  gemeenten,
  users,
  onFilterChange,
  showStallingenFilter = false,
  showUsersFilter = false,
  showExploitantenFilter = false,
}) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectGemeenteFilters);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Initialize filters if they don't exist
  useEffect(() => {
    if (!filters) {
      dispatch(resetFilters());
    }
  }, [dispatch, filters]);

  useEffect(() => {
    // Focus the input field when the component mounts
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleNameFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setNameFilter(event.target.value));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  useEffect(() => {
    const filtered = gemeenten
      .filter((gemeente) => 
        (!filters?.nameFilter || filters.nameFilter === "") || 
        gemeente.CompanyName?.toLowerCase().includes((filters?.nameFilter || "").toLowerCase())
      )
      .filter((gemeente) => {
        const numNietSysteemStallingen = 
          (gemeente.fietsenstallingen_fietsenstallingen_SiteIDTocontacts?.
          filter((stalling) => stalling.Title !== 'Systeemstalling').length) || 0;
        const hasUsers = users.some((user) => 
          user.sites.some((site) => site.SiteID === gemeente.ID)
        );
        const hasExploitanten = gemeente.isManagedByContacts?.length || 0 > 0;

        return (
          (!showStallingenFilter || 
            (numNietSysteemStallingen === 0 && filters?.showGemeentenWithoutStallingen !== "no" || 
             numNietSysteemStallingen > 0 && filters?.showGemeentenWithoutStallingen !== "only")) &&
          (!showUsersFilter || 
            (!hasUsers && filters?.showGemeentenWithoutUsers !== "no" || 
             hasUsers && filters?.showGemeentenWithoutUsers !== "only")) &&
          (!showExploitantenFilter || 
            (!hasExploitanten && filters?.showGemeentenWithoutExploitanten !== "no" ||
             hasExploitanten && filters?.showGemeentenWithoutExploitanten !== "only"))
        );
      });

    onFilterChange(filtered);
  }, [
    filters,
    gemeenten, 
    users,
    showStallingenFilter,
    showUsersFilter,
    showExploitantenFilter,
    onFilterChange
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        <label htmlFor="gemeenteName" className="text-sm font-medium text-gray-700">Gemeentenaam:</label>
        <input 
          ref={nameInputRef}
          type="text" 
          id="gemeenteName" 
          name="gemeenteName" 
          placeholder="Type om te zoeken..." 
          className="mt-1 p-2 border border-gray-300 rounded-md" 
          value={filters?.nameFilter || ""}
          onChange={handleNameFilterChange} 
        />
      </div>

      {(showStallingenFilter || showUsersFilter || showExploitantenFilter) && (
        <CollapsibleContent buttonText="Extra filter opties">
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Extra Filters</h2>
              <button 
                onClick={handleResetFilters}
                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
              >
                Reset Filters
              </button>
            </div>

            {showStallingenFilter && (
              <div className="flex items-center">
                <label htmlFor="showGemeentenWithoutStallingen" className="text-sm font-medium text-gray-700">Toon Gemeenten Zonder Stallingen:</label>
                <select 
                  id="showGemeentenWithoutStallingen" 
                  name="showGemeentenWithoutStallingen" 
                  value={filters?.showGemeentenWithoutStallingen || "no"}
                  onChange={(e) => dispatch(setShowGemeentenWithoutStallingen(e.target.value as "yes"|"no"|"only"))}
                  className="ml-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="yes">Ja</option>
                  <option value="no">Nee</option>
                  <option value="only">Alleen Zonder</option>
                </select>
              </div>
            )}

            {showUsersFilter && (
              <div className="flex items-center">
                <label htmlFor="showGemeentenWithoutUsers" className="text-sm font-medium text-gray-700">Toon Gemeenten Zonder Gemeentegebruikers:</label>
                <select 
                  id="showGemeentenWithoutUsers" 
                  name="showGemeentenWithoutUsers" 
                  value={filters?.showGemeentenWithoutUsers || "no"}
                  onChange={(e) => dispatch(setShowGemeentenWithoutUsers(e.target.value as "yes"|"no"|"only"))}
                  className="ml-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="yes">Ja</option>
                  <option value="no">Nee</option>
                  <option value="only">Alleen Zonder</option>
                </select>
              </div>
            )}

            {showExploitantenFilter && (
              <div className="flex items-center">
                <label htmlFor="showGemeentenWithoutExploitanten" className="text-sm font-medium text-gray-700">Toon Gemeenten Zonder Exploitanten:</label>
                <select 
                  id="showGemeentenWithoutExploitanten" 
                  name="showGemeentenWithoutExploitanten" 
                  value={filters?.showGemeentenWithoutExploitanten || "yes"}
                  onChange={(e) => dispatch(setShowGemeentenWithoutExploitanten(e.target.value as "yes"|"no"|"only"))}
                  className="ml-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="yes">Ja</option>
                  <option value="no">Nee</option>
                  <option value="only">Alleen Zonder</option>
                </select>
              </div>
            )}
          </div>
        </CollapsibleContent>
      )}
    </div>
  );
};

export default GemeenteFilter; 