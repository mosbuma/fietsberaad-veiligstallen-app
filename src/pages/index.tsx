import { SetStateAction, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type NextPage } from "next";
import Head from "next/head";
import superjson from "superjson";
import { useRouter } from 'next/router'

import {
  setIsParkingListVisible,
  setIsFilterBoxVisible
} from "~/store/appSlice";
import {
  setActiveMunicipalityInfo,
  setInitialLatLng
} from "~/store/mapSlice";

import {
  getMunicipalityBasedOnCbsCode,
  getMunicipalityBasedOnUrlName
} from "~/utils/municipality";

import { convertCoordinatenToCoords } from "~/utils/map/index";

import ParkingFacilities from "~/components/ParkingFacilities";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";
import Parking from "~/components/Parking";
import Modal from "src/components/Modal";
import Overlay from "src/components/Overlay";
import SearchBar from "~/components/SearchBar";
import CardList from "~/components/CardList";
import Logo from "~/components/Logo";
import ActiveFilters from "~/components/ActiveFilters";
import FilterBox from "~/components/FilterBox";
import { IconButton } from "~/components/Button";

import { getParkingsFromDatabase } from "~/utils/prisma";
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'

export async function getServerSideProps(context) {
  try {
    const session = await getServerSession(context.req, context.res, authOptions)
    // console.log(">>>>> session", session);
    const sites = session?.user?.sites || [];
    const fietsenstallingen = await getParkingsFromDatabase(sites);

    // TODO: Don't include: EditorCreated, EditorModified

    return {
      props: {
        fietsenstallingen: fietsenstallingen,
        online: true,
      },
    };
  } catch (ex: any) {
    // console.error("index.getStaticProps - error: ", ex.message);
    return {
      props: {
        fietsenstallingen: [],
        online: false,
      },
    };
  }
}

