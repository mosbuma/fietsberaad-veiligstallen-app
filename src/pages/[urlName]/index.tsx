import React from "react";
import Head from "next/head";
import Home from '../index';
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'

import { getParkingsFromDatabase } from "~/utils/prisma";

export async function getServerSideProps(context) {
  try {
    const session = await getServerSession(context.req, context.res, authOptions)
    const sites = session?.user?.sites || [];
    const fietsenstallingen = await getParkingsFromDatabase(sites);

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

export default Home;
