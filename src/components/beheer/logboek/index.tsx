import { useRouter } from 'next/router';
import React from 'react';
import WorkInProgressComponent from '../WorkInProgressComponent';

const LogboekComponent: React.FC = () => {
  const router = useRouter();
  const { ...query } = router.query;

  return (
        <WorkInProgressComponent title="Logboek Module" />
  );
};

export default LogboekComponent;
