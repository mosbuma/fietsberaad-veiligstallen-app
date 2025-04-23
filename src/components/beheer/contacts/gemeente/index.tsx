import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import GemeenteEdit, { DEFAULTGEMEENTE } from "~/components/contact/GemeenteEdit";
import type { fietsenstallingtypen, security_roles } from '@prisma/client';
import ParkingEdit from '~/components/parking/ParkingEdit';
import GemeenteFilter from '~/components/beheer/common/GemeenteFilter';

import { getParkingDetails } from "~/utils/parkings";
import type { VSContactGemeente } from "~/types/contacts";
import { type VSUserWithRoles, VSUserGroupValues } from "~/types/users";
import type { ParkingDetailsType } from "~/types/parking";
import { UserEditComponent } from '~/components/beheer/users/UserEditComponent';
import { makeClientApiCall } from '~/utils/client/api-tools';

import moment from "moment";
import { GemeentenResponse } from '~/pages/api/protected/gemeenten';

type GemeenteComponentProps = { 
  users: VSUserWithRoles[]
  roles: security_roles[],
  fietsenstallingtypen: fietsenstallingtypen[]  
};

const GemeenteComponent: React.FC<GemeenteComponentProps> = (props) => {
  const router = useRouter();
  const { fietsenstallingtypen, users, roles } = props;

  const [gemeenten, setGemeenten] = useState<VSContactGemeente[]>([]);
  const [filteredGemeenten, setFilteredGemeenten] = useState<VSContactGemeente[]>([]);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [currentContact, setCurrentContact] = useState<VSContactGemeente | undefined>(undefined);
  const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(undefined);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [currentRevision, setCurrentRevision] = useState<number>(0);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGemeenten = async () => {
    try {
      const response = await makeClientApiCall<GemeentenResponse>('/api/protected/gemeenten');
      if (!response.success) {
        throw new Error('Failed to fetch gemeenten');
      }
      const data = response.result?.data;
      if(data) {
        setGemeenten(data);
        setFilteredGemeenten(data);
      }
    } catch (error) {
      console.error('Error fetching gemeenten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGemeenten();
  }, [updateCounter]);

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
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/protected/gemeenten/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete gemeente');
      }
      setUpdateCounter(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting gemeente:', error);
    }
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
    if (isLoading) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gemeenten</h1>
          <button 
            onClick={() => handleEditContact('nieuw')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe Gemeente
          </button>
        </div>

        <GemeenteFilter
          gemeenten={gemeenten}
          users={users}
          onFilterChange={setFilteredGemeenten}
          showStallingenFilter={true}
          showUsersFilter={true}
          showExploitantenFilter={true}
        />

        <table className="min-w-full bg-white mt-4">
          <thead>
            <tr>
              <th className="py-2">Naam</th>
              <th className="py-2">Contactpersoon</th>
              <th className="py-2">Modules</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredGemeenten.sort((a, b) => (a.CompanyName || '').localeCompare(b.CompanyName || '')).map((contact) => { 
              return (
                <tr key={contact.ID}>
                  <td className="border px-4 py-2">{contact.CompanyName}</td>
                  <td className="border px-4 py-2">{getContactPerson(contact)}</td>
                  <td className="border px-4 py-2">{getModules(contact)}</td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handleEditContact(contact.ID)} className="text-yellow-500 mx-1 disabled:opacity-40">✏️</button>
                    <button onClick={() => handleDeleteContact(contact.ID)} className="text-red-500 mx-1 disabled:opacity-40">🗑️</button>
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

    const filteredUsers = users.filter(user => user.security_users_sites?.some(site => site.SiteID === currentContact?.ID && (["extern"].includes(user.GroupID || "") === true)));

    if(!showStallingEdit && !showGemeenteEdit && !showUserEdit) {
      return null;
    }

    const handleOnClose = (confirmClose: boolean = false) => {
      if (confirmClose && (confirm('Wil je het bewerkformulier verlaten?')===false)) { 
        return;
      }
        
      if(showUserEdit) {
        setCurrentUserId(undefined);
      } else if(showStallingEdit) {
        setCurrentStallingId(undefined);
      } else if(showGemeenteEdit) {
        setCurrentContact(undefined);
        setUpdateCounter(prev => prev + 1);
      } 
    }

    if(showUserEdit) {
      return (
        <UserEditComponent 
          id={currentUserId} 
          users={filteredUsers} 
          roles={roles} 
          onClose={() => handleOnClose(true)}
          groupid={VSUserGroupValues.Extern}
          showBackButton={true}
        />
      );
    } else if(showStallingEdit) {
      return (
        <ParkingEdit 
          parkingdata={currentStalling} 
          onClose={() => handleOnClose(true)} 
          onChange={() => setCurrentRevision(prev => prev + 1)}
        />
      );
    } else if(showGemeenteEdit) {
      return (
        <GemeenteEdit 
          id={currentContact?.ID || "nieuw"} 
          gemeenten={gemeenten} 
          users={users} 
          fietsenstallingtypen={fietsenstallingtypen} 
          onClose={() => handleOnClose(true)} 
          onEditStalling={(stallingID) => setCurrentStallingId(stallingID)}
          onEditUser={(userID) => setCurrentUserId(userID)}
          onSendPassword={(userID) => alert("send password to user " + userID)}
          hidden={false} 
          allowEdit={true}
        />
      );
    }
  };

  return (
    <div>
      {currentContact === undefined && currentStalling === undefined && currentUserId === undefined ? renderOverview() : renderEdit()}
    </div>
  );
};

export default GemeenteComponent;
