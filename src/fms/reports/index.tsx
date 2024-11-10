import { useRouter } from 'next/router';
import React, { useState } from "react";
import { mockUser, mockCouncil, mockExploitant } from '../../utils/mock';

const ReportsPage: React.FC = () => {
  const router = useRouter();
  const { ...query } = router.query;

  return (
    <div className="p-6">
      {/* <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold">Query Parameters:</h2>
        <pre className="mt-2">{JSON.stringify(query, null, 2)}</pre>
      </div> */}
      <h1 className="text-3xl font-bold mb-4">Reports Module</h1>
    </div>
  );
};

export default ReportsPage;



