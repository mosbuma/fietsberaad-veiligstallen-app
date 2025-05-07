import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { displayInOverlay } from '~/components/Overlay';
import ExploitantEdit from "~/components/contact/ExploitantEdit";
import ParkingEdit from '~/components/parking/ParkingEdit';

import { getParkingDetails } from "~/utils/parkings";
import type { VSContactExploitant} from "~/types/contacts";
import type { ParkingDetailsType } from "~/types/parking";

import { UserEditComponent } from '~/components/beheer/users/UserEditComponent';
import { makeClientApiCall } from '~/utils/client/api-tools';
import { useUsers } from '~/hooks/useUsers';
import { useExploitanten } from '~/hooks/useExploitanten';
import { useGemeenten } from '~/hooks/useGemeenten';
import { LoadingSpinner } from '../../common/LoadingSpinner';

type ExploitantComponentProps = { 
};

const ExploitantComponent: React.FC<ExploitantComponentProps> = (props) => {
  const router = useRouter();

  const { users, isLoading: isLoadingUsers, error: errorUsers } = useUsers();
  const { exploitanten, isLoading: isLoadingExploitanten, error: errorExploitanten, reloadExploitanten } = useExploitanten();
  const { gemeenten, isLoading: isLoadingGemeenten, error: errorGemeenten } = useGemeenten();

  const [currentContactID, setCurrentContactID] = useState<string | undefined>(undefined);
  const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [currentRevision, setCurrentRevision] = useState<number>(0);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | undefined>(undefined);
  const [filterText, setFilterText] = useState("");

  const filteredContacts = exploitanten.filter(contact => 
    contact.CompanyName?.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    if (currentStallingId !== undefined) {
      if(currentStalling === undefined || currentStalling?.ID !== currentStallingId) {
        getParkingDetails(currentStallingId).then((stalling) => {
          if (null !== stalling) {
            setCurrentStalling(stalling);
          } else {
            console.error("Failed to load stalling with ID: " + currentStallingId);
            setCurrentStalling(undefined);
          }
        });
      }
    } else {
      if(currentStalling !== undefined) {
        setCurrentStalling(undefined);
      } 
    }
  }, [currentStallingId, currentRevision]);

  useEffect(() => {
    if("id" in router.query) {
      const id = router.query.id;
      if(id) {
        setCurrentContactID(id as string);
      }
    }   
  }, [router.query.id, exploitanten]);

  const handleEdit = (id: string) => {
    setCurrentContactID(id);
  };

  const handleDelete = async(id: string) => {
    if(confirm("Weet je zeker dat je deze exploitant wilt verwijderen?")) {
      const response = await makeClientApiCall<VSContactExploitant>(`/api/protected/exploitant/${id}`, "DELETE");
      if(response.success) {
        alert("Exploitant verwijderd");

        reloadExploitanten(); // Refresh the list after deletion
      } else {
        alert("Er is een fout opgetreden bij het verwijderen van de exploitant.");
        console.error("Unable to delete contact:", response.error);
      }
    }
  };

  const getGemeenten = (contact: VSContactExploitant) => {
    const gemeenteIDs = contact.isManagingContacts?.map(c => c.childSiteID);
    const selected = gemeenteIDs.map(id=>{
      const gemeente = gemeenten.find(g => g.ID === id);
      return gemeente ? gemeente.CompanyName : "Onbekende gemeente";
    });
    return selected.sort().map(g=><>{g}<br/></>);
  }

  const isAdmin = true; // TODO: check if the user is an admin

  const renderOverview = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold">Exploitanten</h1>
            {exploitanten.length > 20 && (
              <input
                type="text"
                placeholder="Filter op naam..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="px-3 py-1 border rounded-md flex-1 max-w-md"
              />
            )}
          </div>
          <button 
            onClick={() => handleEdit('new')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe Exploitant
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Naam</th>
              <th className="py-2">E-mail</th>
              <th className="py-2">Gemeente(n)</th>
              <th className="py-2">Actief</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.sort((a, b) => (a.CompanyName || '').localeCompare(b.CompanyName || '')).map((contact) => { 
              return (
                <tr key={contact.ID}>
                  <td className="border px-4 py-2">{contact.CompanyName}</td>
                  <td className="border px-4 py-2">{contact.Helpdesk}</td>
                  <td className="border px-4 py-2">{getGemeenten(contact)}</td>
                  <td className="border px-4 py-2">
                    {contact.Status === "1" ? 
                      <span className="text-green-500">●</span> : 
                      <span className="text-red-500">●</span>
                    }
                  </td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handleEdit(contact.ID)} className="text-yellow-500 mx-1 disabled:opacity-40">✏️</button>
                    <button onClick={() => handleDelete(contact.ID)} className="text-red-500 mx-1 disabled:opacity-40" disabled={!isAdmin}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderEdit = (isSm: boolean = false) => {
    const showStallingEdit = currentStalling !== undefined;
    const showUserEdit = currentUserId !== undefined;
    const showExploitantEdit = showStallingEdit || showUserEdit || currentContactID !== undefined;

    const filteredUsers = users.filter(user => user.sites.some(site => site.SiteID === currentContactID) === true);

    if(!showStallingEdit && !showExploitantEdit && !showUserEdit) {
      return null;
    }

    const handleOnClose = async (verbose: boolean = false) => {
      if (verbose && (confirm('Wil je het bewerkformulier verlaten?')===false)) { 
        return;
      }
        
      if(showUserEdit) {
        setCurrentUserId(undefined);
      } else if(showStallingEdit) {
        setCurrentStallingId(undefined);
      } else if(showExploitantEdit) {
        reloadExploitanten();
        setCurrentContactID(undefined);
      } 
    }

    if(currentContactID !== undefined) {
      if(showUserEdit) {
        return (
          <UserEditComponent 
            id={currentUserId} 
            currentContactID={currentContactID}
            users={filteredUsers} 
            onClose={()=>setCurrentUserId(undefined)} 
            showBackButton={false} />
        );
      } else if(showStallingEdit) {
        return (
          <ParkingEdit 
            parkingdata={currentStalling} 
            onClose={() => setCurrentStallingId(undefined)} 
            onChange={() => { setCurrentRevision(currentRevision + 1); }} 
          />
        )} else if(showExploitantEdit) {
          return (
          <ExploitantEdit 
            id={currentContactID} 
            gemeenten={gemeenten}
            onClose={() => { 
              setCurrentContactID(undefined); 

              reloadExploitanten(); // Refresh the list after edit
            }} 
            onEditStalling={(stallingID: string | undefined) => setCurrentStallingId(stallingID) }
            onEditUser={(userID: string | undefined) => setCurrentUserId(userID) }
            onSendPassword={(userID: string | undefined) => alert("send password to user " + userID) }
          />
        );
      }
    }
  };

  if(isLoadingUsers || isLoadingExploitanten || isLoadingGemeenten) {
    const whatIsLoading = [
        isLoadingUsers && "Gebruikers",
        isLoadingExploitanten && "Exploitanten",
        isLoadingGemeenten && "Gemeenten",
    ].filter(Boolean).join(" + ");
    
    return <LoadingSpinner message={whatIsLoading + ' laden'} />;
  }

  if(errorUsers || errorExploitanten || errorGemeenten) {
    return <div>Error: {errorUsers || errorExploitanten || errorGemeenten}</div>;
  }
  
  return (
    <div>
      {currentContactID === undefined && currentStalling === undefined && currentUserId === undefined ? renderOverview() : renderEdit()}
    </div>
  );
};

export default ExploitantComponent;
