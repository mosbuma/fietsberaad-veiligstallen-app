import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { contacts, fietsenstallingen } from '@prisma/client';
import Overlay from '~/components/Overlay';
import Modal from '~/components/Modal';
import ContactEdit from "~/components/contact/ContactEdit";
import { ReportBikepark } from '../reports/ReportsFilter';

type ContactsComponentProps = { 
  contacts: contacts[]
  fietsenstallingen: ReportBikepark[]
  type: "organizations" | "exploitants" | "dataproviders" | "admins"
};

const ContactsComponent: React.FC<ContactsComponentProps> = (props) => {
  const router = useRouter();

  const { contacts, fietsenstallingen, type} = props;

  const [currentContact, setCurrentContact] = useState<contacts | undefined>(undefined);

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

  const isSm = false;

  console.log("currentContact", currentContact);
  return (
    <>
      {currentContact?.ID !== undefined && isSm && (
        <>
        <Overlay
          title={currentContact.CompanyName || ""}
          onClose={() => setCurrentContact(undefined)}
        >
          <ContactEdit 
            contacts={contacts} 
            id={currentContact.ID} 
            onClose={() => setCurrentContact(undefined)} 
          />
        </Overlay>
      </>)}

      {currentContact?.ID && !isSm && (<>
        <Modal
          onClose={() => setCurrentContact(undefined)}
          clickOutsideClosesDialog={false}
        >
          <ContactEdit 
            contacts={contacts} 
            id={currentContact.ID} 
            onClose={() => setCurrentContact(undefined)} 
          />
          </Modal>
      </>)}

      { renderOverview() }
    </>
    
  );

  return null;

};

export default ContactsComponent;
