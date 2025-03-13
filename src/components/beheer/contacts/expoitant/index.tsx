import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { displayInOverlay } from '~/components/Overlay';
import ExploitantEdit from "~/components/contact/ExploitantEdit";
import type { fietsenstallingtypen, security_roles } from '@prisma/client';
import ParkingEdit from '~/components/parking/ParkingEdit';

import { getParkingDetails } from "~/utils/parkings";
import type { VSContactExploitant, VSContactGemeente } from "~/types/contacts";
import type { VSUserWithRoles } from "~/types/users";
import type { ParkingDetailsType } from "~/types/parking";

import { UserEditComponent } from '~/components/beheer/users/UserEditComponent';

type ExploitantComponentProps = { 
  exploitanten: VSContactExploitant[]
  gemeenten: VSContactGemeente[]
  users: VSUserWithRoles[]
  roles: security_roles[],
  fietsenstallingtypen: fietsenstallingtypen[]  
};

const ExploitantComponent: React.FC<ExploitantComponentProps> = (props) => {
  const router = useRouter();

  const { exploitanten, gemeenten, fietsenstallingtypen, users, roles} = props;

  const [currentContact, setCurrentContact] = useState<VSContactExploitant | undefined>(undefined);

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
  }, [
    currentStallingId,
    currentRevision
  ]);

  useEffect(() => {
    // get the id from the url
    if("id" in router.query) {
      const id = router.query.id;
      if(id) {
        setCurrentContact(exploitanten.find((contact) => contact.ID === id));
      }
    }   
  }, [router.query.id, exploitanten]);

  const handleNewContact = () => {
    // Placeholder for the new contact logic
    setCurrentContact(undefined);
  }

  const handleEditContact = (id: string) => {
    setCurrentContact(exploitanten.find((contact) => contact.ID === id));
  };

  const handleDeleteContact = (id: string) => {
    // Placeholder for the delete contact logic
    console.log(`Delete thecontact: ${id}`);
  };

  const getGemeenten = (contact: VSContactExploitant) => {
    const gemeenteIDs = contact.isManagingContacts?.map(c => c.childSiteID);
    const selected = gemeenteIDs.map(id=>{
      const gemeente = gemeenten.find(g => g.ID === id);
      return gemeente ? gemeente.CompanyName : "Onbekende gemeente";
    });
    return selected.sort().map(g=><>{g}<br/></>);
  }

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
            onClick={() => handleNewContact()}
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
                    <button onClick={() => handleEditContact(contact.ID)} className="text-yellow-500 mx-1 disabled:opacity-40">✏️</button>
                    <button onClick={() => handleDeleteContact(contact.ID)} className="text-red-500 mx-1 disabled:opacity-40" disabled={true}>🗑️</button>
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
            <UserEditComponent id={currentUserId} type="exploitant" users={users} roles={roles} onClose={()=>setCurrentUserId(undefined)}/>) }
        { currentContact && (
          <ExploitantEdit 
            exploitanten={exploitanten} 
            users={filteredUsers}
            fietsenstallingtypen={fietsenstallingtypen}
            id={currentContact.ID} 
            onClose={() => setCurrentContact(undefined)} 
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
