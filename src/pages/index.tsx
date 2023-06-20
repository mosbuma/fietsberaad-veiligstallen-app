import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { useSelector } from "react-redux";

import { api } from "~/utils/api";
import ParkingFacilities from "~/components/ParkingFacilities";
import AppHeader from "~/components/AppHeader";
import AppBody from "~/components/AppBody";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";

export async function getStaticProps() {
  const { PrismaClient } = require("@prisma/client");
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

  fietsenstallingen.forEach((stalling: any) => {
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

        <div className="
          absolute
          l-0
          z-10
          p-4
        " style={{
          top: '64px',
        }}>
          <ParkingFacilityBrowser
            fietsenstallingen={fietsenstallingen}
          />
        </div>

        <ParkingFacilities fietsenstallingen={fietsenstallingen} />
        
      </main>
    </>
  );
};

export default Home;
