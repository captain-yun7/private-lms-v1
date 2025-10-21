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

// OS 버전 정보를 포함한 사용자 친화적인 이름 생성
export function generateDeviceName(platform: string, userAgent: string): string {
  const ua = userAgent.toLowerCase();

  // Windows 버전 감지
  if (platform.includes('Win') || ua.includes('windows')) {
    if (ua.includes('windows nt 10.0')) return 'Windows 10/11';
    if (ua.includes('windows nt 6.3')) return 'Windows 8.1';
    if (ua.includes('windows nt 6.2')) return 'Windows 8';
    if (ua.includes('windows nt 6.1')) return 'Windows 7';
    return 'Windows';
  }

  // macOS 버전 감지
  if (platform.includes('Mac') || ua.includes('macintosh')) {
    const match = ua.match(/mac os x (\d+)[._](\d+)/);
    if (match) {
      const major = parseInt(match[1]);
      const minor = parseInt(match[2]);

      // macOS 버전명 매핑
      if (major === 14) return 'macOS Sonoma';
      if (major === 13) return 'macOS Ventura';
      if (major === 12) return 'macOS Monterey';
      if (major === 11) return 'macOS Big Sur';
      if (major === 10) {
        if (minor === 15) return 'macOS Catalina';
        if (minor === 14) return 'macOS Mojave';
        return `macOS 10.${minor}`;
      }
      return `macOS ${major}.${minor}`;
    }
    return 'macOS';
  }

  // Android 버전 감지
  if (ua.includes('android')) {
    const match = ua.match(/android (\d+)\.?(\d+)?/);
    if (match) {
      const version = match[2] ? `${match[1]}.${match[2]}` : match[1];
      return `Android ${version}`;
    }
    return 'Android';
  }

  // iOS 버전 감지
  if (ua.includes('iphone') || ua.includes('ipad')) {
    const match = ua.match(/os (\d+)[._](\d+)/);
    if (match) {
      return `iOS ${match[1]}.${match[2]}`;
    }
    return 'iOS';
  }

  // Linux
  if (platform.includes('Linux') || ua.includes('linux')) {
    return 'Linux';
  }

  // 기본값
  return platform;
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
