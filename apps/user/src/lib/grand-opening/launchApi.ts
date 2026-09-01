import { apiRequest } from '../apiClient';

export interface LaunchStatusResponse {
  success: boolean;
  isEnabled: boolean;
  hasLaunched: boolean;
  launchedAt: string | null;
  launchedBy: string | null;
  shouldShowLaunch: boolean;
  isAdmin?: boolean;
  error?: string;
}

export const launchApi = {
  async getStatus(preview?: boolean): Promise<LaunchStatusResponse> {
    try {
      const query = preview ? '?preview=true' : '';
      return await apiRequest<LaunchStatusResponse>(`/launch/status${query}`, {
        method: 'GET',
      });
    } catch (e: any) {
      console.warn('[launchApi] Fallback status:', e);
      return {
        success: true,
        isEnabled: true,
        hasLaunched: true,
        launchedAt: null,
        launchedBy: null,
        shouldShowLaunch: false,
        isAdmin: false,
      };
    }
  },

  async completeLaunch(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiRequest<{ message?: string }>('/launch/complete', {
        method: 'POST',
      });
      return { success: true, message: res?.message || 'Launch completed' };
    } catch (e: any) {
      console.warn('[launchApi] completeLaunch error:', e);
      return { success: false, message: e.message || 'Failed' };
    }
  },

  async resetLaunch(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await apiRequest<{ message?: string }>('/launch/reset', {
        method: 'POST',
      });
      return { success: true, message: res?.message || 'Launch reset' };
    } catch (e: any) {
      console.warn('[launchApi] resetLaunch error:', e);
      return { success: false, message: e.message || 'Failed' };
    }
  },

  async toggleLaunch(isEnabled: boolean): Promise<{ success: boolean; isEnabled: boolean }> {
    try {
      const res = await apiRequest<{ isEnabled?: boolean }>('/launch/toggle', {
        method: 'POST',
        body: JSON.stringify({ isEnabled }),
      });
      return { success: true, isEnabled: res?.isEnabled ?? isEnabled };
    } catch (e: any) {
      console.warn('[launchApi] toggleLaunch error:', e);
      return { success: false, isEnabled };
    }
  },
};
