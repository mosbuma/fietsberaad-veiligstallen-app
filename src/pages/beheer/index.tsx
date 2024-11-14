import React, { useEffect } from 'react';
import { GetServerSidePropsContext } from 'next';
import { Gemeente } from '../../utils/mock';
import { ReportBikepark } from '../../components/beheer/reports/ReportsFilter';

import BeheerPage, { getServerSideProps as importedGetServerSideProps } from './[activecomponent]/index.tsx';

export const getServerSideProps = async (_props: GetServerSidePropsContext) => {
  return importedGetServerSideProps(_props);
}

const DefaultBeheerPage: React.FC<{gemeentes?: Gemeente[], bikeparks?: ReportBikepark[]}>= ({gemeentes, bikeparks}) => {
  return <BeheerPage gemeentes={gemeentes} bikeparks={bikeparks} />;
};

export default DefaultBeheerPage;
