import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { security_roles } from '@prisma/client';
import { VSUserGroupValues, VSUserWithRoles } from '~/types/users';
import { UserEditComponent } from './UserEditComponent';
import { displayInOverlay } from '~/components/Overlay';
import { SecurityUsersResponse } from '~/pages/api/protected/security_users';
import { ConfirmPopover } from '~/components/ConfirmPopover';
import { LoadingSpinner } from '~/components/beheer/common/LoadingSpinner';

type UserComponentProps = { 
  groupid: VSUserGroupValues,
  roles: security_roles[],
};

const UsersComponent: React.FC<UserComponentProps> = (props) => {
  const { groupid, roles } = props;
  const [id, setId] = useState<string | undefined>(undefined);
  const [users, setUsers] = useState<VSUserWithRoles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updateCounter, setUpdateCounter] = useState(0);
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLElement | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/protected/security_users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const responseData = await response.json() as SecurityUsersResponse;
        if(!responseData.error) {
          setUsers(responseData.data || []);
        } else {
          console.error('Error fetching users:', responseData.error);
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [updateCounter]);

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
      setUpdateCounter(prev => prev + 1);
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
    users.filter((user) => (user.GroupID === groupid))
      .sort((a, b) => (a.DisplayName || "").localeCompare(b.DisplayName || "")) || [];

  let title = "";
  switch (groupid) {
    case VSUserGroupValues.Intern:
      title = "Interne Gebruikers";
      break;
    case VSUserGroupValues.Extern:
      title = "Externe Gebruikers";
      break;
    case VSUserGroupValues.Exploitant:
      title = "Exploitanten";
      break;
    case VSUserGroupValues.Beheerder:
      title = "Beheerders";
      break;
    default:
      title = "Overige Gebruikers";
      break;
  }

  const handleUserEditClose = (userChanged: boolean) => {
    if (userChanged) {
      setUpdateCounter(prev => prev + 1);
    }
    setId(undefined);
  }

  const renderOverview = () => {
    if (isLoading) {
      return <LoadingSpinner message="Gebruikers laden..." />;
    }

    return (
      <>
      { id && (
        displayInOverlay(
          <UserEditComponent 
            id={id} 
            groupid={groupid} 
            users={users} 
            onClose={handleUserEditClose} 
            showBackButton={false}/>, false, "Gebruiker bewerken", () => setId(undefined))
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
