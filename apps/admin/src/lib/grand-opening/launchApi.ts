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
      return await apiRequest<{ success: boolean; message: string }>('/admin/launch/complete', {
        method: 'POST',
      });
    } catch (e: any) {
      console.warn('[launchApi] completeLaunch error:', e);
      return { success: false, message: e.message || 'Failed' };
    }
  },

  async resetLaunch(): Promise<{ success: boolean; message: string }> {
    try {
      return await apiRequest<{ success: boolean; message: string }>('/admin/launch/reset', {
        method: 'POST',
      });
    } catch (e: any) {
      console.warn('[launchApi] resetLaunch error:', e);
      return { success: false, message: e.message || 'Failed' };
    }
  },

  async toggleLaunch(isEnabled: boolean): Promise<{ success: boolean; isEnabled: boolean }> {
    try {
      return await apiRequest<{ success: boolean; isEnabled: boolean }>('/admin/launch/toggle', {
        method: 'POST',
        body: JSON.stringify({ isEnabled }),
      });
    } catch (e: any) {
      console.warn('[launchApi] toggleLaunch error:', e);
      return { success: false, isEnabled };
    }
  },
};
