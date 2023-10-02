import { SetStateAction, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type NextPage } from "next";
import Head from "next/head";
import superjson from "superjson";
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { ParkingDetailsType } from "~/types";

import {
  setIsParkingListVisible,
  setIsFilterBoxVisible,
  setIsMobileNavigationVisible
} from "~/store/appSlice";
import {
  setActiveMunicipalityInfo,
  setInitialLatLng,
} from "~/store/mapSlice";

import { setQuery } from "~/store/filterSlice";

import {
  getMunicipalityBasedOnCbsCode,
  getMunicipalityBasedOnUrlName
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
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { getParkingDetails, generateRandomId } from "~/utils/parkings";

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

  // const [currentStallingId, setCurrentStallingId] = useState<string|undefined>(undefined);
  const [currentStalling, setCurrentStalling] = useState<ParkingDetailsType|null>(null);
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

  const initialLatLng = useSelector((state: AppState) => state.map.initialLatLng);

  const mapZoom = useSelector((state: AppState) => state.map.zoom);

  // Check if on client
  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  useEffect(() => {
    const stallingId = router.query.stallingid;
    if(stallingId===undefined || Array.isArray(stallingId)) {
      console.warn('stallingId is undefined or array', stallingId);
      return;
    }

    if(stallingId==='nieuw') {
      const voorstelid=generateRandomId('VOORSTEL')
      const data =  {
        ID: voorstelid, 
        Title: 'Nieuwe stalling',
        Type: 'bewaakt',
        Coordinaten: '52.09066,5.121317',
      }

      fetch(
        "/api/fietsenstallingen",
        {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        }
      ).then(response => {
        if(response) {
          response.json().then(json => {
            router.push(`?stallingid=${json.ID}&editmode`); // refreshes the page to show the edits
          })
        } else {
          console.error('create new parking failed', response);
        }
      });
    } else {
      getParkingDetails(stallingId).then((stalling) => {
        setCurrentStalling(stalling);
      });
    }
  }, [router.query.stallingid]);

  // Do things is municipality if municipality is given by URL
  useEffect(() => {
    if(! router.query.urlName) return;

    // Get municipality based on urlName
    (async () => {
      // Get municipality
      const municipality = await getMunicipalityBasedOnUrlName(router.query.urlName);
      if(! municipality) return;
      // Fly to municipality, on the map
      const initialLatLng = convertCoordinatenToCoords(municipality.Coordinaten);
      if(initialLatLng) {
        dispatch(setInitialLatLng(initialLatLng));
      }
      // Set municipality info in redux
      dispatch(setActiveMunicipalityInfo(municipality));
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
      // Set municipality slug in URL
      if(mapZoom >= 12 && municipalityInfo && municipalityInfo.UrlName) {
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
  let TO_showWelcomeModal;
  useEffect(() => {
    if(TO_showWelcomeModal) clearTimeout(TO_showWelcomeModal);
    TO_showWelcomeModal = setTimeout(() => {
      if(! initialLatLng || ! activeMunicipalityInfo) return;
      // Save the fact that user did see welcome modal
      const VS__didSeeWelcomeModal = localStorage.getItem('VS__didSeeWelcomeModal');
      // console.log('GET timestamp', VS__didSeeWelcomeModal, Date.now() - VS__didSeeWelcomeModal, 'Date.now()', Date.now())
      // Only show modal once per 15 minutes
      if(! VS__didSeeWelcomeModal || (Date.now() - VS__didSeeWelcomeModal > (3600*1000 / 4))) {
        setIsInfoModalVisible(true);
      }
    }, 1650);// 1500 is flyTo time in MapComponent
  }, [
    activeMunicipalityInfo,
    initialLatLng
  ]);

  const isSm = typeof window !== "undefined" && window.innerWidth < 640;
  const isLg = typeof window !== "undefined" && window.innerWidth < 768;

  const isCardListVisible = ! isParkingListVisible && ! isFilterBoxVisible;

  if (online === false) {
    return (
      <>
        <main className="flex-grow">
          <h1>Database offline</h1>
        </main>
      </>
    );
  }

  const updateStallingId = (id: string | undefined): void => {
    if(undefined===id) {
      delete query.stallingid;
      router.push({ query: { ...query}});
    } else {
      router.push({ query: { ...query, stallingid: id }}); 
    }
    if(undefined===id) {
      setCurrentStalling(null);
    }
  }

  let startInEditMode=false;
  if(currentStalling!== null && 'editmode' in router.query) {
    startInEditMode = true;
  }

  return (
    <>
      <main className="flex-grow">

        <AppHeader />

        {currentStalling!==null && isSm && (<>
          <Overlay
            title={currentStalling.Title}
            onClose={() => {updateStallingId(undefined)}}
          >
            <Parking
              key={'parking-sm-' + currentStalling.ID}
              parkingdata={currentStalling}
              startInEditMode={startInEditMode}
            />
          </Overlay>
        </>)}

        {currentStalling!==null && ! isSm && (<>
          <Modal
            onClose={() => {updateStallingId(undefined)}}
            clickOutsideClosesDialog={false}
          >
            <Parking
              key={'parking-nsm-' + currentStalling.ID}
              parkingdata={currentStalling}
              startInEditMode={startInEditMode}
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
              height: 'auto'
            }}
            // height: mapZoom >= 12 ? "60vh" : 'auto',
            // maxHeight: 'calc(100vh - 64px)'
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
              filterChanged={(e) => {
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
          localStorage.setItem('VS__didSeeWelcomeModal', Date.now());

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
            localStorage.setItem('VS__didSeeWelcomeModal', Date.now());
  
            setIsInfoModalVisible(false)
          }}
        />
      </Modal>}

    </>
  );
};

export default Home;
