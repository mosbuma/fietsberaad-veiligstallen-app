import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { security_roles } from '@prisma/client';
import { VSUserWithRoles } from '~/types';
export type UserType = "gebruiker" | "exploitant" | "beheerder" | "interne-gebruiker";
export type UserStatus = "actief" | "inactief";

type UserComponentProps = { 
  type: UserType, 
  filterGemeente?: string | false,
  users: VSUserWithRoles[],
  roles: security_roles[],
  id?: string
};

const UsersComponent: React.FC<UserComponentProps> = (props) => {
  const router = useRouter();

  const { type, filterGemeente, users, roles, id } = props;

  const handleResetPassword = (userId: string) => {
    // Placeholder for reset password logic
    console.log(`Reset password for user: ${userId}`);
  };

  const handleEditUser = (userId: string) => {
    router.push(getTarget(userId));
  };

  const handleDeleteUser = (userId: string) => {
    // Placeholder for delete user logic
    console.log(`Delete user: ${userId}`);
  };

  const filteredusers = users && users.filter((user) => {
    console.log("USER GROUP", user.DisplayName, user.GroupID);
    switch(type) {
      case "gebruiker":
        return user.GroupID === "intern" || user.GroupID === "extern";
      case "exploitant":
        return user.GroupID === "exploitant";
      case "beheerder":
        return user.GroupID === "beheerder";
      default:
        return false;
    }
  }) || [];

  const renderOverview = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Gebruikers{id ? ` - EDITMODE ${id}` : ""}</h1>
          <button 
            onClick={() => router.push(getTarget('nieuw'))}
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
                  <td className="border px-4 py-2">{user.UserName}</td>
                  <td className="border px-4 py-2">{user.DisplayName}</td>
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
    );
  };

  const getTarget = (id?: string) => {
    let target = "/beheer/users-beheerders";
    switch(type) {
      case "gebruiker":
        target = "/beheer/users-gebruikersbeheer";
        break;
      case "exploitant":
        target = "/beheer/users-exploitanten";
        break;
      default:
        break;
    }
    if(id) {
      target += `/${id}`;
    }
    return target;
  }

  const renderEditMode = () => {
    const isNewUser = id === "nieuw";
    const [displayName, setDisplayName] = useState('');
    const [roleID, setRoleID] = useState('');
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState(false);

    const [initialData, setInitialData] = useState({
      displayName: '',
      roleID: '',
      userName: '',
      status: false,
    });

    useEffect(() => {
      if (!isNewUser) {
        const user = users.find(u => u.UserID === id);
        if (user) {
          const initial = {
            displayName: user.DisplayName || '',
            roleID: user.RoleID?.toString() || "1" ,
            userName: user.UserName || '',
            status: user.Status === "1",
          };
          setDisplayName(initial.displayName);
          setRoleID(initial.roleID);
          setUserName(initial.userName);
          setStatus(initial.status);
          setInitialData(initial);
        }
      }
    }, [id, users, isNewUser]);

    const isDataChanged = () => {
      if (isNewUser) {
        return displayName || roleID || userName || password || status;
      }
      return (
        displayName !== initialData.displayName ||
        roleID !== initialData.roleID ||
        userName !== initialData.userName ||
        status !== initialData.status ||
        password !== ''
      );
    };

    const hashPassword = (password: string) => {
      // TODO: implement BCRYPT hashing
      
      return "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; 
       
    }

    const handleSave = async () => {
      if (!displayName || !userName) {
        alert("Naam and Gebruikersnaam / e-mail cannot be empty.");
        return;
      }

      try {
        const method = isNewUser ? 'POST' : 'PUT';
        const url = isNewUser ? '/api/users' : `/api/users/${id}`;
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            displayName,
            roleID,
            userName,
            password: password ? hashPassword(password) : undefined,
            status: status ? "1" : "0",
          }),
        });

        if (response.ok) {
          router.push(getTarget());
        } else {
          console.error('Failed to update user');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const handleReset = () => {
      if (isNewUser) {
        setDisplayName('');
        setRoleID('');
        setUserName('');
        setPassword('');
        setStatus(false);
      } else {
        setDisplayName(initialData.displayName);
        setRoleID(initialData.roleID);
        setUserName(initialData.userName);
        setPassword('');
        setStatus(initialData.status);
      }
    };

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{id==="nieuw" ? "Nieuwe gebruiker" : "Bewerk gebruiker"}</h1>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2" colSpan={2}>Gebruikersgegevens bewerken</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Naam:</td>
              <td className="border px-4 py-2">
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  required 
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Rol:</td>
              <td className="border px-4 py-2">
                <select 
                  value={roleID} 
                  onChange={(e) => setRoleID(e.target.value)}
                >
                  {roles.map(role => (
                    <option key={role.RoleID} value={role.RoleID}>
                      {role.Description}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Gebruikersnaam / e-mail:</td>
              <td className="border px-4 py-2">
                <input 
                  type="email" 
                  value={userName} 
                  onChange={(e) => setUserName(e.target.value)} 
                  required 
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Wachtwoord:</td>
              <td className="border px-4 py-2">
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Status:</td>
              <td className="border px-4 py-2">
                <label>
                  <input 
                    type="radio" 
                    name="status" 
                    value="1" 
                    checked={status} 
                    onChange={() => setStatus(true)} 
                  />
                  Actief
                </label>
                <label className="ml-4">
                  <input 
                    type="radio" 
                    name="status" 
                    value="0" 
                    checked={!status} 
                    onChange={() => setStatus(false)} 
                  />
                  Niet Actief
                </label>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4">
          <button 
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 ${!isDataChanged() ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSave}
            disabled={!isDataChanged()}
          >
            Opslaan
          </button>
          <button 
            className={`bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mr-2 ${!isDataChanged() ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleReset}
            disabled={!isDataChanged()}
          >
            Herstel
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => router.push(getTarget())}
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  };

  return (
    id ? renderEditMode() : renderOverview()
  );
};

export default UsersComponent;
