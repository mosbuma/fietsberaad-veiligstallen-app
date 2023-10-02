import React, { ReactEventHandler } from "react";

import { openRoute } from "~/utils/map/index";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Import components
import PageTitle from "~/components/PageTitle";
import ImageSlider from "~/components/ImageSlider";
import HorizontalDivider from "~/components/HorizontalDivider";
import { Button, IconButton } from "~/components/Button";
import ParkingEditLocation from "~/components/parking/ParkingEditLocation";
import FormInput from "~/components/Form/FormInput";
import FormCheckbox from "~/components/Form/FormCheckbox";
import SectionBlock from "~/components/SectionBlock";
import SectionBlockEdit from "~/components/SectionBlockEdit";
import type { ParkingDetailsType, DayPrefix } from "~/types/";
import {
  formatOpeningTimes,
  getAllServices
} from "~/utils/parkings";
import { Tabs, Tab, FormHelperText, FormLabel, Typography } from "@mui/material";

/* Use nicely formatted items for items that can not be changed yet */
import ParkingViewOpening from "~/components/parking/ParkingViewOpening";
import ParkingViewTarief from "~/components/parking/ParkingViewTarief";
import ParkingViewCapaciteit from "~/components/parking/ParkingViewCapaciteit";
import ParkingViewAbonnementen from "~/components/parking/ParkingViewAbonnementen";

