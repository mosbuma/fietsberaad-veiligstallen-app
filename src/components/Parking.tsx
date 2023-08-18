import React from "react";

import { openRoute } from "~/utils/map/index";

// Import components
import PageTitle from "~/components/PageTitle";
import ImageSlider from "~/components/ImageSlider";
import HorizontalDivider from "~/components/HorizontalDivider";
import { Button, IconButton } from "~/components/Button";
import ParkingOnTheMap from "~/components/ParkingOnTheMap";

// 

const SectionBlock = ({
  heading,
  children,
  contentClasses
}: {
  heading: string,
  children: any
  contentClasses?: string
}) => {
  return (
    <div className="flex justify-between flex-wrap xl:flex-nowrap">
      <div
        className="
          w-full
          xl:w-48
          font-bold
        "
      >
        {heading}
      </div>
      <div className={`
        mt-4
        xl:mt-0
        ml-4
        xl:ml-0

        xl:flex-1

        text-sm
        xl:text-base

        w-full
        xl:w-auto
        ${contentClasses ? contentClasses : ''}
      `}>
        {children}
      </div>
    </div>
  );
}

const Parking = ({ parkingdata }: { parkingdata: any }) => {
  const formatOpening = (
    dayidx: number,
    day: string,
    label: string
  ): React.ReactNode => {
    const wkday = new Date().getDay();

    const tmpopen: Date = new Date(parkingdata["Open_" + day]);
    const hoursopen = tmpopen.getHours();
    const minutesopen = String(tmpopen.getMinutes()).padStart(2, "0");

    const tmpclose: Date = new Date(parkingdata["Dicht_" + day]);
    const hoursclose = tmpclose.getHours();
    const minutesclose = String(tmpclose.getMinutes()).padStart(2, "0");

    if (tmpclose <= tmpopen) {
      return <></>;
    }

    const value = `${hoursopen}:${minutesopen} - ${hoursclose}:${minutesclose}`;

    return (
      <>
        <div className={wkday + 1 === dayidx ? "font-bold" : ""}>{label}</div>
        <div className="text-right">{value}</div>
      </>
    );
  };

  // console.log("@@ stallingdata has %s items", parkingdata.length);

  return (
    <div className="
      ml-5 mr-5 mt-5
      sm:ml-10 sm:mr-10 sm:mt-10
    ">
      <div
        className="
          mr-8 flex
          justify-between
        "
      >
        <PageTitle className="w-full flex justify-center">
          <div className="hidden sm:block mr-4">{parkingdata.Title}</div>
          <Button className="mt-3 sm:mt-0">bewerken</Button>
        </PageTitle>
      </div>

      <div className="flex justify-between">
        <div data-name="content-left" className="sm:mr-12">
          {parkingdata.Image && <div className="mb-8">
              <ImageSlider images={[
                parkingdata.Image
              ]} />
            </div>
          }

          <section
            className="
              flex justify-between
              text-sm
              sm:text-base
            "
          >
            <p>
              <b>{parkingdata.Title}</b>
              <br />
              {parkingdata.Location}
              <br />
              {parkingdata.Postcode} {parkingdata.Plaats}
            </p>
            <p>
              <b>0.3km</b>
            </p>
          </section>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Openingstijden"
            contentClasses="grid grid-cols-2"
          >
            {formatOpening(2, "ma", "Maandag")}
            {formatOpening(3, "di", "Dinsdag")}
            {formatOpening(4, "wo", "Woensdag")}
            {formatOpening(5, "do", "Donderdag")}
            {formatOpening(6, "vr", "Vrijdag")}
            {formatOpening(0, "za", "Zaterdag")}
            {formatOpening(1, "zo", "Zondag")}
            {parkingdata.Openingstijden !== "" && (
              <div className="col-span-2">
                <div>
                  <br />
                  {parkingdata.Openingstijden}
                </div>
              </div>
            )}
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Tarief">
            <div className="font-bold">Fietsen</div>
            <div className="ml-2 grid grid-cols-2 w-full">
              <div>Eerste 24 uur:</div>
              <div className="text-right sm:text-center">gratis</div>
              <div>Daarna per 24 uur:</div>
              <div className="text-right sm:text-center">&euro;0,60</div>
            </div>
            <div className="font-bold mt-4">Bromfietsen</div>
            <div className="ml-2 grid grid-cols-2 w-full">
              <div>Eerste 24 uur:</div>
              <div className="text-right sm:text-center">&euro;0,60</div>
            </div>
          </SectionBlock>

          <HorizontalDivider className="my-4" />

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
            </div>
          </SectionBlock>

          {/*<button>Koop abonnement</button>*/}

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Soort stalling">
            Bewaakte stalling
          </SectionBlock>

          <HorizontalDivider className="my-4" />

          <SectionBlock heading="Beheerder">
            U-stal
          </SectionBlock>

          <p className="mb-10">
            {/*Some spacing*/}
          </p>

          {/*<button>Breng mij hier naartoe</button>*/}
        </div>

        <div data-name="content-right" className="ml-12 hidden sm:block">
          <div className="relative">

            <ParkingOnTheMap parking={parkingdata} />

            <Button
              className="
                absolute bottom-0 right-3
                z-10
              "
              onClick={(e) => {
                if(e) e.preventDefault();
                openRoute(parkingdata.Coordinaten)
              }}
            >
              Breng mij hier naartoe
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Parking;
