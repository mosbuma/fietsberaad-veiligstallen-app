import React, { useEffect, useState, useRef } from 'react';
import { VSUserRoleValuesNew, VSUserWithRolesNew } from '~/types/users';
import PageTitle from "~/components/PageTitle";
import Button from '@mui/material/Button';
import FormInput from "~/components/Form/FormInput";
import FormSelect from "~/components/Form/FormSelect";
import { UserAccessRight } from './UserAccessRight';
import { getNewRoleLabel } from '~/types/utils';
//import { convertRoleToNewRole } from '~/utils/securitycontext';
import { useUser } from '~/hooks/useUser';
import { makeClientApiCall } from '~/utils/client/api-tools';

import type { SecurityUserValidateResponse } from '~/pages/api/protected/security_users/validate';
import { SecurityUserResponse } from '~/pages/api/protected/security_users/[id]';

import bcrypt from "bcryptjs";

// export type UserType = "gemeente" | "exploitant" | "beheerder" | "interne-gebruiker" | "dataprovider";
export type UserStatus = "actief" | "inactief";

export interface UserEditComponentProps {
    id: string,
    siteID: string | null,
    onClose: (userChanged: boolean, confirmClose: boolean) => void,
}

export const UserEditComponent = (props: UserEditComponentProps) => {
    const { id } = props;
    const [ isEditing, setIsEditing ] = useState<boolean>(true);

    type CurrentState = {
      displayName: string,
      newRoleID: VSUserRoleValuesNew,
      userName: string,
      status: boolean,
      password: string,
      confirmPassword: string,
    }

    console.log("*** UserEditComponent", props);

    const isNew = props.id === "new";

    const [displayName, setDisplayName] = useState<string>('');
    const [newRoleID, setNewRoleID] = useState<VSUserRoleValuesNew>(VSUserRoleValuesNew.None);
    const [userName, setUserName] = useState<string>('');
    const [password, setPassword] = useState<string>(''); 
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [status, setStatus] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [showPasswordFields, setShowPasswordFields] = useState(isNew);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const [errorMessage, setErrorMessage] = useState<string|null>(null);

    const roleOptions = Object.values(VSUserRoleValuesNew).map(role => ({
      label: getNewRoleLabel(role),
      value: role.toString()
    }));

    const [initialData, setInitialData] = useState<CurrentState>({
      displayName: '',
      newRoleID: VSUserRoleValuesNew.None,
      userName: '',
      status: true,
      password: '',
      confirmPassword: '',
    });

    const { user: activeuser, isLoading: isLoadingUser, error: errorUser, reloadUser } = useUser(id);

    useEffect(() => {
      if (isNew) {
        const initial: CurrentState = {
          displayName: '',
          newRoleID: VSUserRoleValuesNew.None,
          userName: '',
          status: true,
          password: '',
          confirmPassword: '',
        };

        setDisplayName(initial.displayName);
        setNewRoleID(initial.newRoleID);
        setUserName(initial.userName);
        setStatus(initial.status);
        setPassword(initial.password);
        setConfirmPassword(initial.confirmPassword);

        setInitialData(initial);
      } else {
        if (activeuser) {
          // const site = user.sites.find(site => site.SiteID === props.currentContactID);
          // const newRoleID = site?.newRoleId || VSUserRoleValuesNew.None;

          const initial = {
            displayName: activeuser.DisplayName || initialData.displayName,
            newRoleID: activeuser.securityProfile?.roleId || initialData.newRoleID,
            userName: activeuser.UserName || initialData.userName,
            status: activeuser.Status === "1",
            password: '',
            confirmPassword: '',
          };

          setDisplayName(initial.displayName);
          setNewRoleID(initial.newRoleID);
          setUserName(initial.userName);
          setStatus(initial.status);

          setInitialData(initial);
        }
      }
    }, [id, activeuser, isNew]);

    useEffect(() => {
      // Focus the name field when the component mounts
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }
    }, []);

    const isDataChanged = (): boolean => {
      if (isNew) {
        return displayName !== "" || userName !== "" || password !== "";
      }
      return (
        displayName !== initialData.displayName ||
        newRoleID !== initialData.newRoleID ||
        userName !== initialData.userName ||
        status !== initialData.status ||
        password !== undefined
      );
    };

    // const hashPassword = (password: string) => {
    //   const salt = bcrypt.genSaltSync(13); // 13 salt rounds used in the coldfusion code
    //   return bcrypt.hashSync(password, salt); 
    // }

    const handleUpdate = async () => {
      if (!displayName || !userName || !newRoleID || !status ) {
        alert("Naam, Gebruikersnaam, Rol en Status zijn verplicht.");
        return;
      }
      // if (!validateData()) {
      //   return;
      // }


      try {
        const data: Partial<VSUserWithRolesNew> = {
          UserID: id,
          DisplayName: displayName,
          // RoleID: newRoleID,
          UserName: userName,
          // EncryptedPassword: password ? hashPassword(password) : undefined,
          // EncryptedPassword2: password ? hashPassword(password) : undefined,
          Status: status ? "1" : "0",
          SiteID: props.siteID,
        }

        const urlValidate = `/api/protected/security_users/validate/`;
        const responseValidate = await makeClientApiCall<SecurityUserValidateResponse>(urlValidate, 'POST', data);
        if(!responseValidate.success) {
          setErrorMessage(`Kan gebruikersdata niet valideren: (${responseValidate.error})`);
          return;
        }

        if (!responseValidate.result.valid) {
          setErrorMessage(responseValidate.result.message);
          return;
        }

        const method = isNew ? 'POST' : 'PUT';
        const url = `/api/protected/security_users/${id}`;

        console.log("*** UserEditComponent handleUpdate", url, method,data);

        const response = await makeClientApiCall<SecurityUserResponse>(url, method, data);
        if(!response.success) {
          setErrorMessage(`Kan gebruikersdata niet opslaan: (${response.error})`);
          return;
        }
  
        if (response.result?.error) {
          console.error("API Error Response:", response.result?.error || 'Onbekende fout bij het opslaan van de gebruiker');
          setErrorMessage('Fout bij het opslaan van de gebruiker');
        }

        // Change the role if it is changed
        if (newRoleID !== initialData.newRoleID) {
          const urlChangeRole = `/api/protected/security_users/${id}/change_role`;
          const responseChangeRole = await makeClientApiCall<SecurityUserResponse>(urlChangeRole, 'POST', { roleId: newRoleID });

          if(!responseChangeRole.success) {
            setErrorMessage(`Kan gebruikersrol niet wijzigen: (${responseChangeRole.error})`);
            return;
          }
    
          if (responseChangeRole.result?.error) {
            console.error("API Error Response:", responseChangeRole.result?.error || 'Onbekende fout bij het opslaan van de gebruiker');
            setErrorMessage('Fout bij het opslaan van de gebruiker');
          }
        }

        // change the password if it is changed
        if(password !== "" && confirmPassword === password) {
          const passwordhash = bcrypt.hash(password, 13);

          const urlChangePassword = `/api/protected/security_users/${id}/password`;
          const responseChangePassword = await makeClientApiCall<SecurityUserResponse>(urlChangePassword, 'POST', { passwordhash: passwordhash });

          if(!responseChangePassword.success) {
            setErrorMessage(`Kan wachtwoord niet wijzigen: (${responseChangePassword.error})`);
            return;
          }

          if (responseChangePassword.result?.error) {
            console.error("API Error Response:", responseChangePassword.result?.error || 'Onbekende fout bij het opslaan van de gebruiker');
            setErrorMessage('Fout bij het opslaan van de gebruiker');
          }
        }

        if (props.onClose) {
          props.onClose(false, false);
        }

        // const oldRoleID = convertNewRoleToOldRole(newRoleID, false);
      } catch (error) {
        setError('Error: ' + error);
      }
    };

    const handleReset = () => {
      if (isNew) {
        setDisplayName('');
        setNewRoleID(VSUserRoleValuesNew.None);
        setUserName('');
        setPassword('');
        setConfirmPassword('');
        setStatus(true);
        setShowPasswordFields(true);
      } else {
        setDisplayName(initialData.displayName);
        setNewRoleID(initialData.newRoleID);
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
      if (!isNew) {
        setShowPasswordFields(true);
      }
    };

    const renderTopBar = () => {
      const title = isNew ? "Nieuwe gebruiker" : "Bewerk gebruiker";
      const allowSave = isDataChanged();

      return (
        <PageTitle className="flex w-full justify-center sm:justify-start">
          <div className="mr-4 hidden sm:block">
            {title}
          </div>
          <Button
            key="b-1"
            className="mt-3 sm:mt-0"
            onClick={handleUpdate}
            disabled={!allowSave}
          >
            Opslaan
          </Button>
          {!isNew && (
            <Button
              key="b-3"
              className="ml-2 mt-3 sm:mt-0"
              onClick={handleReset}
              disabled={!isDataChanged()}
            >
              Herstel
            </Button>
          )}
          {!isEditing && props.onClose && (
            <Button
              key="b-4"
              className="ml-2 mt-3 sm:mt-0"
              onClick={() => props.onClose(false, false)}
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
          {errorMessage && (
            <div className="text-red-600 font-bold mb-4">
              {errorMessage}
            </div>
          )}
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
            value={newRoleID} 
            onChange={(e) => setNewRoleID(e.target.value as VSUserRoleValuesNew)}
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

        {!isNew && (
          <div className="mt-6 w-full h-full">
            <UserAccessRight newRoleID={newRoleID} />
          </div>
        )}
      </div>
    );
  };
