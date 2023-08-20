import React from "react";
import { useRouter } from 'next/router'

const MunicipalityPage: React.FC = () => {
  const router = useRouter()
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-blue-500 text-xl font-bold text-white">
      VEILIGSTALLEN.NL SUB {router.query.municipalityName} {router.query.pageName}
    </div>
  );
};

export default MunicipalityPage;
