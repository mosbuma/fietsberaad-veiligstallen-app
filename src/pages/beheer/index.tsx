import React, { useEffect } from 'react';
import { type GetServerSidePropsContext } from 'next';
import { type ReportBikepark } from '../../components/beheer/reports/ReportsFilter';
import { type contacts } from '@prisma/client';
import { useSession } from 'next-auth/react';
import BeheerPage, { getServerSideProps as importedGetServerSideProps } from './[activecomponent]/index';

export const getServerSideProps = async (_props: GetServerSidePropsContext) => {
  return importedGetServerSideProps(_props);
}

const DefaultBeheerPage: React.FC<{gemeenten?: contacts[], bikeparks?: ReportBikepark[]}>= () => {
  const { data: session } = useSession()

  return <BeheerPage currentUser={session?.user} />;
};

export default DefaultBeheerPage;
