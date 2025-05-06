import { useState, useEffect } from 'react';
import type { VSContactGemeenteInLijst, VSContactGemeente } from '~/types/contacts';

type GemeentenResponse<T extends VSContactGemeenteInLijst | VSContactGemeente> = {
  data?: T[];
  error?: string;
};

const useGemeentenBasis = <T extends VSContactGemeenteInLijst | VSContactGemeente>() => {
  const [gemeenten, setGemeenten] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const fetchGemeenten = async () => {
    try {
      console.debug('Fetching gemeenten version:', version);
      
      setIsLoading(true);
      setError(null);
      // Type-level check for compact flag
      const compact = {} as T extends VSContactGemeenteInLijst ? true : false;
      const response = await fetch(`/api/protected/gemeenten?compact=${compact}`);
      const result: GemeentenResponse<T> = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setGemeenten(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching gemeenten');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGemeenten();
  }, [version]);

  return {
    gemeenten,
    isLoading,
    error: error || undefined,
    reloadGemeenten: () => setVersion(v => v + 1)
  };
}; 

export const useGemeentenInLijst = () => useGemeentenBasis<VSContactGemeenteInLijst>();
export const useGemeenten = () => useGemeentenBasis<VSContactGemeente>();

