/* This page is used to redirect the user for old style NS links 
   in the format https://www.veiligstallen.nl/ns/stallingen/[id] */

import { getParkingsFromDatabase } from "~/utils/prisma";
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {

  const id = context.query?.id || false;
  if (!id) {
    // redirect to /, no id given;
    return {
      redirect: {
        destination: `/`,
        permanent: true,
      },
    };
  }

  const stallingen = await getParkingsFromDatabase([], null);
  // convert NS stalling code to internal ID 
  const newstallingen = stallingen.filter((stalling) => stalling.StallingsID == id);
  if (newstallingen.length === 1 && newstallingen[0] !== undefined) {
    // redirect to / for given stalling ID
    return {
      redirect: {
        destination: `/?stallingid=${newstallingen[0].ID}`,
        permanent: false,
      },
    };
  } else {
    // redirect to /, stalling not found
    return {
      redirect: {
        destination: `/`,
        permanent: true,
      },
    };
  }
};

const RedirectPage = () => {
  return null;
};

export default RedirectPage;