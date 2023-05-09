import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { useSelector } from "react-redux";

import { api } from "~/utils/api";
// import ParkingFacilities from "~/pages/parking-facilities";
import MapboxMap from "~/components/MapComponent";
import AppHeader from "~/components/AppHeader";
import ParkingFacilityBlock from "~/components/ParkingFacilityBlock";
import CardList from "~/components/CardList";
import { CardData } from "~/components/Card";
import SearchBar from "~/components/SearchBar";
import FilterBox from "~/components/FilterBox";

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
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const [mapmode, setMapmode] = useState(true);
  const activeTypes = useSelector(
    (state: AppState) => state.filter.activeTypes
  );

  const toggleParkingFacilitiesView = () => setMapmode(!mapmode);
  const resetFilter = () => {};

  const [isFilterBoxOpen, setIsFilterBoxOpen] = useState<boolean>(true);
  const toggleFilterBox = () => setIsFilterBoxOpen(!isFilterBoxOpen);

  const cards: CardData[] = fietsenstallingen.map((x: any, idx: number) => {
    return {
      ID: x.ID,
      title: x.Title,
      description: x.Description,
    };
  });

  console.log(
    "@@@@ activeTypes",
    JSON.stringify(
      fietsenstallingen.map((x) => ({
        n: x.Title,
        t: x.Type,
        a: activeTypes,
        r: activeTypes.indexOf(x.Type) > -1,
      })),
      null,
      2
    )
  );

  return (
    <>
      <Head>
        <title>VeiligStallen</title>
        <meta name="description" content="VeiligStallen" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <main className="flex-grow">
        <AppHeader>
          <div
            className="
            bg-whitecontains
            h-10
            flex-1
            rounded-full
            px-5
            py-0
            shadow-lg  
          "
          >
            <SearchBar />
          </div>
        </AppHeader>

        <div data-name="parking-facilities">
          <div
            className="
            flex flex min-h-screen flex-col items-center justify-center
          "
          >
            {mapmode ? (
              <>
                <MapboxMap
                  fietsenstallingen={fietsenstallingen.filter(
                    (x) => activeTypes.indexOf(x.Type) > -1
                  )}
                />
              </>
            ) : (
              <div className="mx-5 pt-24">
                {fietsenstallingen
                  .filter((x) => activeTypes.indexOf(x.Type) > -1)
                  .map((x: any) => {
                    return <ParkingFacilityBlock key={x.title} parking={x} />;
                  })}
              </div>
            )}
          </div>

          <div style={{ position: "relative" }}>
            <div
              className="l-0 b-20 r-0 h-max-40 absolute"
              style={{
                position: "absolute",
                bottom: "10vh",
                left: 0,
                right: 0,
                maxHeight: "10vh",
              }}
            >
              <CardList cards={cards} />
            </div>
          </div>
          <div
            className="
            fixed
            bottom-5
            right-5
            rounded-full
            bg-white
            p-4
          "
            onClick={toggleParkingFacilitiesView}
          >
            MAPLIST
          </div>
          {isFilterBoxOpen && (
            <FilterBox onReset={resetFilter} onClose={toggleFilterBox} />
          )}
        </div>
      </main>
    </>
  );
};

{
  /* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
<LinkObject.keys(
  className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
  href="https://create.t3.gg/en/usage/first-steps"
  target="_blank"
>
  <h3 className="text-2xl font-bold">First Steps →</h3>
  <div className="text-lg">
    Just the basics - Everything you need to know to set up your
    database and authentication.
  </div>
</LinkObject.keys>
<Link
  className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
  href="https://create.t3.gg/en/introduction"
  target="_blank"
>
  <h3 className="text-2xl font-bold">Documentation →</h3>
  <div className="text-lg">
    Learn more about Create T3 App, the libraries it uses, and how
    to deploy it.
  </div>
</Link>
</div>
<p className="text-2xl text-white">
{hello.data ? hello.data.greeting : "Loading tRPC query..."}
</p> */
}

export default Home;