const Home: NextPage = ({
  fietsenstallingen,
  online,
}: any) => {
  const router = useRouter();
  const { query} = useRouter();

  const dispatch = useDispatch();

  const [currentStallingId, setCurrentStallingId] = useState(undefined);

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const isParkingListVisible = useSelector(
    (state: AppState) => state.app.isParkingListVisible
  );

  const isFilterBoxVisible = useSelector(
    (state: AppState) => state.app.isFilterBoxVisible
  );

  const activeMunicipality = useSelector(
    (state: AppState) => state.map.activeMunicipality
  );

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

  const mapZoom = useSelector((state: AppState) => state.map.zoom);

  useEffect(()=>{
    setCurrentStallingId(router.query.stallingid);
  }, [
    router.query.stallingid
  ]);

  // Do things is municipality if municipality is given by URL
  useEffect(() => {
    if(! router.query.urlName) return;

    // Get municipality based on urlName
    (async () => {
      // Get municipality
      const municipality = await getMunicipalityBasedOnUrlName(router.query.urlName);
      // Fly to municipality, on the map
      const initialLatLng = convertCoordinatenToCoords(municipality.Coordinaten);
      if(initialLatLng) {
        dispatch(setInitialLatLng(initialLatLng));
      }
      // Set municipality info in redux
      dispatch(setActiveMunicipalityInfo(municipality))      
    })();
  }, [
    router.query.urlName
  ]);

  // Get municipality theme info
  useEffect(() => {
    if(! activeMunicipality) return;
    if(! activeMunicipality.municipality) return;

    (async () => {
      // Convert municipality code of DD to VS
      let cbsCode = activeMunicipality.municipality.replace('GM', '');
      while(cbsCode.charAt(0) === '0') {
        cbsCode = cbsCode.substring(1);
      }
      cbsCode = Number(cbsCode);
      // Get the municipality info from the database
      const municipalityInfo = await getMunicipalityBasedOnCbsCode(cbsCode);
      // Set the municipality info in redux
      dispatch(setActiveMunicipalityInfo(municipalityInfo))
    })();
  }, [
    activeMunicipality
  ])

  const currentStalling = fietsenstallingen.find((stalling: any) => {
    return stalling.ID === currentStallingId;
  });

  const isSm = typeof window !== "undefined" && window.innerWidth < 640;
  const isLg = typeof window !== "undefined" && window.innerWidth < 768;

  const isCardListVisible = ! isParkingListVisible && ! isFilterBoxVisible;

  if (online === false) {
    return (
      <>
        <Head>
          <title>VeiligStallen</title>
          <meta name="description" content="VeiligStallen" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <main className="flex-grow">
          <h1>Database offline</h1>
        </main>
      </>
    );
  }

  const updateStallingId = (id: string | undefined): void => {
    console.log(">>> update stallingId", id);
    if(undefined===id) {
      delete query.stallingid;
      router.push({ query: { ...query}});
    } else {
      router.push({ query: { ...query, stallingid: id }}); 
    }
    setCurrentStallingId(id)
  }

  return (
    <>
      <Head>
        <title>VeiligStallen</title>
        <meta name="description" content="VeiligStallen" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <main className="flex-grow">
        <div data-comment="Show only on desktop" className="z-10 relative sm:h-16 hidden sm:flex">
          <AppHeaderDesktop />
        </div>

        {currentStallingId && isSm && (<>
          <Overlay
            title={currentStalling.Title}
            onClose={() => {updateStallingId(undefined)}}
          >
            <Parking
              key={currentStallingId}
              parkingdata={currentStalling}
            />
          </Overlay>
        </>)}

        {currentStallingId && ! isSm && (<>
          <Modal
            onClose={() => {updateStallingId(undefined)}}
            clickOutsideClosesDialog={true}
          >
            <Parking
              key={currentStallingId}
              parkingdata={fietsenstallingen.find((stalling: any) => {
                return stalling.ID === currentStallingId;
              })}
            />
          </Modal>
        </>)}

        <div
          className={`
            l-0
            absolute
            _bottom-0
            z-10
            w-full
            p-4
            sm:w-auto
            top-0
            sm:top-16
          `}
        >
          {/*
          <div
            data-comment="Spacer - Show only on desktop"
            className="
              hidden h-16
              w-full sm:block
            "
          ></div>
          */}

          <div
            data-comment="Parkings list - Show only on desktop"
            className="
              hidden sm:inline-block
            "
            style={{
              width: "414px",
              height: mapZoom >= 12 ? "60vh" : 'auto',
              maxHeight: 'calc(100vh - 64px)'
            }}
          >
            <ParkingFacilityBrowser
              showSearchBar={true}
              fietsenstallingen={fietsenstallingen}
              onShowStallingDetails={(id: any) => {updateStallingId(id)}}
            />
          </div>

          <div
            data-comment="Mobile topbar - Show only on mobile"
            className="
              flex sm:hidden
              top-5
              right-5
              left-5
              fixed
            "
          >
            <Logo imageUrl={(mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo2) ? `https://static.veiligstallen.nl/library/logo2/${activeMunicipalityInfo.CompanyLogo2}` : undefined} />
            <SearchBar />
            {/*HAMB.*/}
          </div>
        </div>

        <div
          data-comment="Floating buttons: Filter & Toggle buttons"
          className={`
            absolute
            ${isCardListVisible ? 'bottom-44' : 'bottom-5'}
            z-10
            block
            w-full
            sm:hidden
          `}
        >
          <div
            data-comment="Active parking types - Only show if <= 2 selected"
            style={{
              transform: "scale(0.8)",
              transformOrigin: "left bottom",
            }}
            className="mx-5 my-2 w-5/6"
            hidden={activeTypes.length > 2}
          >
            <ActiveFilters />
          </div>

          <div
            data-comment="Floating button: Toggle filter"
            className="
              absolute bottom-0
              right-0
              mx-5
              w-1/6
              text-right
            "
          >
            <IconButton
              className="
                mb-5 z-20 relative
              "
              iconUrl={
                isParkingListVisible
                  ? `/images/icon-map.png`
                  : `https://cdn3.iconfinder.com/data/icons/feather-5/24/list-256.png`
              }
              onClick={() => {
                dispatch(setIsParkingListVisible(! isParkingListVisible));
                // dispatch(setIsFilterBoxVisible(false));
              }}
            ></IconButton>

            <IconButton
              className="
                mb-0 z-20 relative
              "
              iconUrl={
                "https://cdn2.iconfinder.com/data/icons/user-interface-line-38/24/Untitled-5-21-256.png"
              }
              onClick={() => {
                dispatch(setIsFilterBoxVisible(! isFilterBoxVisible));
                // dispatch(setIsParkingListVisible(false));
              }}
            ></IconButton>

            {/*Overlays on same level as icon buttons,
               so we can show icon buttons above overlays
            */}
            {isFilterBoxVisible && <div
              data-comment="Filter overlay - Show only on mobile"
              className="
                fixed bottom-0 left-0
                z-20
                w-full
                h-full
                block
                sm:hidden
              "
            >
              <div className="
                absolute
                top-0
                right-0
                bottom-0
                left-0
              "
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}
              onClick={() => {
                dispatch(setIsFilterBoxVisible(false));
              }}
              />
              <div
                className="
                absolute
                bottom-0
                bg-white
                rounded-3xl
                rounded-b-none
                shadow-lg
                text-left
                p-4
              "
              >
                <FilterBox />
              </div>
            </div>}
            <div
              data-comment="Parking list overlay - Show only on mobile"
              className="
                fixed
                bottom-0 left-0
                z-10
                block
                w-full
                sm:hidden
              "
            >
              {isParkingListVisible && (
                <Overlay>
                  <ParkingFacilityBrowser
                    showSearchBar={false}
                    fietsenstallingen={fietsenstallingen}
                    onShowStallingDetails={(id: any) => {updateStallingId(id)}}
                  />
                </Overlay>
              )}
            </div>

          </div>
        </div>

        {isCardListVisible && <div
          data-comment="Parkings cards - Show only on mobile"
          className="
            absolute bottom-9
            z-10
            block
            w-full
            sm:hidden
          "
        >
          <CardList
            fietsenstallingen={fietsenstallingen}
            onShowStallingDetails={(id: any) => {updateStallingId(id)}}
          />
        </div>}

        <ParkingFacilities
          fietsenstallingen={fietsenstallingen}
        />
      </main>
    </>
  );
};

export default Home;
