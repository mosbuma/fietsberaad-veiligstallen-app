import React from "react";
import Head from "next/head";
import Content from '../content';
import { type Session } from "next-auth";
import { getServerSession } from "next-auth/next"
import { authOptions } from '~/pages/api/auth/[...nextauth]'
import { GetServerSideProps } from 'next';

import { getParkingsFromDatabase } from "~/utils/prisma";

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const session = await getServerSession(context.req, context.res, authOptions) as Session;
    const sites = session?.user?.sites || [];
    const fietsenstallingen = await getParkingsFromDatabase(sites);

    return {
      props: {
        fietsenstallingen: fietsenstallingen,
      },
    };
  } catch (ex: any) {
    // console.error("index.getStaticProps - error: ", ex.message);
    return {
      props: {
        fietsenstallingen: [],
      },
    };
  }
};

export default Content;
