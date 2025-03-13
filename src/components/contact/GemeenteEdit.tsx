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

import type { VSContactGemeente } from '~/types/contacts';
import type { VSUserWithRoles } from '~/types/users';

import ContactUsers from './ContactUsers';
import FormSelect from '../Form/FormSelect';
import moment from 'moment';

type GemeenteEditProps = {
    id: string;
    gemeenten: VSContactGemeente[];
    users: VSUserWithRoles[];
    fietsenstallingtypen: fietsenstallingtypen[]; 
    onClose: () => void;
    onEditStalling: (stallingID: string | undefined) => void;
    onEditUser: (userID: string | undefined) => void;
    onSendPassword: (userID: string | undefined) => void;
    hidden: boolean;
}

export const DEFAULTGEMEENTE: VSContactGemeente = {
  ID: 'nieuw',
  CompanyName: "Nieuwe gemeente",
  ItemType: "organization",
  AlternativeCompanyName: "",
  UrlName: "",
  ZipID: "",
  Helpdesk: "",
  DayBeginsAt: moment().utc().startOf('day').toDate(),
  Coordinaten: "52.09295124616021, 5.108314829064904",
  Zoom: 12,
  Bankrekeningnr: "",
  PlaatsBank: "",
  Tnv: "",
  Notes: "",
  DateRegistration: moment().toDate(),
  CompanyLogo: "",
  CompanyLogo2: "",
  ThemeColor1: "#1f99d2",
  ThemeColor2: "#96c11f",
  modules_contacts: [],
};

