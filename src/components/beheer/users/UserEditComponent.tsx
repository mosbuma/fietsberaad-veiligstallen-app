import React, { useEffect, useState, useRef } from 'react';
import { VSUserGroupValues, VSUserRoleValuesNew, VSUserWithRoles } from '~/types/users';
import { security_roles } from '@prisma/client';
import PageTitle from "~/components/PageTitle";
import Button from '@mui/material/Button';
import FormInput from "~/components/Form/FormInput";
import FormSelect from "~/components/Form/FormSelect";
import { UserAccessRight } from './UserAccessRight';
import { getNewRoleLabel } from '~/types/utils';
import { convertRoleToNewRole } from '~/utils/securitycontext';

const bcrypt = require('bcryptjs');

// export type UserType = "gemeente" | "exploitant" | "beheerder" | "interne-gebruiker" | "dataprovider";
export type UserStatus = "actief" | "inactief";

export interface UserEditComponentProps {
    id: string,
    groupid: VSUserGroupValues,
    users: VSUserWithRoles[],
    onClose: (userChanged: boolean) => void,
    showBackButton?: boolean
}

export const UserEditComponent = (props: UserEditComponentProps) => {
    const isNewUser = props.id === "nieuw";
    const [displayName, setDisplayName] = useState<string>('');
    const [roleID, setRoleID] = useState<VSUserRoleValuesNew>(VSUserRoleValuesNew.None);
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [status, setStatus] = useState<boolean>(true);
    const [isEditing, setIsEditing] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(isNewUser);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const roleOptions = Object.values(VSUserRoleValuesNew).map(role => ({
      label: getNewRoleLabel(role),
      value: role.toString()
    }));

    const [initialData, setInitialData] = useState({
      displayName: '',
      roleID: VSUserRoleValuesNew.None,
      userName: '',
      status: true,
    });

    const { id, users } = props;

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
          const newRoleID = convertRoleToNewRole(user.RoleID, user.security_users_sites.some(site => site.SiteID === props.groupid));

          const initial = {
            displayName: user.DisplayName || '',
            roleID: newRoleID,
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

    useEffect(() => {
      // Focus the name field when the component mounts
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, []);

    const isDataChanged = () => {
      if (isNewUser) {
        return displayName || userName || password || status !== true;
      }
      return (
        displayName !== initialData.displayName ||
        roleID !== initialData.roleID ||
        userName !== initialData.userName ||
        status !== initialData.status ||
        password !== ''
      );
    };

    const isDataValid = () => {
      if (!displayName || !userName) {
        return false;
      }

      // Validate passwords
      if (showPasswordFields) {
        if (!password) {
          return false;
        }
        if (password !== confirmPassword) {
          return false;
        }
      }

      return true;
    };

    const validateData = () => {
      if (!displayName || !userName) {
        setError("Vul alle verplichte velden in");
        return false;
      }

      // Check if email already exists for this gemeente
      if (isNewUser) {
        const existingUser = users.find(u => 
          u.UserName?.toLowerCase() === userName.toLowerCase() && 
          u.security_users_sites.some(site => site.SiteID === props.groupid)
        );
        if (existingUser) {
          setError("Een gebruiker met dit e-mailadres bestaat al voor deze gemeente");
          return false;
        }
      }

      // Validate passwords
      if (showPasswordFields) {
        if (!password) {
          setError("Vul een wachtwoord in");
          return false;
        }
        if (password !== confirmPassword) {
          setError("Wachtwoorden komen niet overeen");
          return false;
        }
      }

      setError(null);
      return true;
    };

    const hashPassword = (password: string) => {
      const salt = bcrypt.genSaltSync(13); // 13 salt rounds used in the coldfusion code
      return bcrypt.hashSync(password, salt); 
    }

    const handleSave = async () => {
      if (!validateData()) {
        return;
      }

      try {
        const method = isNewUser ? 'POST' : 'PUT';
        const url = isNewUser ? '/api/security_users' : `/api/security_users/${id}`;

        // const oldRoleID = convertNewRoleToOldRole(roleID, false);

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            DisplayName: displayName,
            // RoleID: oldRoleID,
            UserName: userName,
            EncryptedPassword: password ? hashPassword(password) : undefined,
            EncryptedPassword2: password ? hashPassword(password) : undefined,
            Status: status ? "1" : "0",
            // security_roles: {
            //   create: {
            //     RoleID: selectedRole?.RoleID || -1,
            //     Role: selectedRole?.Role || "",
            //     Description: selectedRole?.Description || "",
            //   }
            // },
          }),
        });

        if (response.ok) {
          props.onClose(true);
        } else {
          setError('Failed to update user');
        }
      } catch (error) {
        setError('Error: ' + error);
      }
    };

    const handleReset = () => {
      if (isNewUser) {
        setDisplayName('');
        setRoleID(VSUserRoleValuesNew.None);
        setUserName('');
        setPassword('');
        setConfirmPassword('');
        setStatus(true);
        setShowPasswordFields(true);
      } else {
        setDisplayName(initialData.displayName);
        setRoleID(initialData.roleID);
        setUserName(initialData.userName);
        setPassword('');
        setConfirmPassword('');
        setStatus(initialData.status);
        setShowPasswordFields(false);
      }
      setError(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      if (!isNewUser) {
        setShowPasswordFields(true);
      }
    };

    const renderTopBar = () => {
      const title = isNewUser ? "Nieuwe gebruiker" : "Bewerk gebruiker";
      const allowSave = isDataChanged() && isDataValid();

      return (
        <PageTitle className="flex w-full justify-center sm:justify-start">
          <div className="mr-4 hidden sm:block">
            {title}
          </div>
          <Button
            key="b-1"
            className="mt-3 sm:mt-0"
            onClick={handleSave}
            disabled={!allowSave}
          >
            Opslaan
          </Button>
          {!isNewUser && (
            <Button
              key="b-3"
              className="ml-2 mt-3 sm:mt-0"
              onClick={handleReset}
              disabled={!isDataChanged()}
            >
              Herstel
            </Button>
          )}
          {props.showBackButton !== false && (
            <Button
              key="b-4"
              className="ml-2 mt-3 sm:mt-0"
              onClick={() => props.onClose(false)}
            >
              Terug
            </Button>
          )}
        </PageTitle>
      );
    };

    return (
      <div style={{ minHeight: "65vh" }}>
        {renderTopBar()}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="mt-4 w-full">
          <FormInput 
            label="Naam"
            value={displayName} 
            onChange={(e) => setDisplayName(e.target.value)} 
            required 
            disabled={!isEditing}
            autoComplete="off"
            innerRef={nameInputRef}
          />
          <br />
          <FormSelect 
            label="Rol"
            value={roleID} 
            onChange={(e) => setRoleID(e.target.value as VSUserRoleValuesNew)}
            required
            options={roleOptions}
            disabled={!isEditing}
          />
          <br />
          <FormInput 
            label="Gebruikersnaam / e-mail"
            value={userName} 
            onChange={(e) => setUserName(e.target.value)} 
            required 
            type="email"
            disabled={!isEditing}
            autoComplete="new-email"
          />
          <br />
          {showPasswordFields ? (
            <>
              <FormInput 
                label="Wachtwoord"
                value={password} 
                onChange={handlePasswordChange}
                type="password"
                disabled={!isEditing}
                autoComplete="new-password"
              />
              <br />
              <FormInput 
                label="Bevestig wachtwoord"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                disabled={!isEditing}
                autoComplete="new-password"
              />
              <br />
            </>
          ) : (
            <FormInput 
              label="Wachtwoord"
              value="********" 
              onChange={() => {}}
              type="password"
              disabled={true}
              autoComplete="new-password"
            />
          )}
          <br />
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="status" 
                value="1" 
                checked={status} 
                onChange={() => setStatus(true)} 
                disabled={!isEditing}
                className="mr-2"
              />
              Actief
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="status" 
                value="0" 
                checked={!status} 
                onChange={() => setStatus(false)} 
                disabled={!isEditing}
                className="mr-2"
              />
              Niet Actief
            </label>
          </div>
        </div>

        {!isNewUser && (
          <div className="mt-6 w-full h-full">
            <UserAccessRight newRoleID={roleID} />
          </div>
        )}
      </div>
    );
  };
