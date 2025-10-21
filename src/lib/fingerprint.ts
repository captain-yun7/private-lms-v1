import FingerprintJS from '@fingerprintjs/fingerprintjs';

let fpPromise: Promise<any> | null = null;

export async function getDeviceFingerprint(): Promise<string> {
  try {
    if (!fpPromise) {
      fpPromise = FingerprintJS.load();
    }

    const fp = await fpPromise;
    const result = await fp.get();

    return result.visitorId;
  } catch (error) {
    console.error('Fingerprint 생성 실패:', error);
    throw error;
  }
}

export function getDeviceInfo(): {
  userAgent: string;
  platform: string;
  language: string;
} {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
}
