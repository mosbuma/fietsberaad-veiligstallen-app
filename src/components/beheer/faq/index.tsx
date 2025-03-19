import { useRouter } from 'next/router';
import React from 'react';
import WorkInProgressComponent from '../WorkInProgressComponent';

const FaqComponent: React.FC = () => {
  const router = useRouter();
  const { ...query } = router.query;

  return (
    <WorkInProgressComponent title="Faq Module" />
  );
};

export default FaqComponent;
