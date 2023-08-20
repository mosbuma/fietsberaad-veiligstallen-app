import React from "react";

import { openRoute } from "~/utils/map/index";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
  contentClasses,
}: {
  heading: string;
  children: any;
  contentClasses?: string;
}) => {
  return (
    <div className="flex flex-wrap justify-between xl:flex-nowrap">
      <div
        className="
          w-full
          font-bold
          xl:w-48
        "
      >
        {heading}
      </div>
      <div
        className={`
        ml-4
        mt-4
        w-full
        text-sm

        xl:ml-0

        xl:mt-0
        xl:w-auto

        xl:flex-1
        xl:text-base
        ${contentClasses ? contentClasses : ""}
      `}
      >
        {children}
      </div>
    </div>
  );
};

const Parking = ({ parkingdata }: { parkingdata: any }) => {
  const router = useRouter();
  const session = useSession();

  const [editMode, setEditMode] = React.useState(false);

  const [newTitle, setNewTitle ] = React.useState(undefined);
  const [newLocation, setNewLocation ] = React.useState(undefined);
  const [newPostcode, setNewPostcode ] = React.useState(undefined);
  const [newPlaats, setNewPlaats ] = React.useState(undefined);

  const updateParking = async () => {
    if(newTitle === undefined &&
       newPostcode === undefined &&
       newLocation === undefined &&
       newPlaats === undefined) {
      return;
    }


    let newParking = {
    };

    if(newTitle !== undefined) { newParking.Title = newTitle; }
    if(newLocation !== undefined) { newParking.Location = newLocation; }
    if(newPostcode !== undefined) { newParking.Postcode = newPostcode; }
    if(newPlaats !== undefined) { newParking.Plaats = newPlaats; }

    console.log("updateParking", newParking);

    const response = await fetch(
      "/api/fietsenstallingen?id=" + parkingdata.ID,
      {
        method: "PUT",
        body: JSON.stringify(newParking),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    router.push("?stallingid=" + parkingdata.ID); // refreshes the page to show the edits
  };

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

    let value = `${hoursopen}:${minutesopen} - ${hoursclose}:${minutesclose}`;

    let diff = Math.abs((tmpclose.getTime() - tmpopen.getTime()) / 1000);
    if(diff>=86340) {
      value = '24h'
    }

    return (
      <>
        <div className={wkday + 1 === dayidx ? "font-bold" : ""}>{label}</div>
        <div className="text-right">{value}</div>
      </>
    );
  };

  // console.log("@@ stallingdata has %s items", parkingdata.length);

  const label = editMode ? "opslaan" : "bewerken";

  console.log("@@@ parkingdata", parkingdata.Title);

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
          <div className="mr-4 hidden sm:block">{parkingdata.Title}</div>
          {session.status === "authenticated" ? (
            <Button
              key="b-1"
              className="mt-3 sm:mt-0"
              onClick={(e) => {
                if (e) e.preventDefault();
                if (editMode) {
                  updateParking();
                }
                setEditMode(editMode === false);
              }}
            >
              {label}
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

          <section
            className="
              flex justify-between
              text-sm
              sm:text-base
            "
          >
            <p>
              {editMode === false ? 
                <b>{parkingdata.Title}</b> 
              :
                <input key='i-title' className="border-2 border-black mb-1" placeholder="titel" onChange={e=>{ setNewTitle(e.target.value)}} value={newTitle!==undefined?newTitle:parkingdata.Title} />}
              <br />
              {parkingdata.Type}
              <br />
              {editMode === false ? 
                parkingdata.Location
              :
                <input key='i-location' className="border-2 border-black mb-1" placeholder="adres" onChange={e=>{ setNewLocation(e.target.value)}} value={newLocation!==undefined?newLocation:parkingdata.Location} />}
              <br />
              {editMode === false ? 
                ((parkingdata.Postcode||'') + ' ' +parkingdata.Plaats).trim()
              :
                <>
                  <input key='i-postcode' className="border-2 border-black mb-1" placeholder="postcode" onChange={e=>{ setNewPostcode(e.target.value)}} value={newPostcode!==undefined?newPostcode:parkingdata.Postcode} />
                  <input key='i-plaats' className="border-2 border-black mb-1" placeholder="plaats" onChange={e=>{ setNewPlaats(e.target.value)}} value={newPlaats!==undefined?newPlaats:parkingdata.Plaats} />
                </>
              }
            </p>
            {/* <p>
              <b>0.3km</b
            </p> */}
          </section>

          <HorizontalDivider className="my-4" />

          <SectionBlock
            heading="Openingstijden"
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

export default Parking;
