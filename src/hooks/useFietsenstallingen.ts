import { useState, useEffect } from 'react';
import { type ReportBikepark } from '~/components/beheer/reports/ReportsFilter';

type FietsenstallingenResponse = {
  data?: (ReportBikepark)[];
  error?: string;
};

export const useFietsenstallingen = (GemeenteID: string, compact = true) => {
  const [fietsenstallingen, setFietsenstallingen] = useState<(ReportBikepark)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const fetchFietsenstallingen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/protected/fietsenstallingen?GemeenteID=${GemeenteID}&compact=${compact}`);
      const result: FietsenstallingenResponse = await response.json();

      console.debug('Size Result (bytes):', JSON.stringify(result.data).length);
      
      if (result.error) {
        throw new Error(result.error);
      }

      setFietsenstallingen(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching fietsenstallingen');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFietsenstallingen();
  }, [version]);

  return {
    fietsenstallingen,
    isLoading,
    error,
    reloadFietsenstallingen: () => setVersion(v => v + 1)
  };
}; 