const GemeenteEdit = (props: GemeenteEditProps) => {
    const [selectedTab, setSelectedTab] = useState<string>("tab-algemeen");
    const [centerCoords, setCenterCoords] = React.useState<string | undefined>(undefined);

    type CurrentState = {
      organisatie: string|null,
      alternatieveNaam: string|null,
      urlVriendelijkeNaam: string|null,
      zipID: string|null,
      emailHelpdesk: string|null,
      dagstart: Date|null,
      coordinaten: string|null,
      initialzoom: number,
      bankRekeningnummer: string|null,
      bankPlaats: string|null,
      bankTnv: string|null,
      notitie: string|null,
      registratiedatum: Date|null,
    }
  
    const isNew = props.id === "nieuw";

    const [organisatie, setOrganisatie] = useState<string|null>(null);
    const [alternatieveNaam, setAlternatieveNaam] = useState<string|null>(null);
    const [urlVriendelijkeNaam, setUrlVriendelijkeNaam] = useState<string|null>(null);
    const [zipID, setZipID] = useState<string|null>(null);
    const [emailHelpdesk, setEmailHelpdesk] = useState<string|null>(null);
    const [dagstart, setDagstart] = useState<Date|null>(null);
    const [coordinaten, setCoordinaten] = useState<string|null>(null);
    const [initialzoom, setInitialzoom] = useState<number>(13);
    const [bankRekeningnummer, setBankRekeningnummer] = useState<string|null>(null);
    const [bankPlaats, setBankPlaats] = useState<string|null>(null);
    const [bankTnv, setBankTnv] = useState<string|null>(null);
    const [notitie, setNotitie] = useState<string|null>(null);
    const [registratiedatum, setRegistratiedatum] = useState<Date|null>(null);
    const [contactID, setContactID] = useState<string|null>(null);
  
    const cDefaultCoordinaten = [52.1326, 5.2913].join(","); // center of NL by default 
  
    const [initialData, setInitialData] = useState<CurrentState>({
      organisatie: '',
      alternatieveNaam: null,
      urlVriendelijkeNaam: null,
      zipID: null,
      emailHelpdesk: null,
      dagstart: null,
      coordinaten: cDefaultCoordinaten,
      initialzoom: 13,
      bankRekeningnummer: null,
      bankPlaats: null,
      bankTnv: null,
      notitie: null,
      registratiedatum: null,
    });
  
    useEffect(() => {
        if (isNew) {
            // Use default values for new record
            const initial = {
                organisatie: DEFAULTGEMEENTE.CompanyName,
                alternatieveNaam: DEFAULTGEMEENTE.AlternativeCompanyName,
                urlVriendelijkeNaam: DEFAULTGEMEENTE.UrlName,
                zipID: DEFAULTGEMEENTE.ZipID,
                emailHelpdesk: DEFAULTGEMEENTE.Helpdesk,
                dagstart: DEFAULTGEMEENTE.DayBeginsAt,
                coordinaten: DEFAULTGEMEENTE.Coordinaten,
                initialzoom: DEFAULTGEMEENTE.Zoom,
                bankRekeningnummer: DEFAULTGEMEENTE.Bankrekeningnr,
                bankPlaats: DEFAULTGEMEENTE.PlaatsBank,
                bankTnv: DEFAULTGEMEENTE.Tnv,
                notitie: DEFAULTGEMEENTE.Notes,
                registratiedatum: DEFAULTGEMEENTE.DateRegistration,
            };

            setOrganisatie(initial.organisatie);
            setAlternatieveNaam(initial.alternatieveNaam);
            setUrlVriendelijkeNaam(initial.urlVriendelijkeNaam);
            setZipID(initial.zipID);
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
        } else {
            if (!isNew) {
                const thecontact = props.gemeenten.find(c => c.ID === props.id);
                if (thecontact) {
                    const initial = {
                        organisatie: thecontact.CompanyName || initialData.organisatie,
                        alternatieveNaam: thecontact.AlternativeCompanyName || initialData.alternatieveNaam,
                        urlVriendelijkeNaam: thecontact.UrlName || initialData.urlVriendelijkeNaam,
                        zipID: thecontact.ZipID || initialData.zipID,
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
                    setZipID(initial.zipID);
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
        }
    }, [props.id, props.gemeenten, isNew]);

    const isDataChanged = () => {
        if (isNew) {
          return organisatie || zipID || dagstart || coordinaten || initialzoom;
        }
        return (
            organisatie !== initialData.organisatie ||
            alternatieveNaam !== initialData.alternatieveNaam ||
            urlVriendelijkeNaam !== initialData.urlVriendelijkeNaam ||
            zipID !== initialData.zipID ||
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
        if (!organisatie || !zipID || !dagstart || !coordinaten) {
          alert("Organisatie, Postcode ID, Dagstart en Coordinaten mogen niet leeg zijn.");
          return;
        }
    
        try {
          const method = isNew ? 'POST' : 'PUT';
          const url = isNew ? '/api/protected/gemeenten' : `/api/protected/gemeenten/${props.id}`;
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              organisatie: organisatie || '',
              alternatieveNaam: alternatieveNaam || '',
              urlVriendelijkeNaam: urlVriendelijkeNaam || '',
              zipID: zipID || '',
              emailHelpdesk: emailHelpdesk || '',
              dagstart,
              coordinaten: coordinaten || '',
              initialzoom,
              bankRekeningnummer: bankRekeningnummer || '',
              bankPlaats: bankPlaats || '',
              bankTnv: bankTnv || '',
              notitie: notitie || '',
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
        if (isNew) {
          setOrganisatie(null);
          setAlternatieveNaam(null);
          setUrlVriendelijkeNaam(null);
          setZipID(null);
          setEmailHelpdesk(null);
          setDagstart(null);
          setCoordinaten(null);
          setInitialzoom(13);
          setBankRekeningnummer(null);
          setBankPlaats(null);
          setBankTnv(null);
          setNotitie(null);
          setRegistratiedatum(null);
        } else {
          setOrganisatie(initialData.organisatie);
          setAlternatieveNaam(initialData.alternatieveNaam);
          setUrlVriendelijkeNaam(initialData.urlVriendelijkeNaam);
          setZipID(initialData.zipID);
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
          setCoordinaten(null);
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
            console.warn('GemeenteEdit - unable to set coordinates from form: ', ex.message());
          } else {
            console.warn('GemeenteEdit - unable to set coordinates from form');
          }
        }
      }
    
      const getCoordinate = (isLat: boolean): string => {
        let coords = initialData.coordinaten;
        if (coordinaten !== null) {
          coords = coordinaten;
        }
        if (coords === null || coords === "") return "";
    
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

      const renderTopBar = (currentContact: VSContactGemeente | undefined) => {
        const contact = isNew ? DEFAULTGEMEENTE : currentContact;
        const parkingTitle: string = isNew ? "Nieuwe gemeente" : ("Gemeente " + contact?.CompanyName);
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
    
                    props.onClose();
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

      const thecontact: VSContactGemeente | undefined = props.gemeenten.find(c => c.ID === props.id);
      // console.log("#### thecontact", thecontact);
      // console.log("#### thecontact", thecontact?.DayBeginsAt, dagstart);

      // Find the current user
      const contactPerson = props.users.find(user => user.security_users_sites.some(site => site.SiteID === props.id && site.IsContact === true));
      const userlist: { label: string, value: string | undefined }[] = [
        { label: "Geen", value: undefined },
        ...props.users.map(user => ({ label: (user.DisplayName || "") + " (" + (user.UserName || "") + ")", value: user.UserID || "" }))
      ];
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
                    value={organisatie || ''} 
                    onChange={(e) => setOrganisatie(e.target.value || null)} 
                    required 
                  />
                  <br />
                  { props.users.length > 0 ?
                      <FormSelect 
                        label="Contactpersoon"
                        value={contactPerson?.UserID || null} 
                        onChange={(e) => setContactID(e.target.value || null)} 
                        required
                        options={userlist}
                      /> 
                      : 
                      <FormInput label="Contactpersoon" value="Voor deze gemeente zijn geen gebruikers geregistreerd" disabled />}
                  <br />
                  <FormInput 
                    label="Alternatieve naam"
                    value={alternatieveNaam || ''} 
                    onChange={(e) => setAlternatieveNaam(e.target.value || null)} 
                  />
                  <br />
                  <FormInput 
                    label="URL vriendelijke naam"
                    value={urlVriendelijkeNaam || ''} 
                    onChange={(e) => setUrlVriendelijkeNaam(e.target.value || null)} 
                  />
                  <br />
                  <FormInput 
                    label="Postcode ID"
                    value={zipID || ''} 
                    onChange={(e) => setZipID(e.target.value || null)} 
                    required
                  />
                  <br />
                  <FormInput 
                    label="Email helpdesk"
                    value={emailHelpdesk || ''} 
                    onChange={(e) => setEmailHelpdesk(e.target.value || null)} 
                  />
                  <br />
                  <FormTimeInput 
                    label="Dagstart (tbv. rapportages)"
                    value={dagstart} 
                    onChange={(newDate: Date|null) => setDagstart(newDate)} 
                  />
              </div>
            )}
            {selectedTab === "tab-coordinaten" && (
              <div className="border px-4 py-2">
                <ParkingEditLocation parkingCoords={coordinaten !== null ? coordinaten : initialData.coordinaten} centerCoords={centerCoords} onPan={updateCoordinatesFromMap} initialZoom={8} />
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
                { isNew ? (
                    <ContactEditLogo contactdata={DEFAULTGEMEENTE} isLogo2={false} />
                ) : thecontact ? (
                    <ContactEditLogo contactdata={thecontact} isLogo2={false} />
                ) : (
                    <div>
                        <p>Geen contact geselecteerd</p>
                    </div>
                )}
                </SectionBlockEdit>

                <SectionBlockEdit heading="Logo 2 (optioneel)">
                { isNew ? (
                    <ContactEditLogo contactdata={DEFAULTGEMEENTE} isLogo2={true} />
                ) : thecontact ? (
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

export default GemeenteEdit;