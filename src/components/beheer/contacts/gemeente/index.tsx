import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { displayInOverlay } from '~/components/Overlay';
import GemeenteEdit, { DEFAULTGEMEENTE } from "~/components/contact/GemeenteEdit";
import type { fietsenstallingtypen, security_roles } from '@prisma/client';
import ParkingEdit from '~/components/parking/ParkingEdit';

import { getParkingDetails } from "~/utils/parkings";
import type { ParkingDetailsType, VSContactGemeente, VSModule, VSUserWithRoles } from "~/types/";
import { UserEditComponent } from '~/components/beheer/users/UserEditComponent';

import moment from "moment";

type GemeenteComponentProps = { 
  gemeenten: VSContactGemeente[]
  users: VSUserWithRoles[]
  roles: security_roles[],
  fietsenstallingtypen: fietsenstallingtypen[]  
};

const GemeenteComponent: React.FC<GemeenteComponentProps> = (props) => {
  const router = useRouter();

  const { gemeenten, fietsenstallingtypen, users, roles} = props;

  const [currentContact, setCurrentContact] = useState<VSContactGemeente | undefined>(undefined);

  const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [currentRevision, setCurrentRevision] = useState<number>(0);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | undefined>(undefined);
  
  const [filterText, setFilterText] = useState("");

  const filteredContacts = gemeenten.filter(contact => 
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
        setCurrentContact(gemeenten.find((contact) => contact.ID === id));
      }
    }   
  }, [router.query.id, gemeenten]);

  const handleEditContact = (id: string) => {
    if(id === "nieuw") {
      const newContact = DEFAULTGEMEENTE;
      setCurrentContact(newContact);
    } else {
      setCurrentContact(gemeenten.find((contact) => contact.ID === id))
    }
    // router.replace(`/beheer/gemeenten-gemeenten/${id}`); -> sets the url but does not reload the page
  };

  const handleDeleteContact = (id: string) => {
    // Placeholder for delete thecontact logic
    console.log(`Delete thecontact: ${id}`);
  };

  const getContactPerson = (contact: VSContactGemeente): string => {
    const contactpersons = users.filter(user => user.security_users_sites?.some(site => site.SiteID === contact.ID && site.IsContact === true));
    return contactpersons.length > 0 && contactpersons[0]!==undefined ? 
      contactpersons[0].DisplayName + " (" + contactpersons[0].UserName + ")" : "";
  }

  const getModules = (contact: VSContactGemeente): string => {
    const modules = contact.modules_contacts?.map(module => module.module.Name).join(", ") || "";
    return modules;
  } 

  const renderOverview = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold">Gemeenten</h1>
            {gemeenten.length > 20 && (
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
            onClick={() => handleEditContact('nieuw')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe Gemeente
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Naam</th>
              <th className="py-2">Contactpersoon</th>
              <th className="py-2">Modules</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.sort((a, b) => (a.CompanyName || '').localeCompare(b.CompanyName || '')).map((contact) => { 
              return (
                <tr key={contact.ID}>
                  <td className="border px-4 py-2">{contact.CompanyName}</td>
                  <td className="border px-4 py-2">{getContactPerson(contact)}</td>
                  <td className="border px-4 py-2">{getModules(contact)}</td>
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
    const showGemeenteEdit = showStallingEdit || showUserEdit || currentContact?.ID !== undefined;

    // filter users based on the security_users_sites.SiteID
    const filteredUsers = users.filter(user => user.security_users_sites?.some(site => site.SiteID === currentContact?.ID && (["extern"].includes(user.GroupID || "") === true)));

    if(!showStallingEdit && !showGemeenteEdit && !showUserEdit) {
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
      } else if(showGemeenteEdit) {
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
            <UserEditComponent id={currentUserId} type="gemeente" users={users} roles={roles} onClose={()=>setCurrentUserId(undefined)}/>) }
        { currentContact && (
          <GemeenteEdit 
            gemeenten={gemeenten} 
            users={filteredUsers}
            fietsenstallingtypen={fietsenstallingtypen}
            id={currentContact.ID} 
            onClose={() => handleOnClose(true)} 
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

export default GemeenteComponent;
