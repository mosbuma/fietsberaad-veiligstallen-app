import React from 'react';

// Import components
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import PageTitle from "~/components/PageTitle";
import ContentPageWrapper from "~/components/ContentPageWrapper";
import ImageSlider from "~/components/ImageSlider";
import HorizontalDivider from "~/components/HorizontalDivider";
import CloseButton from "~/components/CloseButton";
import {Button} from "~/components/Button";

const Stalling = () => {
  return (
    <div className="container">
      <AppHeaderDesktop>

        <div className="
          flex justify-between
          mr-8
        ">

          <PageTitle>
            Utrecht Laag Catharijne
          </PageTitle> 

          <CloseButton />

        </div>

      </AppHeaderDesktop>
      <ContentPageWrapper>

        <div className="
          flex justify-between
          mr-8
        ">

          <PageTitle className="flex justify-center">
  
            Utrecht Laag Catharijne
    
            <Button className="ml-4">
              bewerken
            </Button>

          </PageTitle>

        </div>
      

        <div className="flex justify-between">
          <div data-name="content-left" className="mr-12">

            <ImageSlider />

            <section className="
              mt-8
              flex justify-between
            ">
              <p>
                <b>Fietsenstalling Laag Catharijne</b><br />
                Catharijnesingel 28<br />
                3511 GB Utrecht
              </p>
              <p>
                <b>0.3km</b>
              </p>
            </section>

            <HorizontalDivider className="my-4" />

            <div className="flex justify-between">
              <div className="
                w-48
                font-bold
              ">
                Openingstijden
              </div>
              <div className="flex-1 grid grid-cols-2  ">
                <div>Maandag</div>
                <div className="text-right">7:00 - 1:00</div>
                <div>Dinsdag</div>
                <div className="text-right">7:00 - 1:00</div>

                <div className="font-bold">Woensdag</div>
                <div className="font-bold text-right">7:00 - 1:00</div>

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
              <div className="
                w-48
                font-bold
              ">
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
              <div className="
                w-48
                font-bold
              ">
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
              <div className="
                w-48
                font-bold
              ">
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
              <div className="
                w-48
                font-bold
              ">
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
              <div className="
                w-48
                font-bold
              ">
                Soort stalling
              </div>
              <div className="flex-1">
                Bewaakte stalling
              </div>
            </div>

            <HorizontalDivider className="my-4" />

            <div className="flex justify-between">
              <div className="
                w-48
                font-bold
              ">
                Beheerder
              </div>
              <div className="flex-1">
                U-stal
              </div>
            </div>

            {/*<button>Breng mij hier naartoe</button>*/}

          </div>

          <div data-name="content-right" className="ml-12">
            <img src="/images/kaart-voorbeeld.png" alt="Kaart" width="414"
              className="rounded-3xl" />
          </div>

        </div>
      </ContentPageWrapper>

    </div>
  );
};

export default Stalling;
