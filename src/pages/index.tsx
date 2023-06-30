import { type NextPage } from "next";
import Head from "next/head";
import { Prisma } from "@prisma/client";

import ParkingFacilities from "~/components/ParkingFacilities";
import AppHeader from "~/components/AppHeader";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";

import { PrismaClient } from "@prisma/client";

export async function getStaticProps() {
  const prisma = new PrismaClient();

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

  fietsenstallingen.forEach((stalling) => {
    Object.entries(stalling).forEach(([key, prop]) => {
      if (prop instanceof Date) {
        stalling[key] = stalling.toString();
        console.log(
          `@@@@ convert ${key} [${typeof prop}] to ${stalling[key]})}`
        );
      }
      if (prop instanceof BigInt) {
        console.log(
          `@@@@ convert ${key} [${typeof prop}] to ${stalling.toString()})}`
        );
        stalling[key] = stalling.toString();
      }
      if (prop instanceof Prisma.Decimal) {
        // stalling[key] = stalling.toString();
        delete stalling[key];
      }
    });

    console.log(typeof stalling.freeHoursReservation);

    delete stalling.reservationCostPerDay;
    delete stalling.wachtlijst_Id;
  });

  return {
    props: { fietsenstallingen: fietsenstallingen },
  };
}

const Home: NextPage = ({ fietsenstallingen }: any) => {
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
          <ParkingFacilityBrowser fietsenstallingen={fietsenstallingen} />
        </div>

        <ParkingFacilities fietsenstallingen={fietsenstallingen} />
      </main>
    </>
  );
};

export default Home;
