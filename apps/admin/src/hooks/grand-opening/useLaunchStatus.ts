import { useState, useEffect, useCallback } from 'react';
import { launchApi, LaunchStatusResponse } from '../../lib/grand-opening/launchApi';

export function useLaunchStatus() {
  const [status, setStatus] = useState<LaunchStatusResponse>({
    success: true,
    isEnabled: true,
    hasLaunched: false,
    launchedAt: null,
    launchedBy: null,
    shouldShowLaunch: false,
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async (preview?: boolean) => {
    try {
      setLoading(true);
      const res = await launchApi.getStatus(preview);
      setStatus(res);
      setError(null);
    } catch (err: any) {
      console.warn('[useLaunchStatus] Error fetching launch status:', err);
      setError(err.message || 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if ?preview=grand-opening or ?preview=true is in URL
    const params = new URLSearchParams(window.location.search);
    const isPreview = params.get('preview') === 'grand-opening' || params.get('preview') === 'true';
    refreshStatus(isPreview);
  }, [refreshStatus]);

  const markComplete = async () => {
    const res = await launchApi.completeLaunch();
    if (res.success) {
      setStatus((prev) => ({
        ...prev,
        hasLaunched: true,
        shouldShowLaunch: false,
      }));
    }
    return res;
  };

  const resetLaunch = async () => {
    const res = await launchApi.resetLaunch();
    if (res.success) {
      setStatus((prev) => ({
        ...prev,
        hasLaunched: false,
        shouldShowLaunch: true,
      }));
    }
    return res;
  };

  return {
    status,
    loading,
    error,
    refreshStatus,
    markComplete,
    resetLaunch,
  };
}
