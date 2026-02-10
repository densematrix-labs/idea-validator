import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API module before importing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import { validateIdea, getTokenStatus, createCheckout } from '../lib/api';

describe('API client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('validateIdea', () => {
    it('returns validation result on success', async () => {
      const mockResponse = {
        report_id: 'test-report-id',
        overall_score: 75,
        summary: 'Test summary',
        market_analysis: {},
        competition_analysis: {},
        technical_feasibility: {},
        business_model: {},
        risks: {},
        suggestions: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await validateIdea(
        { idea_title: 'Test', idea_description: 'Test description for validation', language: 'en' },
        'test-device'
      );

      expect(result.report_id).toBe('test-report-id');
      expect(result.overall_score).toBe(75);
    });

    it('handles string error detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Something went wrong' }),
      });

      await expect(
        validateIdea(
          { idea_title: 'Test', idea_description: 'Test description', language: 'en' },
          'test-device'
        )
      ).rejects.toThrow('Something went wrong');
    });

    it('handles object error detail with error field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'No tokens remaining', code: 'payment_required' },
        }),
      });

      // Should extract the error field, not show [object Object]
      await expect(
        validateIdea(
          { idea_title: 'Test', idea_description: 'Test description', language: 'en' },
          'test-device'
        )
      ).rejects.toThrow('No tokens remaining');
    });

    it('handles object error detail with message field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: { message: 'Invalid input' },
        }),
      });

      await expect(
        validateIdea(
          { idea_title: 'Test', idea_description: 'Test description', language: 'en' },
          'test-device'
        )
      ).rejects.toThrow('Invalid input');
    });

    it('never throws [object Object]', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          detail: { some: 'unknown', structure: true },
        }),
      });

      try {
        await validateIdea(
          { idea_title: 'Test', idea_description: 'Test description', language: 'en' },
          'test-device'
        );
      } catch (e) {
        expect((e as Error).message).not.toContain('[object Object]');
        expect((e as Error).message).not.toContain('object Object');
      }
    });
  });

  describe('getTokenStatus', () => {
    it('returns token status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          free_trial_used: false,
          tokens_total: 10,
          tokens_used: 3,
          tokens_remaining: 7,
          can_generate: true,
        }),
      });

      const status = await getTokenStatus('test-device');
      expect(status.can_generate).toBe(true);
      expect(status.tokens_remaining).toBe(7);
    });
  });

  describe('createCheckout', () => {
    it('returns checkout URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          checkout_url: 'https://checkout.creem.io/xxx',
          checkout_id: 'checkout-123',
        }),
      });

      const result = await createCheckout('validator_10', 'test-device');
      expect(result.checkout_url).toContain('creem.io');
    });

    it('handles checkout error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Product not configured' }),
      });

      await expect(createCheckout('invalid_sku', 'test-device')).rejects.toThrow('Product not configured');
    });
  });
});
