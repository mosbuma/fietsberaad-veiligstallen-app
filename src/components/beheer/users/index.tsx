import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export type UserType = "gebruiker" | "exploitant" | "beheerder";
export type User = {
  id: string;
  displayName: string;
  email: string;
};

const UsersComponent: React.FC<{ type: UserType, filterGemeente?: string | false }> = ({ type, filterGemeente = false }) => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: 'New User',
          email: 'newuser@example.com',
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers((prevUsers) => [...prevUsers, newUser]);
      } else {
        console.error('Failed to create user');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>
              {user.displayName} ({user.email})
            </Link>
          </li>
        ))}
      </ul>
      <div 
        onClick={handleCreateUser} 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
      >
        Create New User
      </div>
    </div>
  );
};

export default UsersComponent;
