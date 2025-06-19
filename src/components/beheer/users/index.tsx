import React, { useState, useEffect } from 'react';
import { VSUserRoleValuesNew } from '~/types/users';
import { UserEditComponent } from './UserEditComponent';
import { displayInOverlay } from '~/components/Overlay';
import { ConfirmPopover } from '~/components/ConfirmPopover';
import { LoadingSpinner } from '~/components/beheer/common/LoadingSpinner';
import { useUsers } from '~/hooks/useUsers';
import { getNewRoleLabel } from '~/types/utils';
import { Table, type Column } from '~/components/common/Table';
import { SearchFilter } from '~/components/common/SearchFilter';
import { signIn, useSession } from 'next-auth/react';

type UserComponentProps = { 
  siteID: string | null,
  contacts: {ID: string, CompanyName: string}[],
};

const UsersComponent: React.FC<UserComponentProps> = (props) => {
  const roles = Object.values(VSUserRoleValuesNew).map(role => ({
    label: getNewRoleLabel(role),
    value: role.toString()
  }))
  const [id, setId] = useState<string | undefined>(undefined);
  const [deleteAnchorEl, setDeleteAnchorEl] = useState<HTMLElement | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userFilter, setUserFilter] = useState<string | undefined>(undefined);
  const [archivedUserIds, setArchivedUserIds] = useState<string[]>([]);
  const [archivedFilter, setArchivedFilter] = useState<"Yes" | "No" | "Only">("No");

  const { users, isLoading: isLoadingUsers, error: errorUsers, reloadUsers } = useUsers(props.siteID ?? undefined);
  const { data: session } = useSession();

  // Fetch archived users on component mount
  useEffect(() => {
    const fetchArchivedUsers = async () => {
      try {
        const response = await fetch('/api/protected/archive/user/list');
        if (response.ok) {
          const data = await response.json();
          setArchivedUserIds(data.archivedUserIds);
        }
      } catch (error) {
        console.error('Error fetching archived users:', error);
      }
    };
    fetchArchivedUsers();
  }, []);

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

  const handleArchiveToggle = async (userId: string, isCurrentlyArchived: boolean) => {
    try {
      const response = await fetch('/api/protected/archive/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          archived: !isCurrentlyArchived
        })
      });

      if (response.ok) {
        // Update the archivedUserIds state
        if (isCurrentlyArchived) {
          setArchivedUserIds(prev => prev.filter(id => id !== userId));
        } else {
          setArchivedUserIds(prev => [...prev, userId]);
        }
      } else {
        console.error('Failed to update archive status');
      }
    } catch (error) {
      console.error('Error updating archive status:', error);
    }
  };

  const handleLoginAsUser = async (userId: string, userName: string) => {
    if (!userId || !userName) return;

    try {
      // First get the auth token
      const tokenResponse = await fetch(`/api/security/gettoken/${encodeURIComponent(userId)}`);
      
      if (!tokenResponse.ok) {
        console.error("Failed to get token:");
        return;
      }

      const { token } = await tokenResponse.json() as { token: string };

      // Attempt to sign in using the token provider
      await signIn("token-login", {
        userid: userId,
        token,
        redirect: true,
        callbackUrl: "/beheer"
      });
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const filteredusers = users
    .filter((user) => 
      (!userFilter || userFilter === "") || 
      user.DisplayName?.toLowerCase().includes((userFilter || "").toLowerCase()) ||
      user.UserName?.toLowerCase().includes((userFilter || "").toLowerCase())
    )
    .filter((user) => {
      const isArchived = archivedUserIds.includes(user.UserID);
      if (archivedFilter === "Yes") {
        return true;
      } else if (archivedFilter === "Only") {
        return isArchived;
      } else {
        return !isArchived;
      }
    })
    .sort((a, b) => {
      // First sort by Type: Intern first, then Extern
      const aType = a.isOwnOrganization ? 'Intern' : 'Extern';
      const bType = b.isOwnOrganization ? 'Intern' : 'Extern';
      
      if (aType !== bType) {
        return aType === 'Intern' ? -1 : 1;
      }
      
      // Then sort by DisplayName
      return (a.DisplayName || "").localeCompare(b.DisplayName || "");
    });

  const title = "Gebruikers";

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

    const columns: Column<any>[] = [
      // {
      //   header: 'ID',
      //   accessor: 'UserID',
      // },
      {
        header: 'Naam',
        accessor: 'DisplayName',
      },
      {
        header: 'E-mail',
        accessor: 'UserName',
      },
      {
        header: 'Organisatie',
        accessor: (user) => {
          const organizationName = props.contacts.find(contact => contact.ID === user.ownOrganizationID)?.CompanyName || "Onbekende organisatie";
          return organizationName;
        },
      },
      {
        header: 'Rol',
        accessor: (user) => {
          const role = roles.find((r) => r.value === user.securityProfile?.roleId);
          return role?.label || '--';
        },
      },
      {
        header: 'Type',
        accessor: (user) => (
          user.isOwnOrganization ? 'Intern' : 'Extern'
        ),
      },
      {
        header: 'Status',
        accessor: (user) => (
          user.Status === "1" ? (
            <span className="text-green-500">●</span>
          ) : (
            <span className="text-red-500">●</span>
          )
        ),
      },
      ...(session?.user?.mainContactId === "1" ? [{
        header: 'Gearchiveerd',
        accessor: (user: any) => {
          const isArchived = archivedUserIds.includes(user.UserID);
          return (
            <input
              type="checkbox"
              checked={isArchived}
              onChange={() => handleArchiveToggle(user.UserID, isArchived)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          );
        },
      }] : []),
      {
        header: 'Acties',
        accessor: (user) => (
          <>
            <button onClick={() => handleResetPassword(user.UserID)} className="text-blue-500 mx-1 disabled:opacity-40" disabled={true || !user.isOwnOrganization}>🔑</button>
            <button onClick={() => handleEditUser(user.UserID)} className="text-yellow-500 mx-1 disabled:opacity-40">✏️</button>
            {process.env.NODE_ENV === "development" &&
              session?.user?.mainContactId === "1" && (
                <button 
                  onClick={() => handleLoginAsUser(user.UserID, user.UserName || '')} 
                  className="text-orange-500 mx-1" 
                  title="Login als deze gebruiker"
                >
                  👤
                </button>
              )}
            <button 
              onClick={(e) => handleDeleteClick(e, user.UserID)} 
              className="text-red-500 mx-1 disabled:opacity-40" 
              disabled={!user.isOwnOrganization}
            >
              🗑️
            </button>
          </>
        ),
      },
    ];

    const theuser = id && users.find((user) => user.UserID === id);

    return (
      <>
      { id && (
        displayInOverlay(
          <UserEditComponent 
            id={id}      
            siteID={props.siteID}
            onlyAllowRoleChange={theuser && theuser.isOwnOrganization ? false : true}
            onClose={handleUserEditClose} 
            />, false, "Gebruiker bewerken", () => setId(undefined))
      )}
      <div className={`${id!==undefined ? "hidden" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{title}</h1>
          <button 
            onClick={() => setId('new')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Nieuwe gebruiker
          </button>
        </div>

        <div className="mt-4 mb-4 flex items-end gap-4">
          <div className="flex-1">
            <SearchFilter
              id="filterUser"
              label="Gebruiker:"
              value={userFilter || ""}
              onChange={(value) => setUserFilter(value)}
            />
          </div>
          {session?.user?.mainContactId === "1" && (
            <div className="flex-1 max-w-xs">
              <label htmlFor="archivedFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Toon gearchiveerde gebruikers:
              </label>
              <select 
                id="archivedFilter" 
                name="archivedFilter" 
                className="mt-1 p-2 border border-gray-300 rounded-md w-full" 
                value={archivedFilter}
                onChange={(e) => setArchivedFilter(e.target.value as "Yes" | "No" | "Only")}
              >
                <option value="No">Nee (standaard)</option>
                <option value="Yes">Ja</option>
                <option value="Only">Alleen gearchiveerde</option>
              </select>
            </div>
          )}
        </div>

        <Table 
          columns={columns}
          data={filteredusers}
          className="mt-4"
        />

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
