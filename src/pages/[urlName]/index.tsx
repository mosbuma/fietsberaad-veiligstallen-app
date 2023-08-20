import React from "react";
import Head from "next/head";
import Home from '../index';

import { getParkingsFromDatabase } from "~/utils/prisma";

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking' //indicates the type of fallback
  }
}

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

export default Home;
