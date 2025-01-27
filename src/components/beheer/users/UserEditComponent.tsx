import React, { useEffect, useState } from 'react';
import { VSUserWithRoles } from '~/types';
import { security_roles } from '@prisma/client';

const bcrypt = require('bcryptjs');

export type UserType = "gemeente" | "exploitant" | "beheerder" | "interne-gebruiker";
export type UserStatus = "actief" | "inactief";

export interface UserEditComponentProps {
    id: string,
    type: UserType,
    users: VSUserWithRoles[],
    roles: security_roles[],
    onClose: () => void
}

export const UserEditComponent = (props: UserEditComponentProps) => {
    const isNewUser = props.id === "nieuw";
    const [displayName, setDisplayName] = useState<string>('');
    const [roleID, setRoleID] = useState<number>(-1);
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [status, setStatus] = useState<boolean>(false);

    const [initialData, setInitialData] = useState({
      displayName: '',
      roleID: 1,
      userName: '',
      status: false,
    });

    const { id, users, roles } = props; // type, 

    let availableRoles = []; // TODO: limit user roles based on type
    // switch(type) {
    //   case "gemeente": // extern
    //     availableRoles = ['extern_admin', 'extern_editor', 'data_analyst'];
    //     break;
    //   case "exploitant": // intern
    //     availableRoles = ['exploitant', 'data_analyst'];
    //     break;
    //   case "": // beheerder
    //     availableRoles = ['beheerder'];
    //     break;
    //   default:
    //     availableRoles = ['intern_admin', 'intern_editor', 'data_analyst', 'exploitant', 'data_analyst', 'beheerder'];
    //     break;
    // }

    // switch(data.RoleID) {
    //   case 1: // root
    //   case 2: // intern_admin
    //   case 3: // intern_editor
    //   case 9: // data_analyst (intern)
    //     data.GroupID = "intern";
    //     break;
    //   case 4: // extern_admin
    //   case 5: // extern_editor
    //   case 10: // data_analyst (extern)
    //     data.GroupID = "extern";
    //     break;
    //   case 6: // exploitant
    //   case 8: // data_analyst (exploitant)
    //     data.GroupID = "exploitant";
    //     break;
    //   case 7: //beheerder
    //     data.GroupID = "beheerder";
    //     break;
    //   default:
    //     console.error("### create error - invalid RoleID");
    //     throw new Error("Create failed");
    //     break;
    // }

    useEffect(() => {
      if (!isNewUser) {
        const user = users.find(u => u.UserID === id);
        if (user) {
          const initial = {
            displayName: user.DisplayName || '',
            roleID: user.RoleID || -1 ,
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
      const salt = bcrypt.genSaltSync(13); // 13 salt rounds used in the coldfusion code
      return bcrypt.hashSync(password, salt); 
    }

    const handleSave = async () => {
      if (!displayName || !userName) {
        alert("Naam and Gebruikersnaam / e-mail cannot be empty.");
        return;
      }

      try {
        const method = isNewUser ? 'POST' : 'PUT';
        const url = isNewUser ? '/api/security_users' : `/api/security_users/${id}`;
        const selectedRole = roles.find(r => r.RoleID === roleID);
        if(!selectedRole) {
          alert("Selecteer een rol" + roleID);
          return;
        }
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            DisplayName: displayName,
            RoleID: selectedRole.RoleID,
            UserName: userName,
            EncryptedPassword: password ? hashPassword(password) : undefined,
            EncryptedPassword2: password ? hashPassword(password) : undefined,
            Status: status ? "1" : "0",
            security_roles: {
              create: {
                RoleID: selectedRole?.RoleID || -1,
                Role: selectedRole?.Role || "",
                Description: selectedRole?.Description || "",
              }
            },
          }),
        });

        if (response.ok) {
          props.onClose();
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
        setRoleID(-1);
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

    const rolesWithGeenRol = [
      { RoleID: -1, Description: "Selecteer een rol" },
      ...roles
    ];

    return (
      <div>
        <h1 className="text-2xl font-bold mb-4">{id==="nieuw" ? "Nieuwe gebruiker" : "Bewerk gebruiker"}</h1>
        <table className="min-w-full bg-white border-2">
          <tbody>
            <tr>
              <td className="border px-4 py-2 w-1/4">Naam:</td>
              <td className="border px-4 py-2 w-3/4">
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  required 
                  className="w-full"
                />
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Rol:</td>
              <td className="border px-4 py-2">
                <select 
                  value={roleID} 
                  onChange={(e) => setRoleID(parseInt(e.target.value))}
                >
                  {rolesWithGeenRol.map(role => (
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
                  className="w-full"
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
        </div>
      </div>
    );
  };
