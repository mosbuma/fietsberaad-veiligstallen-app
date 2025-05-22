import React, { useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import { ReportBikepark } from '../../components/beheer/reports/ReportsFilter';
import { contacts } from '@prisma/client';
import { useSession } from 'next-auth/react';
import BeheerPage, { getServerSideProps as importedGetServerSideProps } from './[activecomponent]/index';

export const getServerSideProps = async (_props: GetServerSidePropsContext) => {
  return importedGetServerSideProps(_props);
}

const DefaultBeheerPage: React.FC<{gemeenten?: contacts[], bikeparks?: ReportBikepark[]}>= ({gemeenten, bikeparks}) => {
  const { data: session } = useSession()

  return <BeheerPage gemeenten={gemeenten} bikeparks={bikeparks} currentUser={session?.user} />;
};

export default DefaultBeheerPage;
