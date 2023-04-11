import { useState } from "react";
import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { Prisma } from "@prisma/client";

import { api } from "~/utils/api";
import MapboxMap from "~/components/MapComponent";
import SearchBar from "~/components/SearchBar";

// Fetch all posts (in /pages/index.tsx)
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

  return (
    <>

      <Head>
        <title>VeiligStallen</title>
        <meta name="description" content="VeiligStallen" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>

      <main className="
      ">
        {/*AppHeader*/}
        <div className="
          absolute t-0 z-10
        ">
          <div className="
            bg-white
            rounded-full
            px-4
          ">
            <SearchBar />
          </div>
        </div>

        <div className="
          flex min-h-screen flex-col items-center justify-center
        ">
          {mapmode ? (
            <>
              <MapboxMap fietsenstallingen={fietsenstallingen} />
            </>
          ) : (
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
              <h1 className="text-[2rem]">Veiligstallen / Prisma Demo</h1>
              <table className="table-auto">
                {fietsenstallingen.map((x: any) => (
                  <tr className="border">
                    <td className="border-2">{x.Plaats}</td>
                    <td className="border-2">{x.Postcode}</td>
                    <td className="border-2">{x.Title}</td>
                    <td className="border-2">{x.Status}</td>
                    <td className="border-2">{x.Coordinaten}</td>
                  </tr>
                ))}
              </table>
            </div>
          )}
        </div>

      </main>

    </>
  );
};

{
  /* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
<Link
  className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
  href="https://create.t3.gg/en/usage/first-steps"
  target="_blank"
>
  <h3 className="text-2xl font-bold">First Steps →</h3>
  <div className="text-lg">
    Just the basics - Everything you need to know to set up your
    database and authentication.
  </div>
</Link>
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
