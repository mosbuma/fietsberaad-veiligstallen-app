import { useState, useEffect } from 'react';
import type { VSContactGemeenteInLijst, VSContactGemeente } from '~/types/contacts';

type GemeenteResponse = {
  data?: VSContactGemeente;
  error?: string;
};

export const useGemeente = (gemeenteID: string) => {
  const [gemeente, setGemeente] = useState<VSContactGemeente | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const fetchGemeente = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/protected/gemeenten/${gemeenteID||false}`);
      const result: GemeenteResponse = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setGemeente(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : `An error occurred while fetching gemeente ${gemeenteID}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGemeente();
  }, [version]);

  return {
    gemeente,
    isLoading,
    error,
    reloadGemeente: () => setVersion(v => v + 1)
  };
}; 