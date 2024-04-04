import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type NextPage } from "next";
import { useRouter } from 'next/router'
import Link from 'next/link'

import {
  setIsParkingListVisible,
  setIsFilterBoxVisible,
  setIsMobileNavigationVisible
} from "~/store/appSlice";
import {
  setActiveParkingId,
  setActiveMunicipalityInfo,
  setInitialLatLng,
} from "~/store/mapSlice";

import { setQuery } from "~/store/filterSlice";

import {
  getMunicipalityBasedOnCbsCode,
  getMunicipalityBasedOnUrlName,
  cbsCodeFromMunicipality
} from "~/utils/municipality";

import { convertCoordinatenToCoords } from "~/utils/map/index";

import ParkingFacilities from "~/components/ParkingFacilities";
import AppHeader from "~/components/AppHeader";
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
import { ToggleMenuIcon } from "~/components/ToggleMenuIcon";
import AppNavigationMobile from "~/components/AppNavigationMobile";
import WelcomeToMunicipality from "~/components/WelcomeToMunicipality";

import { getParkingsFromDatabase } from "~/utils/prisma";
import { getServerSession } from "next-auth/next"
import { useSession } from "next-auth/react";
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { AppState } from "~/store/store";
import type { fietsenstallingen } from "@prisma/client";
// import { undefined } from "zod";

export async function getServerSideProps(context: any) {
  try {
    const session = await getServerSession(context.req, context.res, authOptions)
    const sites = session?.user?.sites || [];
    const fietsenstallingen: fietsenstallingen[] = await getParkingsFromDatabase(sites);

    // TODO: Don't include: EditorCreated, EditorModified

    return {
      props: {
        fietsenstallingen,
        online: true,
        message: "",
      },
    };
  } catch (ex: any) {
    console.error("index.getServerSideProps - error: ", ex.message);
    return {
      props: {
        fietsenstallingen: [],
        online: false,
        message: ex.message,
      },
    };
  }
}

