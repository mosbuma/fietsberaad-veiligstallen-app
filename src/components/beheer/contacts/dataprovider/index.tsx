import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/router';
import DataproviderEdit from "~/components/contact/DataproviderEdit";
import type { VSContactDataprovider } from "~/types/contacts";
import { useDataproviders } from '~/hooks/useDataproviders';
import { LoadingSpinner } from '../../common/LoadingSpinner';
import { Table } from '~/components/common/Table';

type DataproviderComponentProps = { 
};

const DataproviderComponent: React.FC<DataproviderComponentProps> = (props) => {
  const router = useRouter();

  const [currentContactID, setCurrentContactID] = useState<string | undefined>(undefined);

  const {dataproviders, isLoading, error, reloadDataproviders } = useDataproviders();
  
  const [filterText, setFilterText] = useState("");

  const filteredContacts = dataproviders.filter(contact => 
    contact.CompanyName?.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    // get the id from the url
    if("id" in router.query) {
      const id = router.query.id;
      if(id) {
        setCurrentContactID(id as string);
      }
    }   
  }, [router.query.id, dataproviders]);

  const handleEditContact = (id: string) => {
    setCurrentContactID(id);
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await fetch(`/api/protected/dataproviders/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete gemeente');
      }

      reloadDataproviders();
      setCurrentContactID(undefined);
    } catch (error) {
      console.error('Error deleting dataprovider:', error);
    }
  };

  const renderOverview = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4 flex-1">
            <h1 className="text-2xl font-bold">Dataleveranciers</h1>
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
            onClick={() => handleEditContact('new')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe Dataprovider
          </button>
        </div>

        <Table 
          columns={[
            {
              header: 'Naam',
              accessor: 'CompanyName'
            },
            {
              header: 'Naam in URL',
              accessor: 'UrlName'
            },
            {
              header: 'Status',
              accessor: (contact) => contact.Status === "1" ? "Actief" : "Inactief"
            },
            {
              header: '',
              accessor: (contact) => (
                <>
                  <button onClick={() => handleEditContact(contact.ID)} className="text-yellow-500 mx-1 disabled:opacity-40">✏️</button>
                  <button onClick={() => handleDeleteContact(contact.ID)} className="text-red-500 mx-1 disabled:opacity-40" disabled={true}>🗑️</button>
                </>
              )
            }
          ]}
          data={filteredContacts.sort((a, b) => (a.CompanyName || '').localeCompare(b.CompanyName || ''))}
          className="min-w-full bg-white"
        />
      </div>
    );
  };

  const renderEdit = (isSm: boolean = false) => {
    const showDataproviderEdit = currentContactID !== undefined;

    if(!showDataproviderEdit) {
      return null;
    }

    const handleOnClose = async (confirmClose: boolean = false) => {
      if (confirmClose && (confirm('Wil je het bewerkformulier verlaten?')===false)) { 
        return;
      }
        
      if(showDataproviderEdit) {
        reloadDataproviders();
        setCurrentContactID(undefined);
      } 
    }

    if(currentContactID !== undefined) {
      if(showDataproviderEdit) {
        return (
          <DataproviderEdit 
            id={currentContactID} 
            onClose={handleOnClose} 
          />
        );
      }
    }
  };

  return (
    <div>
      {currentContactID === undefined ? renderOverview() : renderEdit()}
    </div>
  );
};

export default DataproviderComponent;
