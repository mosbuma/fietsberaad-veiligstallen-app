import React, { useEffect, useState } from 'react';
import { contacts, } from '@prisma/client';
import TimeInput from './TimeInput';
import ParkingEditLocation from "~/components/parking/ParkingEditLocation";
import SectionBlockEdit from '~/components/SectionBlockEdit';
import { Tabs, Tab } from '@mui/material';
import { ReportBikepark } from '../beheer/reports/ReportsFilter';
import ContactFietsenstallingen from './ContactFietsenstallingen';

type ContactEditProps = {
    id: string;
    contacts: contacts[];
    onClose: () => void;
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
    
      const handleSave = async () => {
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

      const thecontact: contacts | undefined = props.contacts.find(c => c.ID === props.id);
      console.log("#### thecontact", thecontact);

    return (
        <div data-name="content-left" className="sm:mr-12" style={{ minHeight: '87vh' }}>
          <SectionBlockEdit>
            <div className="w-full mt-4">
              <h1 className="text-2xl font-bold mb-4">{props.id==="nieuw" ? "Nieuwe gemeente" : "Bewerk gemeente"}</h1>
              <Tabs value={selectedTab} onChange={handleChange} aria-label="simple tabs example">
                <Tab label="Algemeen" value="tab-algemeen" />
                <Tab label="Coordinaten" value="tab-coordinaten" />
                <Tab label="Fietsenstallingen" value="tab-fietsenstallingen" />
              </Tabs>
              {selectedTab === "tab-algemeen" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="border px-4 py-2">Naam:</div>
                  <div className="border px-4 py-2">
                    <input 
                      type="text" 
                      value={organisatie} 
                      onChange={(e) => setOrganisatie(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="border px-4 py-2">Alternatieve naam:</div>
                  <div className="border px-4 py-2">
                    <input 
                      type="text" 
                      value={alternatieveNaam} 
                      onChange={(e) => setAlternatieveNaam(e.target.value)} 
                    />
                  </div>
                  <div className="border px-4 py-2">URL vriendelijke naam:</div>
                  <div className="border px-4 py-2">
                    <input 
                      type="text" 
                      value={urlVriendelijkeNaam} 
                      onChange={(e) => setUrlVriendelijkeNaam(e.target.value)} 
                    />
                  </div>
                  <div className="border px-4 py-2">Postcode ID:</div>
                  <div className="border px-4 py-2">
                    <input 
                      type="text" 
                      value={postcodeID} 
                      onChange={(e) => setPostcodeID(e.target.value)} 
                    />
                  </div>
                  <div className="border px-4 py-2">Email helpdesk:</div>
                  <div className="border px-4 py-2">
                    <input 
                      type="text" 
                      value={emailHelpdesk} 
                      onChange={(e) => setEmailHelpdesk(e.target.value)} 
                    />
                  </div>
                  <div className="border px-4 py-2">Dagstart:</div>
                  <div className="border px-4 py-2">
                    <TimeInput 
                      value={dagstart} 
                      onChange={(newDate: Date) => setDagstart(newDate)} 
                    />
                  </div>
                </div>
              )}
              {selectedTab === "tab-coordinaten" && (
                <div className="border px-4 py-2">
                  <ParkingEditLocation parkingCoords={coordinaten !== undefined ? coordinaten : initialData.coordinaten} centerCoords={centerCoords} onPan={updateCoordinatesFromMap} initialZoom={8} />
                </div>
              )}
              {selectedTab === "tab-fietsenstallingen" && (
                <div className="border px-4 py-2">
                  <ContactFietsenstallingen contact={thecontact} />
                </div>
              )}
            </div>
          </SectionBlockEdit>
          
          <div className="mt-4">
            <button 
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 ${!isDataChanged() ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSave}
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
          </div>
        </div>
    );
};

export default ContactEdit;