const Home: NextPage = ({
  fietsenstallingen,
  online,
  message
}: any) => {
  const router = useRouter();
  const { query } = useRouter();
  const { data: session } = useSession()

  const dispatch = useDispatch();

  const [isClient, setIsClient] = useState<boolean>(false);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState<boolean>(false);

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const isParkingListVisible = useSelector(
    (state: AppState) => state.app.isParkingListVisible
  );

  const isFilterBoxVisible = useSelector(
    (state: AppState) => state.app.isFilterBoxVisible
  );

  const isMobileNavigationVisible = useSelector(
    (state: AppState) => state.app.isMobileNavigationVisible
  );

  const activeMunicipality = useSelector(
    (state: AppState) => state.map.activeMunicipality
  );

  const activeMunicipalityInfo = useSelector(
    (state: AppState) => state.map.activeMunicipalityInfo
  );

  const activeParkingId = useSelector(
    (state: AppState) => state.map.activeParkingId
  );

  const initialLatLng = useSelector((state: AppState) => state.map.initialLatLng);

  const mapZoom = useSelector((state: AppState) => state.map.zoom);

  // Check if on client
  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  useEffect(() => {
    // handle aanmelden sequence
    if (router.query.stallingid !== undefined && !Array.isArray(router.query.stallingid)) {
      dispatch(setActiveParkingId(router.query.stallingid));
    }
  }, [
    router.query,
    router.query.stallingid,
    router.query.revision,
  ]);

  // Do things is municipality if municipality is given by URL
  useEffect(() => {
    if (router.query.urlName === undefined || Array.isArray(router.query.urlName)) return;

    // Get municipality based on urlName
    (async (urlName: string) => {
      // Get municipality
      const municipality = await getMunicipalityBasedOnUrlName(urlName);
      if (!municipality) return;
      // Fly to municipality, on the map
      const initialLatLng = convertCoordinatenToCoords(municipality.Coordinaten);
      if (initialLatLng) {
        dispatch(setInitialLatLng(initialLatLng));
      }
      // Set municipality info in redux
      dispatch(setActiveMunicipalityInfo(municipality));
    })(router.query.urlName);
  }, [
    router.query.urlName
  ]);

  // Get municipality theme info
  useEffect(() => {
    if (!activeMunicipality) return;
    if (!activeMunicipality.municipality) return;

    (async () => {
      // Convert municipality code of DD to VS
      let cbsCode = cbsCodeFromMunicipality(activeMunicipality);
      if (cbsCode === false) {
        // no valid cbsCode for the current location
        window.history.pushState({}, "", `/`);
        return;
      }

      // Get the municipality info from the database
      const municipalityInfo = await getMunicipalityBasedOnCbsCode(cbsCode);
      // Set municipality slug in URL
      if (mapZoom >= 12 && municipalityInfo && municipalityInfo.UrlName) {
        window.history.pushState({}, "", `/${municipalityInfo.UrlName}`);
      }
      // If zoomed out, have just `/` as URL
      else {
        window.history.pushState({}, "", `/`);
      }
      // Set the municipality info in redux
      dispatch(setActiveMunicipalityInfo(municipalityInfo))
    })();
  }, [
    activeMunicipality
  ])

  // Open municipality info modal
  let TO_showWelcomeModal: NodeJS.Timeout | undefined = undefined;
  useEffect(() => {
    if (TO_showWelcomeModal) clearTimeout(TO_showWelcomeModal);
    TO_showWelcomeModal = setTimeout(() => {
      if (!initialLatLng || !activeMunicipalityInfo) return;
      // Save the fact that user did see welcome modal
      const VS__didSeeWelcomeModalString: string = localStorage.getItem('VS__didSeeWelcomeModal') || '';
      let VS__didSeeWelcomeModal: number = 0;
      try {
        VS__didSeeWelcomeModal = parseInt(VS__didSeeWelcomeModalString);
      } catch (ex) {
        VS__didSeeWelcomeModal = 0
      }

      // console.log('GET timestamp', VS__didSeeWelcomeModal, Date.now() - VS__didSeeWelcomeModal, 'Date.now()', Date.now())
      // Only show modal once per 15 minutes
      if (!VS__didSeeWelcomeModal || (Date.now() - VS__didSeeWelcomeModal > (3600 * 1000 / 4))) {
        setIsInfoModalVisible(true);
      }
    }, 1650);// 1500 is flyTo time in MapComponent
  }, [
    activeMunicipalityInfo,
    initialLatLng
  ]);

  const isSm = typeof window !== "undefined" && window.innerWidth < 640;
  // const isLg = typeof window !== "undefined" && window.innerWidth < 768;

  const isCardListVisible = !isParkingListVisible && !isFilterBoxVisible;

  if (online === false) {
    return (
      <>
        <main className="flex-grow">
          <h1>Database offline {message} </h1>
        </main>
      </>
    );
  }

  const updateStallingId = (id: string | undefined): void => {
    if (undefined === id) {
      delete query.stallingid;
      router.push({ query: { ...query } });
    } else {
      router.push({ query: { ...query, stallingid: id } });
    }

    if (activeParkingId !== id) {
      dispatch(setActiveParkingId(id));
    }
  }

  const handleCloseParking = () => {
    if (router.query.stallingid !== undefined) {
      delete query.stallingid;
      router.push({ query: { ...query } });
    }
    dispatch(setActiveParkingId(undefined));
  }

  return (
    <>
      <main className="flex-grow">

        <AppHeader onStallingAanmelden={() => dispatch(setActiveParkingId("aanmelden"))} />

        {activeParkingId !== undefined && (
          <Parking id={'parking-modal-' + activeParkingId} stallingId={activeParkingId} onStallingIdChanged={(newId) => { updateStallingId(newId) }} onClose={handleCloseParking} />
        )}

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
              height: 'auto'
            }}
          // height: mapZoom >= 12 ? "60vh" : 'auto',
          // maxHeight: 'calc(100vh - 64px)'
          >
            <ParkingFacilityBrowser
              showSearchBar={true}
              fietsenstallingen={fietsenstallingen}
              onShowStallingDetails={(id: string | undefined) => { updateStallingId(id) }}
            />
          </div>

          <div
            data-comment="Mobile topbar - Show only on mobile"
            className="
              flex sm:hidden
              top-3
              right-3
              left-5
              fixed
            "
          >
            <Link
              href={`/${activeMunicipalityInfo ? (activeMunicipalityInfo.UrlName !== 'fietsberaad' ? activeMunicipalityInfo.UrlName : '') : ''}`}
              onClick={() => {
                dispatch(setIsParkingListVisible(false));
              }}
              className="block mr-3"
            >
              <Logo imageUrl={(mapZoom >= 12 && activeMunicipalityInfo && activeMunicipalityInfo.CompanyLogo2) ? `https://static.veiligstallen.nl/library/logo2/${activeMunicipalityInfo.CompanyLogo2}` : undefined} />
            </Link>
            <SearchBar
              filterChanged={(e: { target: { value: any; }; }) => {
                dispatch(setQuery(e.target.value))
                dispatch(setIsParkingListVisible(true));
              }}
              afterHtml={
                <ToggleMenuIcon className="
                  shadow-none
                  bg-transparent
                  absolute
                  right-1
                  z-10
                "
                  onClick={() => {
                    dispatch(setIsMobileNavigationVisible(true))
                  }}
                />}
            />
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
                dispatch(setIsParkingListVisible(!isParkingListVisible));
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
                dispatch(setIsFilterBoxVisible(!isFilterBoxVisible));
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
                <FilterBox isOpen={false} />
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
                    onShowStallingDetails={(id: any) => { updateStallingId(id) }}
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
            onShowStallingDetails={(id: any) => { updateStallingId(id) }}
          />
        </div>}

        <ParkingFacilities
          fietsenstallingen={fietsenstallingen}
          onStallingAamelden={() => { dispatch(setActiveParkingId("aanmelden")) }}
        />
      </main>

      {isMobileNavigationVisible && (<>
        <Modal
          onClose={() => {
            dispatch(setIsMobileNavigationVisible(false))
          }}
          clickOutsideClosesDialog={false}
        >
          <AppNavigationMobile
            mapZoom={mapZoom}
            activeMunicipalityInfo={activeMunicipalityInfo}
          />
        </Modal>
      </>)}

      {isClient && isInfoModalVisible && <Modal
        onClose={() => {
          // Save the fact that user did see welcome modal
          localStorage.setItem('VS__didSeeWelcomeModal', Date.now().toString());

          setIsInfoModalVisible(false);
        }}
        clickOutsideClosesDialog={false}
        modalStyle={{
          width: '400px',
          maxWidth: '100%',
          marginRight: 'auto',
          marginLeft: 'auto',
        }}
        modalBodyStyle={{
          overflow: 'visible',
        }}
      >
        <WelcomeToMunicipality
          municipalityInfo={activeMunicipalityInfo}
          buttonClickHandler={() => {
            // Save the fact that user did see welcome modal
            localStorage.setItem('VS__didSeeWelcomeModal', Date.now().toString());

            setIsInfoModalVisible(false)
          }}
        />
      </Modal>}

    </>
  );
};

export default Home;
