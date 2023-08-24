import React from "react";

import { openRoute } from "~/utils/map/index";
import { useRouter } from "next/navigation";

// Import components
import PageTitle from "~/components/PageTitle";
import ImageSlider from "~/components/ImageSlider";
import HorizontalDivider from "~/components/HorizontalDivider";
import { Button } from "~/components/Button";
import ParkingOnTheMap from "~/components/ParkingOnTheMap";
import SectionBlock from "~/components/SectionBlock";
import ParkingViewOpening from "~/components/parking/ParkingViewOpening";
import ParkingViewTarief from "~/components/parking/ParkingViewTarief";
import ParkingViewCapaciteit from "~/components/parking/ParkingViewCapaciteit";
import ParkingViewAbonnementen from "~/components/parking/ParkingViewAbonnementen";
import ParkingViewBeheerder from "~/components/parking/ParkingViewBeheerder";
import ParkingViewServices from "~/components/parking/ParkingViewServices";

import { parkingType2Text } from "~/utils/parkings";

const ParkingView = ({
  parkingdata,
  onEdit = undefined,
}: {
  parkingdata: any;
  onEdit: Function | undefined;
}) => {
  const renderAddress = () => {
    const location = parkingdata.Location || "";
    const pcplaats = (
      (parkingdata.Postcode || "") +
      " " +
      (parkingdata.Plaats || "")
    ).trim();

    if (location === "" && pcplaats === "") {
      return null;
    }

    return (
      <>
        <section className="Type">
          <div className="w-full">
            {location}
            {location !== "" ? <br /> : null}
            {pcplaats}
            {pcplaats !== "" ? <br /> : null}
          </div>
          {/* <p>
            <b>0.3km</b
          </p> */}
        </section>
        <HorizontalDivider className="my-4" />
      </>
    );
  };

  const showOpening = [
    "bewaakt",
    "onbewaakt",
    "toezicht",
    "geautomatiseerd",
  ].includes(parkingdata.Type);
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
          {onEdit !== undefined ? (
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

          {renderAddress()}

          {showOpening ? (
            <ParkingViewOpening parkingdata={parkingdata} />
          ) : null}

          {showTarief ? <ParkingViewTarief parkingdata={parkingdata} /> : null}

          <ParkingViewServices parkingdata={parkingdata} />

          <ParkingViewCapaciteit parkingdata={parkingdata} />

          <ParkingViewAbonnementen parkingdata={parkingdata} />

          <SectionBlock heading="Soort stalling">
            {parkingType2Text(parkingdata.Type)}
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <ParkingViewBeheerder parkingdata={parkingdata} />

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
