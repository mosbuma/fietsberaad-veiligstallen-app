import { useRouter } from 'next/router';
import React from 'react';
import WorkInProgressComponent from '../WorkInProgressComponent';


interface ApisComponentProps {
  type: "gekoppelde-locaties" | "overzicht";
}

const ApisComponent: React.FC<ApisComponentProps> = ({ type }) => {
  const router = useRouter();
  const { ...query } = router.query;

  return (
    <WorkInProgressComponent title={`Apis Module [${type==="overzicht" ? "Overzicht" : "Gekoppelde locaties"}]`} />
  );
};

export default ApisComponent;
