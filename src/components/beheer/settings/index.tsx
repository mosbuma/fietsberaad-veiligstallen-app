import { useRouter } from 'next/router';
import React from 'react';
import WorkInProgressComponent from '../WorkInProgressComponent';
const SettingsComponent: React.FC = () => {
  const router = useRouter();
  const { ...query } = router.query;

  return (
    <WorkInProgressComponent title="Instellingen" />
  );
};

export default SettingsComponent;
