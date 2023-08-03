import { useState } from "react";
import { type NextPage, type GetStaticPaths } from "next";
import Head from "next/head";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "~/server/db";

import { useSelector } from "react-redux";
import { useRouter } from "next/router";

import { api } from "~/utils/api";
import ParkingFacilities from "~/components/ParkingFacilities";
import AppHeaderDesktop from "~/components/AppHeaderDesktop";
import AppBody from "~/components/AppBody";
import ParkingFacilityBrowser from "~/components/ParkingFacilityBrowser";

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps() {
  // console.log("@@ stalling [id].getStaticProps - prisma: ", prisma);

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
        // console.log(
        //   `@@@@ convert ${key} [${typeof prop}] to ${stalling[key]})}`
        // );
      }
      if (prop instanceof BigInt) {
        // console.log(
        //   `@@@@ convert ${key} [${typeof prop}] to ${stalling.toString()})}`
        // );
        stalling[key] = stalling.toString();
      }
      if (prop instanceof Prisma.Decimal) {
        // stalling[key] = stalling.toString();
        delete stalling[key];
      }
    });

    // console.log(typeof stalling.freeHoursReservation);

    delete stalling.reservationCostPerDay;
    delete stalling.wachtlijst_Id;
  });

  return {
    props: { fietsenstallingen: fietsenstallingen },
  };
}

const Stalling: NextPage = ({ fietsenstallingen }: any) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>VeiligStallen</title>
        <meta name="description" content="VeiligStallen" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <main className="flex-grow">
        <AppHeaderDesktop />

        <div
          className="
          l-0
          absolute
          z-10
          p-4
          w-full
        "
          style={{
            top: "64px",
          }}
        >
          <ParkingFacilityBrowser
            fietsenstallingen={fietsenstallingen}
            activeParkingId={router.query.id}
          />
        </div>

        <ParkingFacilities fietsenstallingen={fietsenstallingen} />
      </main>
    </>
  );
};

export default Stalling;
