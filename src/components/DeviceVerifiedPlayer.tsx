'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import VimeoPlayer from './VimeoPlayer';
import { useDeviceFingerprint } from '@/hooks/useDeviceFingerprint';

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
  const { fingerprint, loading: fpLoading } = useDeviceFingerprint();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0);

  useEffect(() => {
    async function verifyDevice() {
      if (fpLoading || !fingerprint) {
        return;
      }

      try {
        setVerifying(true);

        const response = await fetch('/api/devices/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fingerprint,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setVerified(data.verified);
          setCanRegister(data.canRegister || false);
          setDeviceCount(data.deviceCount || 0);
        } else {
          console.error('기기 검증 실패:', data.error);
        }
      } catch (error) {
        console.error('기기 검증 에러:', error);
      } finally {
        setVerifying(false);
      }
    }

    verifyDevice();
  }, [fingerprint, fpLoading]);

  // 로딩 중
  if (fpLoading || verifying) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">기기 확인 중...</p>
        </div>
      </div>
    );
  }

  // 기기 미등록
  if (!verified) {
    return (
      <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
        <div className="max-w-md text-center p-8">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            등록되지 않은 기기입니다
          </h3>
          <p className="text-gray-300 mb-6">
            {canRegister
              ? '이 기기를 등록하면 강의를 시청할 수 있습니다.'
              : '최대 기기 수(2개)를 초과했습니다. 기존 기기를 삭제한 후 새 기기를 등록해주세요.'}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            현재 등록된 기기: {deviceCount}/2
          </p>
          <button
            onClick={() => router.push('/mypage/devices')}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            기기 관리 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  // 기기 검증 완료 - 비디오 플레이어 표시
  return <VimeoPlayer {...props} />;
}
