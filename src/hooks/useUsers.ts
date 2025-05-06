import { useState, useEffect } from 'react';
import { VSUserWithRolesNew } from '~/types/users';
import { SecurityUsersResponse } from '~/pages/api/protected/security_users';

export const useUsers = () => {
  const [users, setUsers] = useState<VSUserWithRolesNew[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/protected/security_users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data: SecurityUsersResponse = await response.json();
      if (data.data) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [version]);

  return {
    users,
    isLoading,
    error,
    reloadUsers: () => setVersion(v => v + 1)
  };
}; 