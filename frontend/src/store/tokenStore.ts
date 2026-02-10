/**
 * Token state management with Zustand.
 */
import { create } from 'zustand';
import { getTokenStatus } from '../lib/api';
import { getDeviceId } from '../lib/fingerprint';

interface TokenState {
  freeTrialUsed: boolean;
  tokensRemaining: number;
  canGenerate: boolean;
  loading: boolean;
  error: string | null;
  fetchStatus: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useTokenStore = create<TokenState>((set, get) => ({
  freeTrialUsed: false,
  tokensRemaining: 0,
  canGenerate: true,
  loading: false,
  error: null,

  fetchStatus: async () => {
    set({ loading: true, error: null });
    try {
      const deviceId = await getDeviceId();
      const status = await getTokenStatus(deviceId);
      set({
        freeTrialUsed: status.free_trial_used,
        tokensRemaining: status.tokens_remaining,
        canGenerate: status.can_generate,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch status',
      });
    }
  },

  refresh: async () => {
    await get().fetchStatus();
  },
}));