const ParkingEdit = ({ parkingdata, onClose }: { parkingdata: ParkingDetailsType, onClose: Function }) => {
  const router = useRouter();
  const session = useSession();

  const [selectedTab, setSelectedTab] = React.useState('tab-algemeen');  

  const [newTitle, setNewTitle ] = React.useState(undefined);
  const [newLocation, setNewLocation ] = React.useState(undefined);
  const [newPostcode, setNewPostcode ] = React.useState(undefined);
  const [newPlaats, setNewPlaats ] = React.useState(undefined);
  const [newCoordinaten, setNewCoordinaten ] = React.useState<string|undefined>(undefined);

  // used for map recentre when coordinates are manually changed
  const [centerCoords, setCenterCoords ] = React.useState<string|undefined>(undefined); 

  type ServiceType = { ID: string, Name: string};
  type ChangedType = { ID: string, selected: boolean};

  const [allServices, setAllServices ] = React.useState<ServiceType[]>([]); 
  const [newServices, setNewServices ] = React.useState<ChangedType[]>([]);

  type StallingType = { id: string, name: string, sequence: number};
  const [allTypes, setAllTypes ] = React.useState<StallingType[]>([]); 
  const [newStallingType, setNewStallingType ] = React.useState<string|undefined>(undefined);

  // Set 'allServices' variable in local state
  React.useEffect(() => {
    (async () => {
      const result = await getAllServices();
      setAllServices(result);
		})();
  },[])

  React.useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
        	`/api/fietsenstallingtypen/`
      	);
        const json = await response.json();
        if(! json) return;

        setAllTypes(json);
      } catch(err) {
        console.error("get all types error", err);
      }
		})();
  },[]) 

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue);
  }
  
  const getUpdate = (): any => {
    let update: any = {};

    if(newTitle !== undefined) { update.Title = newTitle; }
    if(newLocation !== undefined) { update.Location = newLocation; }
    if(newPostcode !== undefined) { update.Postcode = newPostcode; }
    if(newPlaats !== undefined) { update.Plaats = newPlaats; }
    if(newCoordinaten !== undefined) { update.Coordinaten = newCoordinaten; }
    if(newStallingType !== undefined) { update.Type = newStallingType; }

    // // if newServices is not empty, then update the services
    // TODO: make this work
    if(newServices.length > 0) {
      // Set empty array
      // update.fietsenstallingen_services = null;
      // console.log('newServices', newServices)
      // const servicesToSave: {}[] = [];
      // newServices.forEach(s => {
      //   // Don't add if service is not selected
      //   if(! s.selected) return;

      //   servicesToSave.push({
      //     ServiceID: s.ID,
      //     FietsenstallingID: parkingdata.ID,
      //   });
      // });

      // update.fietsenstallingen_services = { 
      //   deleteMany: {
      //     where: {
      //       FietsenstallingID: parkingdata.ID
      //     }
      //   },
      //   create: servicesToSave,
      //  }

      // update.fietsenstallingen_services = { 
      //   createMany: {
      //     data: servicesToSave
      //   }
      // }
    }

    console.log("#### update", update);
    return update;
  }

  const updateParking = async () => {
    // Stop if no parking ID is available
    if(! parkingdata || ! parkingdata.ID) return;

    // Check if parking was changed
    const update = getUpdate();
    const parkingChanged = Object.keys(update).length !== 0 || newServices.length > 0;

    // If services are updated: Update services
    if(newServices.length > 0) {
      try {
        // Create servicesToSave object
        const servicesToSave: {}[] = [];
        newServices.forEach(s => {
          // Don't add if service is not selected
          if(! s.selected) return;

          servicesToSave.push({
            ServiceID: s.ID,
            FietsenstallingID: parkingdata.ID,
          });
        });
        // Delete existing services for this parking
        await fetch(
          "/api/fietsenstallingen_services?id=" + parkingdata.ID,
          {
            method: "delete",
          }
        );
        await prisma.fietsenstallingen_services.deleteMany({
          where: {
            FietsenstallingID: parkingdata.ID
          }
        });
        await prisma.fietsenstallingen_services.create(servicesToSave);
      } catch(err) {
        console.error(err);
      }
    }

    // If parking data didn't change: stop
    if(!parkingChanged) {
      return;
    }

    try {
      const result = await fetch(
        "/api/fietsenstallingen?id=" + parkingdata.ID,
        {
          method: "PUT",
          body: JSON.stringify(update),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if(! result.ok) {
        throw Error('Er ging iets fout bij het opslaan. Controleer of de gegevens kloppen. Is de postcode bijvoorbeeld juist, en niet te lang?')
      }
      // Reload data
      const randomstr = Math.floor(Math.random() * 1000000)
      router.push("?stallingid=" + parkingdata.ID + `&editmode&revision=${randomstr}` ); // refreshes the page to show the edits
      // Go back to 'view' mode
      onClose();
    } catch(err) {
      if(err.message) alert(err.message);
      else alert(err);
    }
  };

  const update = getUpdate()
  const parkingChanged = Object.keys(update).length !== 0 || newServices.length > 0;

  console.log("@@@ parkingdata", parkingdata);

  const updateCoordinatesFromMap = (lat: number, lng: number) => {
    // console.log("#### update from map")
    const latlngstring = `${lat},${lng}`;
    if(latlngstring !== parkingdata.Coordinaten) {
      setNewCoordinaten(latlngstring);
    } else {
      setNewCoordinaten(undefined);
    }
    setCenterCoords(undefined);
  }

  const updateCoordinatesFromForm = (isLat: boolean) => (e: { target: { value: string; }; }) => {
    // console.log("#### update from form")
    try {
      const latlng = parkingdata.Coordinaten.split(",");
      if(isLat) {
        latlng[0] = e.target.value;
      } else {
        latlng[1] = e.target.value;
      }
      setNewCoordinaten(latlng.join(","));
      setCenterCoords(latlng.join(","));
    } catch(ex) {
      console.warn('ParkingEditLocation - unable to set coordinates from form: ', ex.message());
    }
}

  const getCoordinate = (isLat: boolean): string => {
    let coords = parkingdata.Coordinaten;
    if(newCoordinaten !== undefined) {
      coords = newCoordinaten;

    } 
    if(coords === "") return "";

    const latlng = coords.split(",");
    if(isLat) {
      return latlng[0]?.toString()||'';
    } else {
      return latlng[1]?.toString()||'';
    }
  }

  const renderTabAlgemeen = () => {
    const serviceIsActive = (ID: string): boolean => {
      const change = newServices.find(s=>(s.ID===ID));
      if(change!==undefined) {
        // console.log(ID, "changed to ", change.selected);
        return change.selected;
      }

      for(const item of parkingdata.fietsenstallingen_services) {
        if(item.services.ID===ID) { 
          // console.log("selected in parkingdata", ID, change);
          return true;
        }
      }

      return false;
    }

    const handleSelectService = (ID: string, checked: boolean) => {
      const index = newServices.findIndex(s=>s.ID===ID);
      if(index !== -1) {
        newServices.splice(index, 1);        
      } else {
        newServices.push({ID: ID, selected: checked});
      }

      // console.log('newservices - after', JSON.stringify(newServices,0,2));

      setNewServices([...newServices]);
    }

    return (
      <div className="flex justify-between">
        <div data-name="content-left" className="sm:mr-12">
          <SectionBlockEdit className="flex justify-between text-sm sm:text-base">
            <div className="w-full mt-4">
              <FormInput
                key='i-title'
                label="Titel"
                className="border-2 border-black mb-1 w-full"
                placeholder="titel"
                onChange={e=>{ setNewTitle(e.target.value)}} value={newTitle!==undefined?newTitle:parkingdata.Title} />
              <br />
              <FormInput
                key='i-location'
                label="Straat en huisnummer"
                className="border-2 border-black mb-1 w-full"
                placeholder="adres"
                onChange={e=>{ setNewLocation(e.target.value)}} value={newLocation!==undefined?newLocation:parkingdata.Location} />
              <br />
                <>
                  <FormInput key='i-postcode' label="Postcode" className="border-2 border-black mb-1 w-full" placeholder="postcode" onChange={e=>{ setNewPostcode(e.target.value)}} value={newPostcode!==undefined?newPostcode:parkingdata.Postcode} />
                  <FormInput key='i-plaats' label="Plaats" className="border-2 border-black mb-1 w-full" placeholder="plaats" onChange={e=>{ setNewPlaats(e.target.value)}} value={newPlaats!==undefined?newPlaats:parkingdata.Plaats} />
                </>
              <br />
            </div>
          </SectionBlockEdit>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Services">
            <div className="flex-1">
              <div>
                {allServices && allServices.map(service => (
                  <div key={service.ID}>
                    <label className="cursor-pointer hover:bg-gray-100 py-1 block">
                      <input
                        type="checkbox"
                        className="inline-block mr-2"
                        checked={serviceIsActive(service.ID)}
                        onChange={e => handleSelectService(service.ID, e.target.checked)}
                      />
                      {service.Name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Soort stalling">
            <select value={newStallingType!==undefined?newStallingType:parkingdata.Type} onChange={(event)=>{setNewStallingType(event.target.value)}}>
              {allTypes.map(type => (
                <option key={type.id} value={type.id}>
                    {type.name}
                </option>
              ))}
            </select>
          </SectionBlock>

          <p className="mb-10">{/*Some spacing*/}</p>

          {/*<button>Breng mij hier naartoe</button>*/}
        </div>

        <div data-name="content-right" className="ml-12 hidden sm:block">
          <div className="relative">
            <ParkingEditLocation parkingCoords={parkingdata.Coordinaten} centerCoords={centerCoords} onPan={updateCoordinatesFromMap}/>
          </div>
          <FormHelperText className="w-full pb-2">
            <Typography className="py-2 text-center" variant="h6">Verschuif de kaart om de coordinaten aan te passen</Typography>
          </FormHelperText>
          <FormInput
                key='i-lat'
                label="Latitude"
                type="number"
                className="border-2 border-black pt-2 w-full"
                placeholder="latitude"
                onChange={updateCoordinatesFromForm(true)}
                value={getCoordinate(true)} />
          <FormInput
                key='i-lng'
                label="Longitude"
                type="number"
                className="border-2 border-black pt-2 w-full"
                placeholder="longitude"
                onChange={updateCoordinatesFromForm(false)}
                value={getCoordinate(false)} />

        </div>
      </div>
    );
  }

  const renderTabAfbeelding = () => {
    return (
      <div className="flex justify-between">
        <div data-name="content-left" className="sm:mr-12">
          {parkingdata.Image && (
            <div className="mb-8">
              <ImageSlider images={[parkingdata.Image]} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderTabOpeningstijden = () => {
    return ( 
      <div className="flex justify-between w-full mt-10">
        <ParkingViewOpening parkingdata={parkingdata} />
      </div>);
    return (
      <div className="flex justify-between w-full mt-10">
      <SectionBlockEdit>
        {formatOpeningTimes(parkingdata, 2, "ma", "Maandag")}
        {formatOpeningTimes(parkingdata, 3, "di", "Dinsdag")}
        {formatOpeningTimes(parkingdata, 4, "wo", "Woensdag")}
        {formatOpeningTimes(parkingdata, 5, "do", "Donderdag")}
        {formatOpeningTimes(parkingdata, 6, "vr", "Vrijdag")}
        {formatOpeningTimes(parkingdata, 0, "za", "Zaterdag")}
        {formatOpeningTimes(parkingdata, 1, "zo", "Zondag")}
        {parkingdata.Openingstijden !== "" && (
          <div className="col-span-2">
            <div>
              <br />
              {parkingdata.Openingstijden}
            </div>
          </div>
        )}
      </SectionBlockEdit>
      </div>
    );
  }

  const renderTabTarieven = () => {
    return ( 
      <div className="flex justify-between w-full mt-10">
        <ParkingViewTarief parkingdata={parkingdata} />
      </div>);

    return (
      <div className="flex justify-between w-full mt-10">
          <SectionBlockEdit>
            <div className="font-bold">Fietsen</div>
            <div className="ml-2 grid w-full grid-cols-2">
              <div>Eerste 24 uur:</div>
              <div className="text-right sm:text-center">gratis</div>
              <div>Daarna per 24 uur:</div>
              <div className="text-right sm:text-center">&euro;0,60</div>
            </div>
            <div className="mt-4 font-bold">Bromfietsen</div>
            <div className="ml-2 grid w-full grid-cols-2">
              <div>Eerste 24 uur:</div>
              <div className="text-right sm:text-center">&euro;0,60</div>
            </div>
          </SectionBlockEdit>
      </div>
    );
  }
    
  const renderTabCapaciteit = () => {
    return ( 
      <div className="flex justify-between w-full mt-10">
        <ParkingViewCapaciteit parkingdata={parkingdata} />
      </div>);
    return (
      <div className="flex justify-between w-full mt-10">
          <SectionBlockEdit heading="Capaciteit">
            <div className="ml-2 grid grid-cols-3">
              <div className="col-span-2">Bromfietsen</div>
              <div className="text-right sm:text-center">32</div>
              <div className="col-span-2">Afwijkende maten</div>
              <div className="text-right sm:text-center">7</div>
              <div className="col-span-2">Elektrische fietsen</div>
              <div className="text-right sm:text-center">19</div>
              <div className="col-span-2">Bakfietsen</div>
              <div className="text-right sm:text-center">12</div>
            </div>
          </SectionBlockEdit>
      </div>
    );
  }

  const renderTabAbonnementen = () => {
    return ( 
      <div className="flex justify-between w-full mt-10">
        <ParkingViewAbonnementen parkingdata={parkingdata} />
      </div>);
    return (
      <div className="flex justify-between w-full mt-10">
          <SectionBlockEdit heading="Abonnementen">
            <div className="ml-2 grid grid-cols-3">
              <div className="col-span-2">Jaarbonnement fiets</div>
              <div className="text-right sm:text-center">&euro;80,90</div>
              <div className="col-span-2">Jaarabonnement bromfiets</div>
              <div className="text-right sm:text-center">&euro;262.97</div>
            </div>
          </SectionBlockEdit>

          {/*<button>Koop abonnement</button>*/}
      </div>
    );
  }

  const renderTabBeheerder = () => {
    let content;

    //console.log("#### got parkingdata", JSON.stringify(parkingdata, null, 2));

  // console.log("### ParkingViewBeheerder", parkingdata, parkingdata.Exploitant, parkingdata.Beheerder, parkingdata.BeheerderContact);
  if (parkingdata.FMS === true) {
    content = <SectionBlock heading="Beheerder">FMS</SectionBlock>;
  }  else if(parkingdata?.exploitant) {
    content = (
      <SectionBlock heading="Beheerder">
      <a href={'mailto:'+parkingdata.exploitant.Helpdesk}>{parkingdata.exploitant.CompanyName}</a>
      </SectionBlock>
    )
  } else if(parkingdata.BeheerderContact !== null) {
    content = (
      <SectionBlock heading="Beheerder">
        <a href={parkingdata.BeheerderContact}>{parkingdata.Beheerder === null ? 'contact' : parkingdata.Beheerder}</a>
      </SectionBlock>
      );
  } else {
    content = null
  }

    return (
      <div className="flex justify-between w-full mt-10">
        {content}
      </div>
    );
  }

  return (
    <div
      className="" style={{minHeight: '60vh'}}
    >
      <div
        className="
          sm:mr-8 flex
          justify-between
        "
      >
        <PageTitle className="flex w-full justify-center sm:justify-start">
          <div className="mr-4 hidden sm:block">{parkingdata.Title}</div>
          <Button
            key="b-1"
            className="mt-3 sm:mt-0"
            onClick={(e) => {
              if (e) e.preventDefault();
              if(parkingChanged === true) {
                updateParking();
              }
              else {
                onClose();
              }
            }}
          >
            { parkingChanged === true ? 'Opslaan': 'Terug' }
          </Button>
          {parkingChanged === true && <Button
            key="b-2"
            className="mt-3 ml-2 sm:mt-0"
            variant="secundary"
            onClick={(e) => {
              if (e) e.preventDefault();
              if(confirm('Wil je het bewerkformulier verlaten?')) {
                onClose();
              }
            }}
          >
            Annuleer
          </Button>}
        </PageTitle>
      </div>

      <Tabs value={selectedTab} onChange={handleChange} aria-label="simple tabs example">
        <Tab label="Algemeen" value='tab-algemeen'/>
        <Tab label="Afbeelding" value='tab-afbeelding'/>
        <Tab label="Openingstijden" value='tab-openingstijden'/>
        {/* <Tab label="Tarieven" value='tab-tarieven'/> */}
        <Tab label="Capaciteit" value='tab-capaciteit'/>
        <Tab label="Abonnementen" value='tab-abonnementen'/>
        <Tab label="Beheerder" value='tab-beheerder'/>
      </Tabs>

      { selectedTab === 'tab-algemeen' ? renderTabAlgemeen() : null }
      { selectedTab === 'tab-afbeelding' ? renderTabAfbeelding() : null }
      { selectedTab === 'tab-openingstijden' ? renderTabOpeningstijden() : null }
      { selectedTab === 'tab-tarieven' ? renderTabTarieven() : null }
      { selectedTab === 'tab-capaciteit' ? renderTabCapaciteit() : null }
      { selectedTab === 'tab-abonnementen' ? renderTabAbonnementen() : null }
      { selectedTab === 'tab-beheerder' ? renderTabBeheerder() : null }
    </div>
  );
};

export default ParkingEdit;
