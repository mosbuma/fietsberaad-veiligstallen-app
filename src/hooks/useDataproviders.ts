import { useState, useEffect } from 'react';
import type { VSContactDataprovider } from '~/types/contacts';

type DataprovidersResponse = {
  data?: VSContactDataprovider[];
  error?: string;
};

export const useDataproviders = () => {
  const [dataproviders, setDataproviders] = useState<VSContactDataprovider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const fetchDataproviders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/protected/dataprovider');
      const result: DataprovidersResponse = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      setDataproviders(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching dataproviders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataproviders();
  }, [version]);

  return {
    dataproviders,
    isLoading,
    error,
    reloadDataproviders: () => setVersion(v => v + 1)
  };
}; 