import React, { useEffect, useState } from "react";

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

import { type ParkingDetailsType } from "~/types/parking";
import type { fietsenstallingen, contacts } from "@prisma/client";
import { createVeiligstallenOrgOpwaardeerLinkForMunicipality } from "~/utils/parkings";


import { getMunicipalities } from "~/utils/municipality";
import { useDispatch, useSelector } from "react-redux";
import { setMunicipalities } from "~/store/geoSlice";
import type { AppState } from "~/store/store";
import ReportComponent from "../beheer/reports";
import { ReportBikepark } from "../beheer/reports/ReportsFilter";

const ParkingView = ({
  parkingdata,
  fietsenstallingen,
  onEdit = undefined,
  onToggleStatus = undefined,
  isLoggedIn,
}: {
  parkingdata: ParkingDetailsType;
  fietsenstallingen: fietsenstallingen[];
  onEdit: Function | undefined;
  onToggleStatus: Function | undefined;
  isLoggedIn: boolean;
}) => {
  const [urlOpwaarderen, setUrlOpwaarderen] = useState<string>("");
  const dispatch = useDispatch();

  const municipalities = useSelector(
    (state: AppState) => state.geo.municipalities
  );

  useEffect(() => {
    // Don't ask the API if we have all municipalities already
    if (municipalities && municipalities.length > 0) {
      return;
    }
    (async () => {
      const response = await getMunicipalities();
      dispatch(setMunicipalities(response));
    })();
  }, []);

  useEffect(() => {
    if (!municipalities) {
      setUrlOpwaarderen("");
      return;
    }

    const municipality = municipalities.find((m: contacts) => m.ID === parkingdata.SiteID) as any as contacts | undefined;
    if (municipality) {
      const url = createVeiligstallenOrgOpwaardeerLinkForMunicipality(municipality, fietsenstallingen);
      setUrlOpwaarderen(url);
    }
  }, [municipalities, parkingdata, fietsenstallingen]);

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

  let status = "";
  switch (parkingdata.Status) {
    case "0": status = "Verborgen";
      break;
    case "1": status = "Zichtbaar";
      break;
    case "new":
    case "aanm":
      status = "Aanmelding";
      break
    default:
      ;
  }

  const buttonOpwaarderen = <Button
    key="b-opwaarderen"
    className="mt-3 text-center flex-shrink"
    onClick={() => {
      if (urlOpwaarderen === "") {
        return;
      }
      window.open(urlOpwaarderen, '_blank');
    }}
  >
    Stallingstegoed<br ></br>opwaarderen
  </Button>

  return (
    <>
      <div
        className="
      "
      >
        <div
          className="
            sm:mr-8 flex
            justify-between
          "
        >
          <PageTitle className="flex w-full justify-center sm:justify-start">
            <div className="mr-4 hidden sm:block">{parkingdata?.Title}</div>
            {onEdit !== undefined ? (
              <Button
                key="b-1"
                className="mt-3 sm:mt-0 hidden sm:block"
                onClick={(e: any) => {
                  if (e) e.preventDefault();
                  onEdit();
                }}
              >
                Bewerken
              </Button>
            ) : null}
            {isLoggedIn && onToggleStatus !== undefined && ["0", "1"].includes(parkingdata.Status) ? (
              <Button
                key="b-2"
                className="mt-3 ml-3 sm:mt-0 hidden sm:block"
                variant="secundary"
                onClick={(e: any) => {
                  if (e) e.preventDefault();
                  onToggleStatus();
                }}
              >
                {parkingdata.Status === "0" ? "Zichtbaar maken" : "Verbergen"}
              </Button>
            ) : null}
          </PageTitle>
        </div>
        {parkingdata?.Description && <p className="mb-8">
          {parkingdata?.Description}
        </p>}


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
              <div className="flex flex-col">
                {parkingdata.Type || "Onbekend"}
                {urlOpwaarderen !== "" ? buttonOpwaarderen : null}
              </div>
            </SectionBlock>

            <HorizontalDivider className="my-4" />

            <ParkingViewBeheerder parkingdata={parkingdata} />

            {isLoggedIn && status !== '' ?
              <>
                <HorizontalDivider className="my-4" />

                <SectionBlock heading="Status">
                  {status}
                </SectionBlock>
              </> : null}

            <p className="mb-10">{/*Some spacing*/}</p>

            {/*<button>Breng mij hier naartoe</button>*/}
          </div>

          <div data-name="content-right" className="ml-12 hidden lg:block">
            <div className="relative">

              <ParkingOnTheMap parking={parkingdata} />

              <Button
                className="
                  fixed bottom-3
                  right-3 z-10
                  flex
                  py-3
                  sm:absolute
                  sm:bottom-1
                "
                onClick={(e: any) => {
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
          </div>

        </div>

      </div>

      <div data-name="content-bottom" className="">
        <h2 className="
          text-2xl
          font-poppinssemi
          font-normal
          mb-6
        "
        >
          Statistieken
        </h2>

        {isLoggedIn && <Reports bikeparks={[
          {
            GemeenteID: parkingdata.SiteID,
            Title: parkingdata.Title,
            id: parkingdata.StallingsID,
            StallingsID: parkingdata.StallingsID || "---",
            hasData: true,
          }
        ]} />}

      </div>
    </>
  );
};

const Reports = ({ bikeparks }: { bikeparks: ReportBikepark[] }) => {
  const showAbonnementenRapporten = true;
  const firstDate = new Date("2018-03-01");
  const lastDate = new Date(); lastDate.setHours(0, 0, 0, 0); // set time to midnight

  return (
    <ReportComponent
      showAbonnementenRapporten={showAbonnementenRapporten}
      firstDate={firstDate}
      lastDate={lastDate}
      bikeparks={bikeparks || []}
    />
  )
}

export default ParkingView;
