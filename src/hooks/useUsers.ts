import { useState, useEffect, useRef } from 'react';
import { VSUserWithRolesNew, VSUserInLijstNew } from '~/types/users';
import { SecurityUsersResponse } from '~/pages/api/protected/security_users';

type UsersResponse<T extends VSUserWithRolesNew | VSUserInLijstNew> = {
  data?: T[];
  error?: string;
};

const useUsersBasis = <T extends VSUserWithRolesNew | VSUserInLijstNew>(compact: boolean) => {
  const [users, setUsers] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Type-level check for compact flag
      const response = await fetch(`/api/protected/security_users?compact=${compact}`);
      const result: UsersResponse<T>= await response.json();
      if (result.error) {
        throw new Error(result.error);
      }

      setUsers(result.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      fetchUsers();
    }
  });

  return {
    users,
    isLoading,
    error,
    reloadUsers: () => { fetchUsers(); }
  };
}; 

export const useUsersInLijst = () => useUsersBasis<VSUserInLijstNew>(true);
export const useUsers = () => useUsersBasis<VSUserWithRolesNew>(false);
