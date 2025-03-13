import React, { useEffect, useState } from 'react';
import FormInput from "~/components/Form/FormInput";
import PageTitle from "~/components/PageTitle";
import Button from '@mui/material/Button';

import { VSUserWithRoles } from '~/types/users';
import { VSContactDataprovider } from '~/types/contacts';

type DataproviderEditProps = {
    id: string;
    dataproviders: VSContactDataprovider[];
    onClose: () => void;
}

const DataproviderEdit = (props: DataproviderEditProps) => {

    // fields for dataprovider
    // ID,
    // CompanyName,
    // UrlName,
    // Password

    type CurrentState = {
      CompanyName: string|undefined,
      UrlName: string|undefined,
      Password: string|undefined,
    }
  
    const isNewContact = props.id === "nieuw";
    const [CompanyName, setCompanyName] = useState<string|undefined>(undefined);
    const [UrlName, setUrlName] = useState<string|undefined>(undefined);
    const [Password, setPassword] = useState<string|undefined>(undefined);
  
    const [initialData, setInitialData] = useState<CurrentState>({
      CompanyName: undefined,
      UrlName: undefined,
      Password: undefined,
    });

  useEffect(() => {
      if (!isNewContact) {
        const thecontact = props.dataproviders.find(c => c.ID === props.id);
        if (thecontact) {
          const initial = {
            CompanyName: thecontact.CompanyName || initialData.CompanyName,
            UrlName: thecontact.UrlName || initialData.UrlName,
            Password: thecontact.Password || initialData.Password,
          };
  
          setCompanyName(initial.CompanyName);
          setUrlName(initial.UrlName);
          setPassword(initial.Password);
  
          setInitialData(initial);
        }
      }
    }, [props.id, props.dataproviders, isNewContact]);

    const isDataChanged = () => {
        if (isNewContact) {
          return CompanyName || UrlName || Password;
        }
        return (
            CompanyName !== initialData.CompanyName ||
            UrlName !== initialData.UrlName ||
            Password !== initialData.Password
        );
      };
    
      const handleUpdateDataprovider = async () => {
        if (!CompanyName || !UrlName || !Password) {
          alert("CompanyName, UrlName and Password cannot be empty.");
          return;
        }
    
        try {
          const method = isNewContact ? 'POST' : 'PUT';
          const url = isNewContact ? '/api/dataproviders' : `/api/dataproviders/${props.id}`;
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              CompanyName,
              UrlName,
              Password,
            }),
          });
    
          if (response.ok) {
            props.onClose();
          } else {
            console.error('Failed to update dataprovider');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
    
      const handleResetDataprovider = () => {
        if (isNewContact) {
          setCompanyName(undefined);
          setUrlName(undefined);
          setPassword(undefined);
        } else {
          setCompanyName(initialData.CompanyName);
          setUrlName(initialData.UrlName);
          setPassword(initialData.Password);
        }
      };
    
      const handleClose = (close: boolean) => {
        console.log("handleClose", close);
      };

      const renderTopBar = (currentContact: VSContactDataprovider | undefined) => {
        const title: string = currentContact ? "Dataleverancier " + currentContact?.CompanyName : "Nieuwe dataleverancier";
        const showUpdateButtons: boolean = true;
        const allowSave: boolean = true;
        return (
            <PageTitle className="flex w-full justify-center sm:justify-start">
              <div className="mr-4 hidden sm:block">
                {title}
              </div>
              {showUpdateButtons === true && allowSave && (
                <Button
                  key="b-1"
                  className="mt-3 sm:mt-0"
                  onClick={(e: any) => {
                    if (e) e.preventDefault();
                    handleUpdateDataprovider();
                  }}
                >
                  Opslaan
                </Button>
              )}
              {showUpdateButtons === true && (
                <Button
                  key="b-3"
                  className="ml-2 mt-3 sm:mt-0"
                  onClick={(e: any) => {
                    if (e) e.preventDefault();
    
                    if (confirm("Wil je het bewerkformulier verlaten?")) {
                      props.onClose();
                    }
                  }}
                >
                  Annuleer
                </Button>
              )}
              {showUpdateButtons === false && (
                <Button
                  key="b-4"
                  className="ml-2 mt-3 sm:mt-0"
                  onClick={(e: any) => {
                    if (e) e.preventDefault();
                    props.onClose();
                  }}
                >
                  Terug
                </Button>
              )}
            </PageTitle>
        );
      };

      const thecontact: VSContactDataprovider | undefined = props.dataproviders.find(c => c.ID === props.id);
      console.log("#### THECONTACT", thecontact);

    return (
      <div style={{ minHeight: "65vh" }}>
      <div
        className="
          flex justify-between
          sm:mr-8
        "
      >        
        { renderTopBar(thecontact) }
        </div>
          <div className="mt-4 w-full">
              <FormInput 
                label="CompanyName"
                value={CompanyName} 
                onChange={(e) => setCompanyName(e.target.value)} 
                required 
              />
              <br />
              <FormInput 
                label="ContractorID (datastandaard)"
                value={UrlName} 
                onChange={(e) => setUrlName(e.target.value)} 
              />
              <br />
              <FormInput 
                label="Password"
                value={Password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <br />
          </div>
      </div>
  );
};

export default DataproviderEdit;