import React from 'react';
import { GetServerSidePropsContext } from 'next';

import BeheerPage, { getServerSideProps as externalServerSideProps, BeheerPageProps } from './[id]';

export const getServerSideProps = async (props: GetServerSidePropsContext) => {
  return externalServerSideProps(props);
}

const BeheerPageDefault: React.FC<BeheerPageProps> = ({ gemeentes, bikeparks, users, roles}) => {
  return <BeheerPage gemeentes={gemeentes} bikeparks={bikeparks} users={users} roles={roles} />;
};

export default BeheerPageDefault;
