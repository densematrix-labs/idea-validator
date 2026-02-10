/**
 * API client for the Idea Validator backend.
 */

const API_BASE = import.meta.env.PROD 
  ? 'https://idea-validator.demo.densematrix.ai/api/v1'
  : '/api/v1';

interface ValidateRequest {
  idea_title: string;
  idea_description: string;
  language: string;
}

interface ValidateResponse {
  report_id: string;
  overall_score: number;
  market_analysis: Record<string, unknown>;
  competition_analysis: Record<string, unknown>;
  technical_feasibility: Record<string, unknown>;
  business_model: Record<string, unknown>;
  risks: Record<string, unknown>;
  suggestions: Record<string, unknown>;
  summary: string;
}

interface TokenStatus {
  free_trial_used: boolean;
  tokens_total: number;
  tokens_used: number;
  tokens_remaining: number;
  can_generate: boolean;
}

interface CheckoutResponse {
  checkout_url: string;
  checkout_id: string;
}

/**
 * Extract error message from API response.
 * Handles both string and object detail formats.
 */
function extractErrorMessage(detail: unknown): string {
  if (typeof detail === 'string') {
    return detail;
  }
  if (typeof detail === 'object' && detail !== null) {
    const obj = detail as Record<string, unknown>;
    if (typeof obj.error === 'string') return obj.error;
    if (typeof obj.message === 'string') return obj.message;
    // Fallback for other object structures
    return JSON.stringify(detail);
  }
  return 'Request failed';
}

export async function validateIdea(
  request: ValidateRequest,
  deviceId: string
): Promise<ValidateResponse> {
  const response = await fetch(`${API_BASE}/validate?device_id=${encodeURIComponent(deviceId)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(extractErrorMessage(data.detail));
  }

  return response.json();
}

export async function getReport(reportId: string): Promise<ValidateResponse & { idea_title: string; idea_description: string }> {
  const response = await fetch(`${API_BASE}/reports/${reportId}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'Report not found' }));
    throw new Error(extractErrorMessage(data.detail));
  }

  return response.json();
}

export async function getTokenStatus(deviceId: string): Promise<TokenStatus> {
  const response = await fetch(`${API_BASE}/tokens/status?device_id=${encodeURIComponent(deviceId)}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'Failed to get status' }));
    throw new Error(extractErrorMessage(data.detail));
  }

  return response.json();
}

export async function createCheckout(productSku: string, deviceId: string): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE}/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_sku: productSku,
      device_id: deviceId,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'Checkout failed' }));
    throw new Error(extractErrorMessage(data.detail));
  }

  return response.json();
}

export async function verifyPayment(checkoutId: string): Promise<{ status: string; tokens_added: number }> {
  const response = await fetch(`${API_BASE}/payment/verify/${checkoutId}`);

  if (!response.ok) {
    const data = await response.json().catch(() => ({ detail: 'Verification failed' }));
    throw new Error(extractErrorMessage(data.detail));
  }

  return response.json();
}
