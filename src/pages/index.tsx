import { SetStateAction, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { type NextPage } from "next";
import Head from "next/head";
import superjson from "superjson";

// import { setMunicipalities } from "~/store/geoSlice";

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
import { IconButton } from "~/components/Button";

import { getParkingsFromDatabase } from "~/utils/prisma";

export async function getStaticProps() {
  try {
    // console.log("index.getStaticProps - start");
    const fietsenstallingen = await getParkingsFromDatabase();
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

const Home: NextPage = ({ fietsenstallingen, online }: any) => {
  const [currentStallingId, setCurrentStallingId] = useState(undefined);

  // On app load: Load municipalities in state
  // useEffect(() => {
  //   (async () => {
  //     const municipalities = await getMunicipalities();
  //     setMunicipalities(municipalities);
  //     console.log('municipalities SET', municipalities)
  //   })();
  // }, [])

  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  // console.log("fietsenstallingen", fietsenstallingen);

  const currentStalling = fietsenstallingen.find((stalling: any) => {
    return stalling.ID === currentStallingId;
  });

  const isSm = typeof window !== "undefined" && window.innerWidth < 640;
  const isLg = typeof window !== "undefined" && window.innerWidth < 768;

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

  //console.log(fietsenstallingen);

  return (
    <>
      <Head>
        <title>VeiligStallen</title>
        <meta name="description" content="VeiligStallen" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <main className="flex-grow">
        <div data-comment="Show only on desktop" className="hidden sm:flex">
          <AppHeaderDesktop />
        </div>

        {currentStallingId && isSm && (<>
          <Overlay
            title={currentStalling.Title}
            onClose={() => setCurrentStallingId(undefined)}
          >
            <Parking
              key={currentStallingId}
              parkingdata={currentStalling}
            />
          </Overlay>
        </>)}

        {currentStallingId && ! isSm && (<>
          <Modal
            onClose={() => setCurrentStallingId(undefined)}
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
          className="
            l-0
            absolute
            z-10
            w-full
            p-4
            sm:w-auto
          "
        >
          <div
            data-comment="Spacer - Show only on desktop"
            className="
              hidden h-16
              w-full sm:block
            "
          ></div>

          <div
            data-comment="Parkings list - Show only on desktop"
            className="
              hidden sm:inline-block
            "
          >
            <ParkingFacilityBrowser
              fietsenstallingen={fietsenstallingen}
              onShowStallingDetails={(id: any) => setCurrentStallingId(id)}
            />
          </div>

          <div
            data-comment="Mobile topbar - Show only on mobile"
            className="
              flex sm:hidden
            "
          >
            <Logo />
            <SearchBar />
            {/*HAMB.*/}
          </div>
        </div>

        <div
          data-comment="Floating buttons: Filter & Toggle buttons"
          className="
            absolute bottom-56
            z-10
            block
            w-full
            sm:hidden
          "
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
              className="mb-5"
              iconUrl={
                "https://cdn3.iconfinder.com/data/icons/feather-5/24/list-256.png"
              }
            ></IconButton>

            <IconButton
              className="mb-0"
              iconUrl={
                "https://cdn2.iconfinder.com/data/icons/user-interface-line-38/24/Untitled-5-21-256.png"
              }
            ></IconButton>
          </div>
        </div>

        <div
          data-comment="Filter overlay - Show only on mobile"
          className="
            absolute bottom-0
            z-10
            block
            w-full
            sm:hidden
          "
        ></div>

        <div
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
            onShowStallingDetails={(id: any) => setCurrentStallingId(id)}
          />
        </div>

        <ParkingFacilities fietsenstallingen={fietsenstallingen} />
      </main>
    </>
  );
};

export default Home;
