import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import { displayInOverlay } from '~/components/Overlay';
import DataproviderEdit from "~/components/contact/DataproviderEdit";

import type { VSContactDataprovider } from "~/types/";

type DataproviderComponentProps = { 
  dataproviders: VSContactDataprovider[]
};

const DataproviderComponent: React.FC<DataproviderComponentProps> = (props) => {
  const router = useRouter();

  const { dataproviders } = props;

  const [currentContact, setCurrentContact] = useState<VSContactDataprovider | undefined>(undefined);
  
  const [filterText, setFilterText] = useState("");

  const filteredContacts = dataproviders.filter(contact => 
    contact.CompanyName?.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    // get the id from the url
    if("id" in router.query) {
      const id = router.query.id;
      if(id) {
        setCurrentContact(dataproviders.find((contact) => contact.ID === id));
      }
    }   
  }, [router.query.id, dataproviders]);

  const handleNewContact = () => {
    // Placeholder for the new contact logic
    setCurrentContact(undefined);
  }

  const handleEditContact = (id: string) => {
    setCurrentContact(dataproviders.find((contact) => contact.ID === id));
  };

  const handleDeleteContact = (id: string) => {
    // Placeholder for the delete contact logic
    console.log(`Delete thecontact: ${id}`);
  };

  const renderOverview = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold">Exploitanten</h1>
            {dataproviders.length > 20 && (
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
            Nieuwe Dataprovider
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Naam</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.sort((a, b) => (a.CompanyName || '').localeCompare(b.CompanyName || '')).map((contact) => { 
              return (
                <tr key={contact.ID}>
                  <td className="border px-4 py-2">{contact.CompanyName}</td>
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
    const showContactEdit = currentContact?.ID !== undefined;
    console.log("#### RENDER EDIT DATAPROVIDER", currentContact, showContactEdit);


    if(!showContactEdit) {
      console.log("#### RENDER EDIT DATAPROVIDER -> return null");
      return null;
    }

    const handleOnClose = (verbose: boolean = false) => {
      if (verbose && (confirm('Wil je het bewerkformulier verlaten?')===false)) { 
        return;
      }
        
      setCurrentContact(undefined);
    }

    let content: React.ReactNode = (
      <>
        { currentContact && (
          <DataproviderEdit 
            id={currentContact.ID} 
            dataproviders={dataproviders} 
            onClose={() => setCurrentContact(undefined)} 
            hidden={false}
          />
        )}
      </>
    );

    return displayInOverlay(content, isSm, currentContact?.CompanyName || "", () => handleOnClose());
  }
  
  const isSm = false;
  if(currentContact !== undefined) {
    return renderEdit(isSm);
  } else {
    return renderOverview();
  }
};

export default DataproviderComponent;
