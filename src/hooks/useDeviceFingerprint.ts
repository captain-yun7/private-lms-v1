import { useState, useEffect } from 'react';
import { getDeviceFingerprint, getDeviceInfo } from '@/lib/fingerprint';

export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<{
    userAgent: string;
    platform: string;
    language: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFingerprint() {
      try {
        setLoading(true);
        const fp = await getDeviceFingerprint();
        const info = getDeviceInfo();

        setFingerprint(fp);
        setDeviceInfo(info);
        setError(null);
      } catch (err) {
        console.error('Fingerprint 로딩 실패:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadFingerprint();
  }, []);

  return { fingerprint, deviceInfo, loading, error };
}
