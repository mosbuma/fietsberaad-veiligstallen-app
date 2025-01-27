import React, { useEffect, useState } from 'react';
import ParkingEditLocation from "~/components/parking/ParkingEditLocation";
import { Tabs, Tab } from '@mui/material';
import ContactFietsenstallingen from './ContactFietsenstallingen';
import type { fietsenstallingtypen } from '@prisma/client';
import FormInput from "~/components/Form/FormInput";
import FormTimeInput from "~/components/Form/FormTimeInput";
import ContactEditLogo from "~/components/contact/ContactEditLogo";
import SectionBlockEdit from "~/components/SectionBlock";
import PageTitle from "~/components/PageTitle";
import Button from '@mui/material/Button';

import { VSContact, VSUserWithRoles } from '~/types';
import ContactUsers from './ContactUsers';
import FormSelect from '../Form/FormSelect';

type ContactEditProps = {
    id: string;
    contacts: VSContact[];
    users: VSUserWithRoles[];
    fietsenstallingtypen: fietsenstallingtypen[]; 
    onClose: () => void;
    onEditStalling: (stallingID: string | undefined) => void;
    onEditUser: (userID: string | undefined) => void;
    onSendPassword: (userID: string | undefined) => void;
    hidden: boolean;
}

// add a serverside call that gets all stallingen for the contact


