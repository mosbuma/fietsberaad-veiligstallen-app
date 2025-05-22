import { useState, useEffect, useRef } from 'react';
import type { VSContactGemeenteInLijst, VSContactGemeente } from '~/types/contacts';

type GemeentenResponse<T extends VSContactGemeenteInLijst | VSContactGemeente> = {
  data?: T[];
  error?: string;
};

const useGemeentenBasis = <T extends VSContactGemeenteInLijst | VSContactGemeente>(compact: boolean) => {
  const [gemeenten, setGemeenten] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const mounted = useRef(false);

  const fetchGemeenten = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
    if (!mounted.current) {
      mounted.current = true;
      fetchGemeenten();
    }
  }, [version]);

  return {
    gemeenten,
    isLoading,
    error: error || undefined,
    reloadGemeenten: () => setVersion(v => v + 1)
  };
}; 

export const useGemeentenInLijst = () => useGemeentenBasis<VSContactGemeenteInLijst>(true);
export const useGemeenten = () => useGemeentenBasis<VSContactGemeente>(false);

