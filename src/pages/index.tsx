import { SetStateAction, useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

import ParkingFacilities from "~/components/ParkingFacilities";
import AppHeader from "~/components/AppHeader";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";
import Parking from "~/components/Parking";
import Modal from "src/components/Modal";
import superjson from "superjson";

export async function getStaticProps() {
  try {
    console.log("index.getStaticProps - start");
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

    return {
      props: { fietsenstallingen: fietsenstallingen, online: true },
    };
  } catch (ex: any) {
    console.error("index.getStaticProps - error: ", ex.message);
    return {
      props: { fietsenstallingen: [], online: false },
    };
  }
}

const Home: NextPage = ({ fietsenstallingen, online }: any) => {
  const [currentStallingId, setCurrentStallingId] = useState(undefined);

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
        <AppHeader />

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
        "
          style={{
            top: "64px",
          }}
        >
          <ParkingFacilityBrowser
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
