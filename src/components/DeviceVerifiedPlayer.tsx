'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VimeoPlayer from './VimeoPlayer';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';
import { generateDeviceName } from '@/lib/fingerprint';

interface DeviceVerifiedPlayerProps {
  vimeoUrl: string;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (data: { seconds: number; percent: number; duration: number }) => void;
  autoplay?: boolean;
  controls?: boolean;
  responsive?: boolean;
  className?: string;
}

export default function DeviceVerifiedPlayer(props: DeviceVerifiedPlayerProps) {
  const router = useRouter();
  const { fingerprint, deviceInfo, loading: fpLoading } = useDeviceFingerprint();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    async function verifyAndRegisterDevice() {
      if (fpLoading || !fingerprint || !deviceInfo) {
        return;
      }

      try {
        setVerifying(true);

        // 1. 기기 검증
        const verifyResponse = await fetch('/api/devices/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fingerprint,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
          // 이미 등록된 기기
          if (verifyData.verified) {
            setVerified(true);
            setCanRegister(false);
            setDeviceCount(verifyData.deviceCount || 0);
          }
          // 미등록 기기이고 등록 가능한 경우 (0/2 또는 1/2) - 자동 등록
          else if (verifyData.canRegister) {
            console.log('[DeviceVerifiedPlayer] Auto-registering device...');

            const registerResponse = await fetch('/api/devices', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                fingerprint,
                name: generateDeviceName(deviceInfo.platform, deviceInfo.userAgent),
                userAgent: deviceInfo.userAgent,
                platform: deviceInfo.platform,
                language: deviceInfo.language,
              }),
            });

            if (registerResponse.ok) {
              console.log('[DeviceVerifiedPlayer] Device auto-registered successfully');
              setVerified(true);
              setCanRegister(false);
              setDeviceCount((verifyData.deviceCount || 0) + 1);
            } else {
              const registerData = await registerResponse.json();
              console.error('[DeviceVerifiedPlayer] Auto-registration failed:', registerData.error);
              setVerified(false);
              setCanRegister(true);
              setDeviceCount(verifyData.deviceCount || 0);
            }
          }
          // 미등록 기기이고 등록 불가능한 경우 (2/2)
          else {
            setVerified(false);
            setCanRegister(false);
            setDeviceCount(verifyData.deviceCount || 0);
          }
        } else {
          console.error('기기 검증 실패:', verifyData.error);
        }
      } catch (error) {
        console.error('기기 검증 에러:', error);
      } finally {
        setVerifying(false);
      }
    }

    verifyAndRegisterDevice();
  }, [fingerprint, deviceInfo, fpLoading]);

  // 로딩 중
  if (fpLoading || verifying) {
    return (
      <div className={props.className || 'w-full aspect-video'}>
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">기기 확인 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 기기 미등록 - 2개 초과시에만 표시 (자동 등록 실패)
  if (!verified) {
    return (
      <div className={props.className || 'w-full aspect-video'}>
        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
          <div className="max-w-lg text-center p-8">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-3">
            등록 기기 제한 초과
          </h3>
          <p className="text-gray-300 mb-2">
            최대 2개의 기기만 등록할 수 있습니다.
          </p>
          <p className="text-gray-300 mb-6">
            기존 기기를 삭제한 후 이 기기에서 강의를 시청할 수 있습니다.
          </p>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">현재 등록된 기기</p>
            <p className="text-2xl font-bold text-white">{deviceCount} / 2</p>
          </div>

          <button
            onClick={() => router.push('/mypage/devices')}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            등록 기기 관리하기
          </button>

          <p className="mt-4 text-sm text-gray-400">
            기기 관리 페이지에서 기존 기기를 삭제하면<br />
            이 기기가 자동으로 등록됩니다.
          </p>
        </div>
        </div>
      </div>
    );
  }

  // 기기 검증 완료 - 비디오 플레이어 표시
  return <VimeoPlayer {...props} />;
}
