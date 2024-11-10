import { useRouter } from 'next/router';
import React from 'react';

// Define the props type
interface ApisComponentProps {
  type: "gekoppelde-locaties" | "overzicht";
}

const ApisComponent: React.FC<ApisComponentProps> = ({ type }) => {
  const router = useRouter();
  const { ...query } = router.query;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Apis Module</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold">Query Parameters:</h2>
        <pre className="mt-2">{JSON.stringify(query, null, 2)}</pre>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold">Type:</h2>
        <pre className="mt-2">{type}</pre>
      </div>
    </div>
  );
};

export default ApisComponent;
