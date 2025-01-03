import React, { useEffect, useState } from 'react';

import router, { useRouter } from 'next/router';
import { contacts, fietsenstallingen } from '@prisma/client';
import Overlay from '~/components/Overlay';
import Modal from '~/components/Modal';
import ContactEdit from "~/components/contact/ContactEdit";
import type { fietsenstallingtypen } from '@prisma/client';
import ParkingEdit from '~/components/parking/ParkingEdit';

import { getParkingDetails, getNewStallingDefaultRecord } from "~/utils/parkings";
import { type ParkingDetailsType } from "~/types/";


type ContactsComponentProps = { 
  contacts: contacts[]
  fietsenstallingtypen: fietsenstallingtypen[]  
  type: "organizations" | "exploitants" | "dataproviders" | "admins"
};

const ContactsComponent: React.FC<ContactsComponentProps> = (props) => {
  const router = useRouter();

  const { contacts, fietsenstallingtypen, type} = props;

  const [currentContact, setCurrentContact] = useState<contacts | undefined>(undefined);

  const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(undefined);
  const [currentRevision, setCurrentRevision] = useState<number>(0);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType | undefined>(undefined);

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
        setCurrentContact(contacts.find((contact) => contact.ID === id));
      }
    }   
  }, [router.query.id, contacts]);

  const getTarget = (id?: string) => {
    let target = "/beheer/contacts-gemeenten";
    if(id) {
      target += `/${id}`;
    }
    return target;
  }


  const handleEditContact = (id: string) => {
    router.push(getTarget(id));
  };

  const handleDeleteContact = (id: string) => {
    // Placeholder for delete thecontact logic
    console.log(`Delete thecontact: ${id}`);
  };

  console.log("contacts component - contacts:", contacts);

  const renderOverview = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Contacten{currentContact?.ID ? ` - EDITMODE ${currentContact.ID}` : ""}</h1>
          <button 
            onClick={() => router.push(getTarget('nieuw'))}
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
            {contacts.sort((a, b) => (a.CompanyName || '').localeCompare(b.CompanyName || '')).map((contact) => { 
              return (
                <tr key={contact.ID}>
                  <td className="border px-4 py-2">{contact.CompanyName}</td>
                  <td className="border px-4 py-2">...contactpersoon...</td>
                  <td className="border px-4 py-2">...modules...</td>
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
    const showContactEdit = showStallingEdit || currentContact?.ID !== undefined;

    if(!showStallingEdit && !showContactEdit) {
      return null;
    }

    const handleOnClose = (verbose: boolean = false) => {
      if (verbose && (confirm('Wil je het bewerkformulier verlaten?')===false)) { 
        return;
      }
        
      if(showStallingEdit) {
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
        { currentContact && showContactEdit && (
          <ContactEdit 
            contacts={contacts} 
            fietsenstallingtypen={fietsenstallingtypen}
            id={currentContact.ID} 
            onClose={() => setCurrentContact(undefined)} 
            onEditStalling={(stallingID: string | undefined) => setCurrentStallingId(stallingID) }
            hidden={showStallingEdit}
          />
        )}
      </>
    );

    if(isSm) {
      return (
        <Overlay
          title={currentStalling?.Title || currentContact?.CompanyName || ""}
          onClose={() => handleOnClose()}
        >
          { content }
        </Overlay>
      )
    } else {
      return (
        <Modal
          onClose={() => handleOnClose()}
          clickOutsideClosesDialog={false}
          >
          { content }
        </Modal>
      )
    }
  }
  
  const isSm = false;
  if(currentStalling !== undefined || currentContact !== undefined) {
    return renderEdit(isSm);
  } else {
    return renderOverview();
  }
};

export default ContactsComponent;
