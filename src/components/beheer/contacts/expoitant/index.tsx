import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { displayInOverlay } from '~/components/Overlay';
import ExploitantEdit from "~/components/contact/ExploitantEdit";
import type { fietsenstallingtypen, security_roles } from '@prisma/client';
import ParkingEdit from '~/components/parking/ParkingEdit';

import { getParkingDetails } from "~/utils/parkings";
import type { VSContactExploitant, VSContactGemeente } from "~/types/contacts";
import { type VSUserWithRoles, VSUserGroupValues } from "~/types/users";
import type { ParkingDetailsType } from "~/types/parking";

import { UserEditComponent } from '~/components/beheer/users/UserEditComponent';
import { makeClientApiCall } from '~/utils/client/api-tools';

type ExploitantComponentProps = { 
  gemeenten: VSContactGemeente[]
  users: VSUserWithRoles[]
  roles: security_roles[],
  fietsenstallingtypen: fietsenstallingtypen[],  
  isAdmin: boolean,
};

const ExploitantComponent: React.FC<ExploitantComponentProps> = (props) => {
  const router = useRouter();

  const { gemeenten, fietsenstallingtypen, users, roles} = props;

  const [exploitanten, setExploitanten] = useState<VSContactExploitant[]>([]);
  const [currentContact, setCurrentContact] = useState<VSContactExploitant | undefined>(undefined);
  const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [currentRevision, setCurrentRevision] = useState<number>(0);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | undefined>(undefined);
  const [filterText, setFilterText] = useState("");

  // Fetch exploitanten on component mount
  useEffect(() => {
    fetchExploitanten();
  }, []);

  const fetchExploitanten = async () => {
    const response = await makeClientApiCall<VSContactExploitant[]>('/api/protected/exploitant');
    if (response.success && response.result) {
      setExploitanten(response.result);
    } else {
      console.error('Failed to fetch exploitanten:', response.error);
    }
  };

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
        setCurrentContact(exploitanten.find((contact) => contact.ID === id));
      }
    }   
  }, [router.query.id, exploitanten]);

  const handleNew = () => {
    setCurrentContact(undefined);
  }

  const handleEdit = (id: string) => {
    setCurrentContact(exploitanten.find((contact) => contact.ID === id));
  };

  const handleDelete = async(id: string) => {
    if(confirm("Weet je zeker dat je deze exploitant wilt verwijderen?")) {
      const response = await makeClientApiCall<VSContactExploitant>(`/api/protected/exploitant/${id}`, "DELETE");
      if(response.success) {
        alert("Exploitant verwijderd");
        fetchExploitanten(); // Refresh the list after deletion
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
            onClick={() => handleNew()}
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
    const showContactEdit = showStallingEdit || showUserEdit || currentContact?.ID !== undefined;

    // filter users based on the security_users_sites.SiteID
    const filteredUsers = users.filter(user => user.security_users_sites?.some(site => site.SiteID === currentContact?.ID && (["extern"].includes(user.GroupID || "") === true)));

    if(!showStallingEdit && !showContactEdit && !showUserEdit) {
      return null;
    }

    const handleOnClose = (verbose: boolean = false) => {
      if (verbose && (confirm('Wil je het bewerkformulier verlaten?')===false)) { 
        return;
      }
        
      if(showUserEdit) {
        setCurrentUserId(undefined);
      } else if(showStallingEdit) {
        setCurrentStallingId(undefined);
      } else if(showContactEdit) {
        setCurrentContact(undefined);
      } 
    }

    let content: React.ReactNode = (
      <>
        { currentStalling && showStallingEdit && (
          <ParkingEdit 
            parkingdata={currentStalling} 
            onClose={() => setCurrentStallingId(undefined)} 
            onChange={() => { setCurrentRevision(currentRevision + 1); }} 
          />
        )}
        { currentUserId && showUserEdit && (
            <UserEditComponent 
              id={currentUserId} 
              groupid={VSUserGroupValues.Exploitant} 
              users={users} 
              roles={roles} 
              onClose={()=>setCurrentUserId(undefined)} 
              showBackButton={false} />)}
        { currentContact && (
          <ExploitantEdit 
            exploitanten={exploitanten} 
            users={users}
            fietsenstallingtypen={fietsenstallingtypen}
            id={currentContact.ID} 
            onClose={() => { 
              setCurrentContact(undefined); 
              fetchExploitanten(); // Refresh the list after edit
            }} 
            onEditStalling={(stallingID: string | undefined) => setCurrentStallingId(stallingID) }
            onEditUser={(userID: string | undefined) => setCurrentUserId(userID) }
            onSendPassword={(userID: string | undefined) => alert("send password to user " + userID) }
            hidden={showStallingEdit || showUserEdit}
          />
        )}
      </>
    );

    return displayInOverlay(content, isSm, currentStalling?.Title || currentContact?.CompanyName || "", () => handleOnClose());
  }
  
  const isSm = false;
  if(currentStalling !== undefined || currentContact !== undefined || currentUserId !== undefined) {
    return renderEdit(isSm);
  } else {
    return renderOverview();
  }
};

export default ExploitantComponent;
