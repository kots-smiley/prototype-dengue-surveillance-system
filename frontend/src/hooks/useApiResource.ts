import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ApiError } from '../utils/api-client';

/**
 * Generic data-fetching hook. Handles loading, error, and refetch so pages
 * stay free of fetch boilerplate.
 */
export function useApiResource<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: { errorMessage?: string } = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const hasData = data !== null;
    setLoading(!hasData);
    setRefreshing(hasData);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : options.errorMessage || 'Something went wrong';
      setError(message);
      toast.error(options.errorMessage || message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, ...deps]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, refreshing, error, refetch: load };
}
