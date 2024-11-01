import { useRouter } from 'next/router';
import React from 'react';

const UsersComponent: React.FC<{ type?: "user" | "exploitant" | "beheerder" }> = ({ type }) => {
  const router = useRouter();
  const { ...query } = router.query;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Users Module</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-semibold">URL Parameters:</h2>
        <pre className="mt-2">{JSON.stringify(query, null, 2)}</pre>
      </div>
    </div>
  );
};

export default UsersComponent;
