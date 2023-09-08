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
import SectionBlock from "~/components/SectionBlock";
import SectionBlockEdit from "~/components/SectionBlockEdit";
import type { ParkingDetailsType, DayPrefix } from "~/types/";
import { formatOpeningTimes } from "~/utils/parkings";
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

  const [services, setServices ] = React.useState<string[]|undefined>(undefined); 

  React.useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
        	`/api/services/`
      	);
        const json = await response.json();
        if(! json) return;

        setServices(json);
      } catch(err) {
        console.error(err);
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

    return update;
  }

  const updateParking = async () => {
    const update = getUpdate();

    const response = await fetch(
      "/api/fietsenstallingen?id=" + parkingdata.ID,
      {
        method: "PUT",
        body: JSON.stringify(update),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    router.push("?stallingid=" + parkingdata.ID); // refreshes the page to show the edits
  };

  const update = getUpdate()
  const parkingChanged = Object.keys(update).length !== 0;

  // console.log("@@@ parkingdata", parkingdata);

  const updateCoordinatesFromMap = (lat: number, lng: number) => {
    console.log("#### update from map")
    const latlngstring = `${lat},${lng}`;
    if(latlngstring !== parkingdata.Coordinaten) {
      setNewCoordinaten(latlngstring);
    } else {
      setNewCoordinaten(undefined);
    }
    setCenterCoords(undefined);
  }

  const updateCoordinatesFromForm = (isLat: boolean) => (e: { target: { value: string; }; }) => {
    console.log("#### update from form")
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
    let services = [];
    for(const item of parkingdata.fietsenstallingen_services) {
      services.push(<div>{item.services.Name}</div>);
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
              { services }
              </div>
            </div>
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Soort stalling">
            Bewaakte stalling
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
          {session.status === "authenticated" && parkingChanged === true ? (
            <Button
              key="b-1"
              className="mt-3 sm:mt-0"
              onClick={(e) => {
                if (e) e.preventDefault();
                updateParking();
                onClose();
              }}
            >
              Opslaan
            </Button>
          ) : null}
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
