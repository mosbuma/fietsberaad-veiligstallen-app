import React from 'react';
import { GetServerSidePropsContext } from 'next';

import BeheerPage, { getServerSideProps as externalServerSideProps, BeheerPageProps } from './[id]';

export const getServerSideProps = async (props: GetServerSidePropsContext) => {
  return externalServerSideProps(props);
};

const BeheerPageDefault: React.FC<BeheerPageProps> = props => {
  return <BeheerPage {...props} />;
};

export default BeheerPageDefault;
