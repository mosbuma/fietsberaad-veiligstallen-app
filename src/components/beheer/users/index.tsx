import React, { useState } from 'react';
import { VSUserGroupValues, VSUserRoleValuesNew, VSUserWithRolesNew } from '~/types/users';
import { UserEditComponent } from './UserEditComponent';
import { displayInOverlay } from '~/components/Overlay';
import { ConfirmPopover } from '~/components/ConfirmPopover';
import { LoadingSpinner } from '~/components/beheer/common/LoadingSpinner';
import { useUsersInLijst } from '~/hooks/useUsers';
import { getNewRoleLabel } from '~/types/utils';

type UserComponentProps = { 
  groupid: VSUserGroupValues,
};

const UsersComponent: React.FC<UserComponentProps> = (props) => {
  const roles = Object.values(VSUserRoleValuesNew).map(role => ({
    label: getNewRoleLabel(role),
    value: role.toString()
  }))
  const [id, setId] = useState<string | undefined>(undefined);
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLElement | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const { users, isLoading: isLoadingUsers, error: errorUsers, reloadUsers } = useUsersInLijst();

  const handleResetPassword = (userId: string) => {
    // Placeholder for reset password logic
    console.log(`Reset password for user: ${userId}`);
  };

  const handleEditUser = (userId: string) => {
    setId(userId);
  };

  const handleDeleteClick = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setDeleteAnchorEl(event.currentTarget);
    setUserToDelete(userId);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/protected/security_users/${userToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Refresh the user list
      reloadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Er is een fout opgetreden bij het verwijderen van de gebruiker');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteAnchorEl(null);
    setUserToDelete(null);
  };

  const filteredusers = 
    users && 
    users.sort((a, b) => (a.DisplayName || "").localeCompare(b.DisplayName || "")) || [];

  let title = "Gebruikers";
  // switch (groupid) {
  //   case VSUserGroupValues.Intern:
  //     title = "Interne Gebruikers";
  //     break;
  //   case VSUserGroupValues.Extern:
  //     title = "Externe Gebruikers";
  //     break;
  //   case VSUserGroupValues.Exploitant:
  //     title = "Exploitanten";
  //     break;
  //   case VSUserGroupValues.Beheerder:
  //     title = "Beheerders";
  //     break;
  //   default:
  //     title = "Overige Gebruikers";
  //     break;
  // }

  const handleUserEditClose = (userChanged: boolean, confirmClose: boolean) => {
    if (confirmClose && (confirm('Wil je het bewerkformulier verlaten?')===false)) { 
      return;
    }

    setId(undefined);

    if (userChanged) { reloadUsers(); }
  }

  const renderOverview = () => {
    if (isLoadingUsers) {
      return <LoadingSpinner message="Gebruikers laden" />;
    }

    if (errorUsers) {
      return <div>Error: {errorUsers}</div>;
    }

    return (
      <>
      { id && (
        displayInOverlay(
          <UserEditComponent 
            id={id}      
            onClose={handleUserEditClose} 
            />, false, "Gebruiker bewerken", () => setId(undefined))
      )}
      <div className={`${id!==undefined ? "hidden" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
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
              const role = roles && roles.find((r) => r.value === user.securityProfile?.roleId);
              return (
                <tr key={user.UserID}>
                  <td className="border px-4 py-2">{user.DisplayName}</td>
                  <td className="border px-4 py-2">{user.UserName}</td>
                  <td className="border px-4 py-2">{role?.label || "--"}</td>
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
                    <button 
                      onClick={(e) => handleDeleteClick(e, user.UserID)} 
                      className="text-red-500 mx-1 disabled:opacity-40" 
                      disabled={false}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmPopover
        open={Boolean(deleteAnchorEl)}
        anchorEl={deleteAnchorEl}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Gebruiker verwijderen"
        message="Weet je zeker dat je deze gebruiker wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt."
        confirmText="Verwijderen"
        cancelText="Annuleren"
      />
      </>
    );
  };

  return renderOverview();
};

export default UsersComponent;
