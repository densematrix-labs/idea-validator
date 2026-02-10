import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

// Mock the dependencies
vi.mock('../lib/api', () => ({
  getTokenStatus: vi.fn(),
}));

vi.mock('../lib/fingerprint', () => ({
  getDeviceId: vi.fn().mockResolvedValue('test-device-id'),
}));

import { useTokenStore } from '../store/tokenStore';
import { getTokenStatus } from '../lib/api';

describe('tokenStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useTokenStore.setState({
      freeTrialUsed: false,
      tokensRemaining: 0,
      canGenerate: true,
      loading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = useTokenStore.getState();
    expect(state.freeTrialUsed).toBe(false);
    expect(state.tokensRemaining).toBe(0);
    expect(state.canGenerate).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetches and updates token status', async () => {
    vi.mocked(getTokenStatus).mockResolvedValueOnce({
      free_trial_used: true,
      tokens_total: 10,
      tokens_used: 3,
      tokens_remaining: 7,
      can_generate: true,
    });

    await act(async () => {
      await useTokenStore.getState().fetchStatus();
    });

    const state = useTokenStore.getState();
    expect(state.freeTrialUsed).toBe(true);
    expect(state.tokensRemaining).toBe(7);
    expect(state.canGenerate).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('handles fetch error', async () => {
    vi.mocked(getTokenStatus).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await useTokenStore.getState().fetchStatus();
    });

    const state = useTokenStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.loading).toBe(false);
  });

  it('sets loading state during fetch', async () => {
    vi.mocked(getTokenStatus).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        free_trial_used: false,
        tokens_total: 0,
        tokens_used: 0,
        tokens_remaining: 0,
        can_generate: true,
      }), 100))
    );

    const fetchPromise = useTokenStore.getState().fetchStatus();
    
    // Check loading state is true immediately
    expect(useTokenStore.getState().loading).toBe(true);
    
    await act(async () => {
      await fetchPromise;
    });
    
    expect(useTokenStore.getState().loading).toBe(false);
  });
});
