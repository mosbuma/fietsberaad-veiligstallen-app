import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { security_roles } from '@prisma/client';
import { VSUserWithRoles } from '~/types';
import { UserEditComponent } from './UserEditComponent';
import { type UserType } from './UserEditComponent';
import { displayInOverlay } from '~/components/Overlay';

type UserComponentProps = { 
  type: UserType, 
  filterGemeente?: string | false,
  users: VSUserWithRoles[],
  roles: security_roles[],
};

const UsersComponent: React.FC<UserComponentProps> = (props) => {
  const router = useRouter();

  const { type, filterGemeente, users, roles } = props;

  const [id, setId] = useState<string | undefined>(undefined);

  const handleResetPassword = (userId: string) => {
    // Placeholder for reset password logic
    console.log(`Reset password for user: ${userId}`);
  };

  const handleEditUser = (userId: string) => {
    setId(userId);
  };

  const handleDeleteUser = (userId: string) => {
    // Placeholder for delete user logic
    console.log(`Delete user: ${userId}`);
  };

  const filteredusers = users && users.filter((user) => {
    console.log("USER GROUP", user.DisplayName, user.GroupID);
    switch(type) {
      case "gemeente":
        return user.GroupID === "extern";
      case "exploitant":
        return user.GroupID === "exploitant";
      case "beheerder":
        return user.GroupID === "beheerder";
      case "interne-gebruiker":
        return user.GroupID === "intern";
      default:
        return false;
    }
  }).sort((a, b) => (a.DisplayName || "").localeCompare(b.DisplayName || "")) || [];

  const renderOverview = () => {
    return (
      <>
      { id && (
        displayInOverlay(<UserEditComponent id={id} type={type} users={users} roles={roles} onClose={() => setId(undefined)} />, false, "Gebruiker bewerken", () => setId(undefined))
      )}
    <div className={`${id!==undefined ? "hidden" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gebruikers{id ? ` - EDITMODE ${id}` : ""}</h1>
          <button 
            onClick={() => setId('nieuw')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe gebruiker
          </button>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Naam</th>
              <th className="py-2">E-mail</th>
              <th className="py-2">Rol</th>
              <th className="py-2"></th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filteredusers.map((user) => { 
              const role = roles && roles.find((r) => r.RoleID === user.RoleID);
              return (
                <tr key={user.UserID}>
                  <td className="border px-4 py-2">{user.DisplayName}</td>
                  <td className="border px-4 py-2">{user.UserName}</td>
                  <td className="border px-4 py-2">{role?.Description || "--"}</td>
                  <td className="border px-4 py-2">
                    {user.Status === "1" ? (
                      <span className="text-green-500">●</span>
                    ) : (
                      <span className="text-red-500">●</span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    <button onClick={() => handleResetPassword(user.UserID)} className="text-blue-500 mx-1 disabled:opacity-40" disabled={true}>🔑</button>
                    <button onClick={() => handleEditUser(user.UserID)} className="text-yellow-500 mx-1 disabled:opacity-40">✏️</button>
                    <button onClick={() => handleDeleteUser(user.UserID)} className="text-red-500 mx-1 disabled:opacity-40" disabled={true}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </>
    );
  };

  return (
    renderOverview()
  );
};

export default UsersComponent;
