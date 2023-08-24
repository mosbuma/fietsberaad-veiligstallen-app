import React from "react";

import { openRoute } from "~/utils/map/index";
import { useRouter } from "next/navigation";

// Import components
import PageTitle from "~/components/PageTitle";
import { Button } from "~/components/Button";
import ImageSlider from "~/components/ImageSlider";
import HorizontalDivider from "~/components/HorizontalDivider";
import { Button } from "~/components/Button";
import ParkingOnTheMap from "~/components/ParkingOnTheMap";
import SectionBlock from "~/components/SectionBlock";
import ParkingViewOpening from "~/components/ParkingViewOpening";
import ParkingViewTarief from "~/components/ParkingViewTarief";

const ParkingView = ({ parkingdata, onEdit = undefined }: { parkingdata: any, onEdit: Function | undefined }) => {

  const parkingType2Text = (type: string): string => {
    let result = "";
    switch(type) {
      case "fietstrommel": result = "Fietstrommel"; break;
      case "fietskluizen": result = "Fietskluizen"; break;
      case "buurtstalling": result = "Buurtstalling"; break;
      case "bewaakt": result = "Bewaakt stalling"; break;
      case "onbewaakt": result = "Onbewaakt"; break;
      case "toezicht": result = "Toezicht"; break;
      case "geautomatiseerd": result = "Geautomatiseerd"; break;
      default: result = `onbekend type ${type}`;
    }
    return result;
  }

  const renderAddress = () => {
    const location = parkingdata.Location||''
    const pcplaats = ((parkingdata.Postcode||'') + ' ' + (parkingdata.Plaats||'')).trim()

    if(location==='' && pcplaats==='') {
      return null;
    }

    return (
      <>
        <section className="Type">
          <div className="w-full">
            {location}
            {location!=='' ? <br /> : null }
            {pcplaats}
            {pcplaats!=='' ? <br /> : null }
          </div>
          {/* <p>
            <b>0.3km</b
          </p> */}
      </section>
      <HorizontalDivider className="my-4" />
    </>)
  }

  const showOpening = ["bewaakt", "onbewaakt", "toezicht", "geautomatiseerd"].includes(parkingdata.Type)
  const showTarief = false;

  return (
    <div
      className="
      ml-5 mr-5 mt-5
      sm:ml-10 sm:mr-10 sm:mt-10
    "
    >
      <div
        className="
          mr-8 flex
          justify-between
        "
      >
        <PageTitle className="flex w-full justify-center sm:justify-start">
          <div className="mr-4 hidden sm:block">{parkingdata?.Title}</div>
          {onEdit!==undefined ? (
            <Button
              key="b-1"
              className="mt-3 sm:mt-0 hidden sm:block"
              onClick={(e) => {
                if (e) e.preventDefault();
                onEdit();
              }}
            >
              Bewerken
            </Button>
          ) : null}
        </PageTitle>
      </div>

      <div className="flex justify-between">
        <div data-name="content-left" className="sm:mr-12">
          {parkingdata.Image && (
            <div className="mb-8">
              <ImageSlider images={[parkingdata.Image]} />
            </div>
          )}
  
          { renderAddress() }

          { showOpening ? <ParkingViewOpening parkingdata={parkingdata} />:null}

          { showTarief ? <ParkingViewTarief parkingdata={parkingdata} />:null }

          <SectionBlock heading="Services">
            <div className="flex-1">
              <div>
                <div>Buggy uitleen/verhuur</div>
                <div>Fietspomp</div>
                <div>Fietsverhuur</div>
                <div>Reparatie</div>
                <div>Toilet</div>
              </div>
            </div>
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Capaciteit">
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
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Abonnementen">
            <div className="ml-2 grid grid-cols-3">
              <div className="col-span-2">Jaarbonnement fiets</div>
              <div className="text-right sm:text-center">&euro;80,90</div>
              <div className="col-span-2">Jaarabonnement bromfiets</div>
              <div className="text-right sm:text-center">&euro;262.97</div>
              <div className="col-span-2"></div>
              <div className="text-right sm:text-center">
                <Button>
                  Koop abonnement
                </Button>
              </div>
            </div>
          </SectionBlock>

          {/*<button>Koop abonnement</button>*/}

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Soort stalling">
            { parkingType2Text(parkingdata.Type)}
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Beheerder">U-stal</SectionBlock>

          <p className="mb-10">{/*Some spacing*/}</p>

          {/*<button>Breng mij hier naartoe</button>*/}
        </div>

        <div data-name="content-right" className="ml-12 hidden sm:block">
          <div className="relative">
            <ParkingOnTheMap parking={parkingdata} />
          </div>
        </div>
      </div>

      <Button
        className="
          fixed bottom-3
          right-3 z-10
          flex
          py-3
          sm:absolute
          sm:bottom-1
        "
        onClick={(e) => {
          if (e) e.preventDefault();
          openRoute(parkingdata.Coordinaten);
        }}
        htmlBefore=<img
          src="/images/icon-route-white.png"
          alt="Route"
          className="mr-3 w-5"
        />
      >
        Breng mij hier naartoe
      </Button>
    </div>
  );
};

export default ParkingView;
