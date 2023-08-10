import React from "react";

// Import components
import PageTitle from "~/components/PageTitle";
import ImageSlider from "~/components/ImageSlider";
import HorizontalDivider from "~/components/HorizontalDivider";
import { Button, IconButton } from "~/components/Button";
import ParkingOnTheMap from "~/components/ParkingOnTheMap";

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
    <div className="ml-10 mr-10 mt-10">
      <div
        className="
          mr-8 flex
          justify-between
        "
      >
        <PageTitle className="flex justify-center">
          {parkingdata.Title}
          <Button className="ml-4">bewerken</Button>
        </PageTitle>
      </div>

      <div className="flex justify-between">
        <div data-name="content-left" className="mr-12">
          <ImageSlider />

          <section
            className="
              mt-8
              flex justify-between
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

          <div className="flex justify-between">
            <div
              className="
                w-48
                font-bold
              "
            >
              Openingstijden
            </div>
            <div className="grid flex-1 grid-cols-2">
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
            </div>
          </div>

          <HorizontalDivider className="my-4" />

          <div className="flex justify-between">
            <div
              className="
                w-48
                font-bold
              "
            >
              Tarief
            </div>
            <div className="flex-1">
              <div className="font-bold">Fietsen</div>
              <div className="ml-2 grid grid-cols-2">
                <div>Eerste 24 uur:</div>
                <div className="text-center">gratis</div>
                <div>Daarna per 24 uur:</div>
                <div className="text-center">&euro;0,60</div>
              </div>
              <div className="font-bold">Bromfietsen</div>
              <div className="ml-2 grid grid-cols-2">
                <div>Eerste 24 uur:</div>
                <div className="text-center">&euro;0,60</div>
              </div>
            </div>
          </div>

          <HorizontalDivider className="my-4" />

          <div className="flex justify-between">
            <div
              className="
                w-48
                font-bold
              "
            >
              Services
            </div>
            <div className="flex-1">
              <div>
                <div>Buggy uitleen/verhuur</div>
                <div>Fietspomp</div>
                <div>Fietsverhuur</div>
                <div>Reparatie</div>
                <div>Toilet</div>
              </div>
            </div>
          </div>

          <HorizontalDivider className="my-4" />

          <div className="flex justify-between">
            <div
              className="
                w-48
                font-bold
              "
            >
              Capaciteit
            </div>
            <div className="flex-1">
              <div className="ml-2 grid grid-cols-2">
                <div>Bromfietsen</div>
                <div className="text-center">32</div>
                <div>Afwijkende maten</div>
                <div className="text-center">7</div>
                <div>Elektrische fietsen</div>
                <div className="text-center">19</div>
                <div>Bakfietsen</div>
                <div className="text-center">12</div>
              </div>
            </div>
          </div>

          <HorizontalDivider className="my-4" />

          <div className="flex justify-between">
            <div
              className="
                w-48
                font-bold
              "
            >
              Abonnementen
            </div>
            <div className="flex-1">
              <div className="ml-2 grid grid-cols-2">
                <div>Jaarbonnement fiets</div>
                <div className="text-center">&euro;80,90</div>
                <div>Jaarabonnement bromfiets</div>
                <div className="text-center">&euro;262.97</div>
              </div>
            </div>
          </div>

          {/*<button>Koop abonnement</button>*/}

          <HorizontalDivider className="my-4" />

          <div className="flex justify-between">
            <div
              className="
                w-48
                font-bold
              "
            >
              Soort stalling
            </div>
            <div className="flex-1">Bewaakte stalling</div>
          </div>

          <HorizontalDivider className="my-4" />

          <div className="flex justify-between">
            <div
              className="
                w-48
                font-bold
              "
            >
              Beheerder
            </div>
            <div className="flex-1">U-stal</div>
          </div>

          {/*<button>Breng mij hier naartoe</button>*/}
        </div>

        <div data-name="content-right" className="ml-12">
          <div className="relative">

            <ParkingOnTheMap parking={parkingdata} />

            <Button className="
              absolute bottom-0 right-3
              z-10
            "
            onClick={() => {
              // Get coords from parking variable
              const coords = parkingdata.Coordinaten.split(",").map((coord: any) => Number(coord)); // E.g.: 52.508011,5.473280;
              const coordsString = "" + coords[0] + ',' + coords[1]; // E.g. 51.9165409,4.4480073
              // Generate route URL
              // dirflg: b=bicycling. Source: https://webapps.stackexchange.com/a/67255
              const url = `https://www.google.com/maps/dir/?api=1&travelmode=bicycling&destination=${coordsString}&z=17&dirflg=b`;
              // window.open(url, '_blank');
              // If it's an iPhone..
              if( (navigator.platform.indexOf("iPhone") != -1) 
                  || (navigator.platform.indexOf("iPod") != -1)
                  || (navigator.platform.indexOf("iPad") != -1))
                   window.open(`maps://www.google.com/maps/dir/?api=1&layer=traffic&destination=${coordsString}`);
              else
                   window.open(url);

            }}>
              Breng mij hier naartoe
            </Button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Parking;
