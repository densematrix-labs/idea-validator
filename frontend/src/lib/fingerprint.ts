/**
 * Device fingerprinting for user identification.
 */
import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  // Check localStorage first
  const stored = localStorage.getItem('device_id');
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }

  // Generate new fingerprint
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedDeviceId = result.visitorId;
    localStorage.setItem('device_id', cachedDeviceId);
    return cachedDeviceId;
  } catch (error) {
    // Fallback to random ID
    const fallbackId = `fallback_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('device_id', fallbackId);
    cachedDeviceId = fallbackId;
    return fallbackId;
  }
}
