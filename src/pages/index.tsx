import { SetStateAction, useState, useEffect } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";
import superjson from "superjson";

// import { setMunicipalities } from "~/store/geoSlice";

import ParkingFacilities from "~/components/ParkingFacilities";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";
import Parking from "~/components/Parking";
import Modal from "src/components/Modal";
import SearchBar from "~/components/SearchBar";
import CardList from "~/components/CardList";

export async function getStaticProps() {
  try {
    console.log("index.getStaticProps - start");
    const fietsenstallingen = await getParkingsFromDatabase();

    return {
      props: {
        fietsenstallingen: fietsenstallingen,
        online: true
      },
    };
  } catch (ex: any) {
    console.error("index.getStaticProps - error: ", ex.message);
    return {
      props: {
        fietsenstallingen: [],
        online: false
      },
    };
  }
}

const getParkingsFromDatabase = async () => {
  const fietsenstallingen = await prisma.fietsenstallingen.findMany({
    where: {
      Plaats: {
        not: "",
      },
    },
    // select: {
    //   StallingsID: true,
    //   Title: true,
    //   Location: true,
    //   Coordinaten: true,
    //   DateCreated: true,
    // },
  });

  fietsenstallingen.forEach((stalling: any) => {
    Object.entries(stalling).forEach(([key, prop]) => {
      if (prop instanceof Date) {
        stalling[key] = new Date(stalling[key]).toISOString();
        // console.log(
        //   `@@@@ convert ${key} [${typeof prop}] to ${stalling[key]})}`
        // );
      }
      if (prop instanceof BigInt) {
        stalling[key] = stalling.toString();
        // console.log(
        //   `@@@@ convert ${key} [${typeof prop}] to ${stalling.toString()})}`
        // );
      }
      if (prop instanceof Prisma.Decimal) {
        // stalling[key] = stalling.toString();
        // console.log(
        //   `@@@@ delete ${key} [${typeof prop}]`
        // );
        delete stalling[key];
      }
    });

    console.log(typeof stalling.freeHoursReservation);

    delete stalling.reservationCostPerDay;
    delete stalling.wachtlijst_Id;
  });

  return fietsenstallingen;
}

// const getMunicipalities = async () => {
//   const municipalities = await prisma.zones.findMany({
//     where: {
//       zone_type: 'municipality'
//     },
//     // select: {
//     //   StallingsID: true,
//     //   Title: true,
//     //   Location: true,
//     //   Coordinaten: true,
//     //   DateCreated: true,
//     // },
//   });

//   municipalities.forEach((x: any) => {
//     Object.entries(x).forEach(([key, prop]) => {
//       if (prop instanceof Date) {
//         x[key] = new Date(x[key]).toISOString();
//       }
//       if (prop instanceof BigInt) {
//         stalling[key] = stalling.toString();
//       }
//       if (prop instanceof Prisma.Decimal) {
//         delete stalling[key];
//       }
//     });
//   });

//   return municipalities;
// }

const Home: NextPage = ({
  fietsenstallingen,
  online
}: any) => {
  const [currentStallingId, setCurrentStallingId] = useState(undefined);

  // On app load: Load municipalities in state
  // useEffect(() => {
  //   (async () => {
  //     const municipalities = await getMunicipalities();
  //     setMunicipalities(municipalities);
  //     console.log('municipalities SET', municipalities)
  //   })();
  // }, [])

  console.log('fietsenstallingen', fietsenstallingen)

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

        {currentStallingId && (
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
        )}

        <div
          className="
            l-0
            absolute
            z-10
            p-4
            w-full
          "
        >

          <div
            data-comment="Spacer - Show only on desktop"
            className="
              hidden sm:block
              w-full h-16
            ">
          </div>

          <div
            data-comment="Parkings list - Show only on desktop"
            className="
              hidden sm:block
            "
          >
            <ParkingFacilityBrowser
              fietsenstallingen={fietsenstallingen}
              onShowStallingDetails={(id: any) =>
                setCurrentStallingId(id)
              }
            />
          </div>

          <div
            data-comment="Mobile topbar - Show only on mobile"
            className="
              flex sm:hidden
            "
          >
            LOGO
            <SearchBar />
            HAMB.
          </div>

        </div>

        <div
          data-comment="Parkings cards - Show only on mobile"
          className="
            block sm:hidden
            absolute
            bottom-9
            z-10
            w-full
          "
        >
          <CardList
            fietsenstallingen={fietsenstallingen}
            onShowStallingDetails={(id: any) =>
              setCurrentStallingId(id)
            }
          />
        </div>

        <ParkingFacilities fietsenstallingen={fietsenstallingen} />

      </main>
    </>
  );
};

export default Home;
