'use client';

import { useEffect, useRef, useState } from 'react';

interface VdoCipherPlayerProps {
  videoId: string; // DB의 video ID (vdoCipherId 아님)
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (data: { seconds: number; percent: number; duration: number }) => void;
  onError?: (error: string) => void;
  autoplay?: boolean;
  className?: string;
}

export default function VdoCipherPlayer({
  videoId,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  onError,
  autoplay = false,
  className = '',
}: VdoCipherPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  // OTP 발급 및 iframe URL 생성
  useEffect(() => {
    async function fetchOTP() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/videos/${videoId}/otp`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'OTP 발급 실패');
        }

        const data = await response.json();

        // iframe URL 생성
        const src = `https://player.vdocipher.com/v2/?otp=${data.otp}&playbackInfo=${data.playbackInfo}${autoplay ? '&autoplay=true' : ''}`;
        setIframeSrc(src);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'OTP 발급 중 오류 발생';
        setError(errorMessage);
        onError?.(errorMessage);
        setIsLoading(false);
      }
    }

    if (videoId) {
      fetchOTP();
    }
  }, [videoId, autoplay]);

  // iframe 로드 완료 처리
  const handleIframeLoad = () => {
    setIsLoading(false);
    onReady?.();
  };

  return (
    <div className={`relative overflow-hidden bg-black ${className || 'w-full aspect-video'}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">영상 로딩 중...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white text-lg mb-2">영상을 재생할 수 없습니다</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* VdoCipher Player iframe */}
      {iframeSrc && (
        <iframe
          ref={iframeRef}
          src={iframeSrc}
          className="w-full h-full border-0"
          allow="encrypted-media; autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
        />
      )}
    </div>
  );
}