const ContactEdit = (props: ContactEditProps) => {
    const [selectedTab, setSelectedTab] = useState<string>("tab-algemeen");
    const [centerCoords, setCenterCoords] = React.useState<string | undefined>(undefined);

    type CurrentState = {
      organisatie: string|undefined,
      alternatieveNaam: string|undefined,
      urlVriendelijkeNaam: string|undefined,
      postcodeID: string|undefined,
      emailHelpdesk: string|undefined,
      dagstart: Date|undefined,
      coordinaten: string|undefined,
      initialzoom: number,
      bankRekeningnummer: string|undefined,
      bankPlaats: string|undefined,
      bankTnv: string|undefined,
      notitie: string|undefined,
      registratiedatum: Date|undefined,
    }
  
    const isNewContact = props.id === "nieuw";
    const [organisatie, setOrganisatie] = useState<string|undefined>(undefined);
    const [alternatieveNaam, setAlternatieveNaam] = useState<string|undefined>(undefined);
    const [urlVriendelijkeNaam, setUrlVriendelijkeNaam] = useState<string|undefined>(undefined);
    const [postcodeID, setPostcodeID] = useState<string|undefined>(undefined);
    const [emailHelpdesk, setEmailHelpdesk] = useState<string|undefined>(undefined);
    const [dagstart, setDagstart] = useState<Date|undefined>(undefined);
    const [coordinaten, setCoordinaten] = useState<string|undefined>(undefined);
    const [initialzoom, setInitialzoom] = useState<number>(13);
    const [bankRekeningnummer, setBankRekeningnummer] = useState<string|undefined>(undefined);
    const [bankPlaats, setBankPlaats] = useState<string|undefined>(undefined);
    const [bankTnv, setBankTnv] = useState<string|undefined>(undefined);
    const [notitie, setNotitie] = useState<string|undefined>(undefined);
    const [registratiedatum, setRegistratiedatum] = useState<Date|undefined>(undefined);
    const [contactID, setContactID] = useState<string | undefined>(undefined);
  
    const cDefaultCoordinaten = [52.1326, 5.2913].join(","); // center of NL by default 
  
    const [initialData, setInitialData] = useState<CurrentState>({
      organisatie: '',
      alternatieveNaam: undefined,
      urlVriendelijkeNaam: undefined,
      postcodeID: undefined,
      emailHelpdesk: undefined,
      dagstart: undefined,
      coordinaten: cDefaultCoordinaten,
      initialzoom: 13,
      bankRekeningnummer: undefined,
      bankPlaats: undefined,
      bankTnv: undefined,
      notitie: undefined,
      registratiedatum: undefined,
    });

  useEffect(() => {
      if (!isNewContact) {
        const thecontact = props.contacts.find(c => c.ID === props.id);
        if (thecontact) {
          const initial = {
            organisatie: thecontact.CompanyName || initialData.organisatie,
            alternatieveNaam: thecontact.AlternativeCompanyName || initialData.alternatieveNaam,
            urlVriendelijkeNaam: thecontact.UrlName || initialData.urlVriendelijkeNaam,
            postcodeID: thecontact.ZipID || initialData.postcodeID,
            emailHelpdesk: thecontact.Helpdesk || initialData.emailHelpdesk,
            dagstart: thecontact.DayBeginsAt || initialData.dagstart,
            coordinaten: thecontact.Coordinaten || initialData.coordinaten,
            initialzoom: thecontact.Zoom || initialData.initialzoom,
            bankRekeningnummer: thecontact.Bankrekeningnr || initialData.bankRekeningnummer,
            bankPlaats: thecontact.PlaatsBank || initialData.bankPlaats,
            bankTnv: thecontact.Tnv || initialData.bankTnv,
            notitie: thecontact.Notes || initialData.notitie,
            registratiedatum: thecontact.DateRegistration || initialData.registratiedatum,
          };
  
          setOrganisatie(initial.organisatie);
          setAlternatieveNaam(initial.alternatieveNaam);
          setUrlVriendelijkeNaam(initial.urlVriendelijkeNaam);
          setPostcodeID(initial.postcodeID);
          setEmailHelpdesk(initial.emailHelpdesk);
          setDagstart(initial.dagstart);
          setCoordinaten(initial.coordinaten);
          setInitialzoom(initial.initialzoom);
          setBankRekeningnummer(initial.bankRekeningnummer);
          setBankPlaats(initial.bankPlaats);
          setBankTnv(initial.bankTnv);
          setNotitie(initial.notitie);
          setRegistratiedatum(initial.registratiedatum);
  
          setInitialData(initial);
        }
      }
    }, [props.id, props.contacts, isNewContact]);

    const isDataChanged = () => {
        if (isNewContact) {
          return organisatie || postcodeID || dagstart || coordinaten || initialzoom;
        }
        return (
            organisatie !== initialData.organisatie ||
            alternatieveNaam !== initialData.alternatieveNaam ||
            urlVriendelijkeNaam !== initialData.urlVriendelijkeNaam ||
            postcodeID !== initialData.postcodeID ||
            emailHelpdesk !== initialData.emailHelpdesk ||
            dagstart !== initialData.dagstart ||
            coordinaten !== initialData.coordinaten ||
            initialzoom !== initialData.initialzoom ||
            bankRekeningnummer !== initialData.bankRekeningnummer ||
            bankPlaats !== initialData.bankPlaats ||
            bankTnv !== initialData.bankTnv ||
            notitie !== initialData.notitie ||
            registratiedatum !== initialData.registratiedatum
        );
      };
    
      const handleUpdateParking = async () => {
        if (!organisatie || !postcodeID || !dagstart || !coordinaten || !initialzoom) {
          alert("Organisatie, Postcode ID, Dagstart, Coordinaten and Initialzoom cannot be empty.");
          return;
        }
    
        try {
          const method = isNewContact ? 'POST' : 'PUT';
          const url = isNewContact ? '/api/contacts' : `/api/contacts/${props.id}`;
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              organisatie,
              alternatieveNaam,
              urlVriendelijkeNaam,
              postcodeID,
              emailHelpdesk,
              dagstart,
              coordinaten,
              initialzoom,
              bankRekeningnummer,
              bankPlaats,
              bankTnv,
              notitie,
              registratiedatum,
            }),
          });
    
          if (response.ok) {
            props.onClose();
          } else {
            console.error('Failed to update contact');
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };
    
      const handleReset = () => {
        if (isNewContact) {
          setOrganisatie(undefined);
          setAlternatieveNaam(undefined);
          setUrlVriendelijkeNaam(undefined);
          setPostcodeID(undefined);
          setEmailHelpdesk(undefined);
          setDagstart(undefined);
          setCoordinaten(undefined);
          setInitialzoom(13);
          setBankRekeningnummer(undefined);
          setBankPlaats(undefined);
          setBankTnv(undefined);
          setNotitie(undefined);
          setRegistratiedatum(undefined);
        } else {
          setOrganisatie(initialData.organisatie);
          setAlternatieveNaam(initialData.alternatieveNaam);
          setUrlVriendelijkeNaam(initialData.urlVriendelijkeNaam);
          setPostcodeID(initialData.postcodeID);
          setEmailHelpdesk(initialData.emailHelpdesk);
          setDagstart(initialData.dagstart);
          setCoordinaten(initialData.coordinaten);
          setInitialzoom(initialData.initialzoom);
          setBankRekeningnummer(initialData.bankRekeningnummer);
          setBankPlaats(initialData.bankPlaats);
          setBankTnv(initialData.bankTnv);
          setNotitie(initialData.notitie);
          setRegistratiedatum(initialData.registratiedatum);
        }
      };
    
      const updateCoordinatesFromMap = (lat: number, lng: number) => {
        const latlngstring = `${lat},${lng}`;
        if (latlngstring !== coordinaten) {
          setCoordinaten(latlngstring);
        } else {
          setCoordinaten(undefined);
        }
        setCenterCoords(undefined);
      }
    
      const updateCoordinatesFromForm = (isLat: boolean) => (e: { target: { value: string; }; }) => {
        try {
          const latlng = initialData.coordinaten?.split(",")||cDefaultCoordinaten.split(",");
          if (isLat) {
            latlng[0] = e.target.value;
          } else {
            latlng[1] = e.target.value;
          }
          setCoordinaten(latlng.join(","));
          setCenterCoords(latlng.join(","));
        } catch (ex: any) {
          if (ex.message) {
            console.warn('ContactsComponent - unable to set coordinates from form: ', ex.message());
          } else {
            console.warn('ContactsComponent - unable to set coordinates from form');
          }
        }
      }
    
      const getCoordinate = (isLat: boolean): string => {
        let coords = initialData.coordinaten;
        if (coordinaten !== undefined) {
          coords = coordinaten;
    
        }
        if (coords === "" || coords === undefined) return "";
    
        const latlng = coords.split(",");
        if (isLat) {
          return latlng[0]?.toString() || '';
        } else {
          return latlng[1]?.toString() || '';
        }
      }
    
      const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedTab(newValue);
      };

      const handleClose = (close: boolean) => {
        console.log("handleClose", close);
      };

      const handleRemoveParking = (message: string) => {
        console.log("handleRemoveParking", message);
      };

      const renderTopBar = (currentContact: VSContact | undefined) => {
        const parkingTitle: string = currentContact ? "Gemeente " + currentContact?.CompanyName : "Nieuwe gemeente";
        const showUpdateButtons: boolean = true;
        const allowSave: boolean = true;
        return (
            <PageTitle className="flex w-full justify-center sm:justify-start">
              <div className="mr-4 hidden sm:block">
                {parkingTitle}
              </div>
              {showUpdateButtons === true && allowSave && (
                <Button
                  key="b-1"
                  className="mt-3 sm:mt-0"
                  onClick={(e: any) => {
                    if (e) e.preventDefault();
                    handleUpdateParking();
                  }}
                >
                  Opslaan
                </Button>
              )}
              <Button
                key="b-2"
                className="ml-6 mt-3 sm:mt-0"
                onClick={(e: any) => {
                  if (e) e.preventDefault();
                  handleRemoveParking(
                    "Weet u zeker dat u deze gemeente wilt verbergen?",
                  );
                }}
              >
                Verberg
              </Button>
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

      const thecontact: VSContact | undefined = props.contacts.find(c => c.ID === props.id);
      // console.log("#### thecontact", thecontact);
      // console.log("#### thecontact", thecontact?.DayBeginsAt, dagstart);

      // Find the current user
      const currentUser = props.users.find(user => user.security_users_sites.some(site => site.SiteID === props.id));
      const userlist: { label: string, value: string | undefined }[] = [
        { label: "Geen", value: undefined },
        ...props.users.map(user => ({ label: (user.DisplayName || "") + " (" + (user.UserName || "") + ")", value: user.UserID || "" }))
      ];
      console.log("#### userlist", userlist);
      /* <div data-name="content-left" className={`sm:mr-12 ${props.hidden ? "hidden" : ""}`} style={{ minHeight: '87vh' }}> */
    return (
      <div className={`${props.hidden ? "hidden" : ""}`} style={{ minHeight: "65vh" }}>
      <div
        className="
          flex justify-between
          sm:mr-8
        "
      >        
        { renderTopBar(thecontact) }
        </div>
            <Tabs value={selectedTab} onChange={handleChange} aria-label="Edit contact">
              <Tab label="Algemeen" value="tab-algemeen" />
              <Tab label="Logos" value="tab-logos" />
              <Tab label="Coordinaten" value="tab-coordinaten" />
              <Tab label="Fietsenstallingen" value="tab-fietsenstallingen" />
              <Tab label="Gebruikers" value="tab-gebruikers" />
            </Tabs>
            {selectedTab === "tab-algemeen" && (
              <div className="mt-4 w-full">
                  <FormInput 
                    label="Naam"
                    value={organisatie} 
                    onChange={(e) => setOrganisatie(e.target.value)} 
                    required 
                  />
                  <br />
                  <FormSelect 
                    label="Contactpersoon"
                    value={currentUser?.UserID} 
                    onChange={(e) => setContactID(e.target.value)} 
                    required
                    options={userlist}
                  />
                  <br />
                  <FormInput 
                    label="Alternatieve naam"
                    value={alternatieveNaam} 
                    onChange={(e) => setAlternatieveNaam(e.target.value)} 
                  />
                  <br />
                  <FormInput 
                    label="URL vriendelijke naam"
                    value={urlVriendelijkeNaam} 
                    onChange={(e) => setUrlVriendelijkeNaam(e.target.value)} 
                  />
                  <br />
                  <FormInput 
                    label="Postcode ID"
                    value={postcodeID} 
                    onChange={(e) => setPostcodeID(e.target.value)} 
                  />
                  <br />
                  <FormInput 
                    label="Email helpdesk"
                    value={emailHelpdesk} 
                    onChange={(e) => setEmailHelpdesk(e.target.value)} 
                  />
                  <br />
                  <FormTimeInput 
                    label="Dagstart (tbv. rapportages)"
                    value={dagstart} 
                    onChange={(newDate: Date) => setDagstart(newDate)} 
                  />
              </div>
            )}
            {selectedTab === "tab-coordinaten" && (
              <div className="border px-4 py-2">
                <ParkingEditLocation parkingCoords={coordinaten !== undefined ? coordinaten : initialData.coordinaten} centerCoords={centerCoords} onPan={updateCoordinatesFromMap} initialZoom={8} />
              </div>
            )}
            {selectedTab === "tab-fietsenstallingen" && (
              <div className="border px-4 py-2">
                <ContactFietsenstallingen contact={thecontact} fietsenstallingtypen={props.fietsenstallingtypen} onEditStalling={props.onEditStalling} />
              </div>
            )}
            {selectedTab === "tab-gebruikers" && (
              <div className="border px-4 py-2">
                <ContactUsers contact={thecontact} users={props.users} onEditUser={props.onEditUser} onSendPassword={props.onSendPassword} />
              </div>
            )}
            {selectedTab === "tab-logos" && (
              <div className="border px-4 py-2 space-y-4">
                <SectionBlockEdit heading="Logo">
                { thecontact ? (
                  <ContactEditLogo contactdata={thecontact} isLogo2={false} />
                ) : (
                  <div>
                    <p>Geen contact geselecteerd</p>
                  </div>
                )}
                </SectionBlockEdit>

                <SectionBlockEdit heading="Logo 2 (optioneel)">
                { thecontact ? (
                  <ContactEditLogo contactdata={thecontact} isLogo2={true} />
                ) : (
                  <div>
                    <p>Geen contact geselecteerd</p>
                  </div>
                )}
                </SectionBlockEdit>
              </div>
            )}
        {/* <div className="mt-4">
          <button 
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 ${!isDataChanged() ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleUpdateParking}
            disabled={!isDataChanged()}
          >
            Opslaan
          </button>
          <button 
            className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2 ${!isDataChanged() ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleReset}
            disabled={!isDataChanged()}
          >
            Herstel
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => props.onClose()}
          >
            Back to Overview
          </button>
        </div> */}
      </div>
  );
};

export default ContactEdit;