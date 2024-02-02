import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type NextPage } from "next";
import { useRouter } from 'next/router'
import Link from 'next/link'
import { getQueryParameterString } from "~/utils/query";

import {
  setIsParkingListVisible,
  setIsFilterBoxVisible,
  setIsMobileNavigationVisible
} from "~/store/appSlice";
import {
  setActiveMunicipalityInfo,
  setInitialLatLng,
} from "~/store/mapSlice";
import {
  AppState
} from "~/store/store";

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
import { CardData } from "~/components/Card";
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
import { generateRandomId } from "~/utils/parkings";
import { DefaultSession } from "next-auth";
// import { undefined } from "zod";

interface VeiligstallenSession extends DefaultSession {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    sites?: string[];
  }
}

export async function getServerSideProps(context: any) {
  try {
    const session: VeiligstallenSession | null = await getServerSession(context.req, context.res, authOptions)
    // console.log(">>>>> session", session);
    const sites = session?.user?.sites || [];
    const fietsenstallingen = await getParkingsFromDatabase(sites);

    // TODO: Don't include: EditorCreated, EditorModified

    return {
      props: {
        fietsenstallingen: fietsenstallingen,
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

  const dispatch = useDispatch();

  const [currentStallingId, setCurrentStallingId] = useState<string | undefined>(undefined);
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
    let stallingid = getQueryParameterString(router.query, "stallingid");
    console.log("useeffect stallingID", stallingid);
    if (stallingid === undefined) {
      return;
    }

    if (stallingid === 'nieuw') {
      const voorstelid = generateRandomId('VOORSTEL')
      const data = {
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
        if (response) {
          response.json().then(json => {
            router.push(`?stallingid=${json.ID}&editmode`); // refreshes the page to show the edits
          })
        } else {
          console.error('create new parking failed', response);
        }
      });
    } else {
      setCurrentStallingId(stallingid);
    }
  }, [
    router.query.stallingid,
    router.query.revision
  ]);

  // Do things is municipality if municipality is given by URL
  useEffect(() => {
    // Get municipality based on urlName
    (async () => {
      let { urlname } = router.query; //  = Array.isArray(router.query.urlName) ? router.query.urlName[0]: router.query.urlName;
      if (Array.isArray(urlname)) {
        urlname = urlname[0];
      }
      if (undefined === urlname) {
        return
      }
      // Get municipality
      const municipality = await getMunicipalityBasedOnUrlName(urlname);
      if (!municipality) return;
      // Fly to municipality, on the map
      const initialLatLng = convertCoordinatenToCoords(municipality.Coordinaten);
      if (initialLatLng) {
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
    if (!activeMunicipality) return;
    if (!activeMunicipality.municipality) return;

    (async () => {
      // Convert municipality code of DD to VS
      let cbsCode = activeMunicipality.municipality.replace('GM', '');
      while (cbsCode.charAt(0) === '0') {
        cbsCode = cbsCode.substring(1);
      }
      cbsCode = Number(cbsCode);
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
      const VS__didSeeWelcomeModal = localStorage.getItem('VS__didSeeWelcomeModal');
      // console.log('GET timestamp', VS__didSeeWelcomeModal, Date.now() - VS__didSeeWelcomeModal, 'Date.now()', Date.now())
      // Only show modal once per 15 minutes
      if (!VS__didSeeWelcomeModal || (Date.now() - parseInt(VS__didSeeWelcomeModal) > (3600 * 1000 / 4))) {
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
        <main className="flex-grow border-2 ">
          <div className="text-xl text-center font-extrabold">Database offline</div>
          <br></br>
          <div className="text-sm text-center ">{message}</div>
        </main>
      </>
    );
  }

  const updateStallingId = (id: string | undefined): void => {
    if (undefined === id) {
      delete query.stallingid;
      router.push({ query: { ...query } });

      setCurrentStallingId(undefined);
    } else {
      router.push({ query: { ...query, stallingid: id } });
    }
  }

  return (
    <>
      <main className="flex-grow">

        <AppHeader />

        {currentStallingId !== undefined && isSm && (<>
          <Overlay
            title={""}
            onClose={() => { updateStallingId(undefined) }}
          >
            <Parking
              key={'parking-sm-' + currentStallingId}
              parkingID={currentStallingId}
              startInEditMode={'editmode' in router.query}
            />
          </Overlay>
        </>)}

        {currentStallingId !== undefined && !isSm && (<>
          <Modal
            onClose={() => { updateStallingId(undefined) }}
            clickOutsideClosesDialog={false}
          >
            <Parking
              key={'parking-nsm-' + currentStallingId}
              parkingID={currentStallingId}
              startInEditMode={'editmode' in router.query}
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
              onShowStallingDetails={(id: any) => { updateStallingId(id) }}
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
                dispatch(setIsParkingListVisible(!isParkingListVisible));
                // dispatch(setIsFilterBoxVisible(false));
              }}
            >null</IconButton>

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
            >null</IconButton>

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
            fietsenstallingen={fietsenstallingen as CardData[]}
            onShowStallingDetails={(id: any) => { updateStallingId(id) }}
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
