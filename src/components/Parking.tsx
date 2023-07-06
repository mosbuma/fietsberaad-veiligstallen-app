import React from "react";

// Import components
import PageTitle from "~/components/PageTitle";
import ContentPageWrapper from "~/components/ContentPageWrapper";
import ImageSlider from "~/components/ImageSlider";
import HorizontalDivider from "~/components/HorizontalDivider";
import { Button } from "~/components/Button";

const Parking = ({ parkingdata }) => {
  console.log("@@ stallingdata", JSON.stringify(parkingdata, 0, 2));
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
              {Location}
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
            <div className="grid flex-1 grid-cols-2  ">
              <div>Maandag</div>
              <div className="text-right">
                {parkingdata.Open_ma} - {parkingdata.Dicht_ma}
              </div>
              <div>Dinsdag</div>
              <div className="text-right">7:00 - 1:00</div>

              <div className="font-bold">Woensdag</div>
              <div className="text-right font-bold">7:00 - 1:00</div>

              <div>Donderdag</div>
              <div className="text-right">7:00 - 1:00</div>
              <div>Vrijdag</div>
              <div className="text-right">7:00 - 1:00</div>
              <div>Zaterdag</div>
              <div className="text-right">7:00 - 1:00</div>
              <div>Zondag</div>
              <div className="text-right">7:00 - 1:00</div>
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
                <div align="right">gratis</div>
                <div>Daarna per 24 uur:</div>
                <div align="right">&euro;0,60</div>
              </div>
              <div className="font-bold">Bromfietsen</div>
              <div className="ml-2 grid grid-cols-2">
                <div>Eerste 24 uur:</div>
                <div align="right">&euro;0,60</div>
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
                <div align="right">32</div>
                <div>Afwijkende maten</div>
                <div align="right">7</div>
                <div>Elektrische fietsen</div>
                <div align="right">19</div>
                <div>Bakfietsen</div>
                <div align="right">12</div>
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
                <div align="right">&euro;80,90</div>
                <div>Jaarabonnement bromfiets</div>
                <div align="right">&euro;262.97</div>
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
          <img
            src="/images/kaart-voorbeeld.png"
            alt="Kaart"
            width="414"
            className="rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
};

export default Parking;
