'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Script from 'next/script';

// VdoCipher Player API 타입 정의
declare global {
  interface Window {
    VdoPlayer?: {
      getInstance: (iframe: HTMLIFrameElement) => VdoPlayerInstance;
    };
  }
}

interface VdoPlayerInstance {
  video: {
    currentTime: number;
    duration: number;
    play: () => Promise<void>;
    pause: () => Promise<void>;
    addEventListener: (event: string, callback: () => void) => void;
    removeEventListener: (event: string, callback: () => void) => void;
  };
  api: {
    getTotalPlayed: () => Promise<number>;
    getTotalCovered: () => Promise<number>;
    getMetaData: () => Promise<any>;
  };
}

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
  const playerRef = useRef<VdoPlayerInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  // Script가 이미 로드되어 있으면 true로 시작
  const [apiLoaded, setApiLoaded] = useState(() => typeof window !== 'undefined' && !!window.VdoPlayer);

  // 콜백 함수들을 ref로 저장
  const onReadyRef = useRef(onReady);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onEndedRef = useRef(onEnded);
  const onTimeUpdateRef = useRef(onTimeUpdate);

  useEffect(() => {
    onReadyRef.current = onReady;
    onPlayRef.current = onPlay;
    onPauseRef.current = onPause;
    onEndedRef.current = onEnded;
    onTimeUpdateRef.current = onTimeUpdate;
  });

  // 컴포넌트 마운트 시 VdoPlayer API가 이미 로드되어 있는지 확인
  useEffect(() => {
    if (typeof window !== 'undefined' && window.VdoPlayer && !apiLoaded) {
      console.log('[VdoCipherPlayer] VdoPlayer API already loaded');
      setApiLoaded(true);
    }
  }, []);

  // OTP 발급 및 iframe URL 생성
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

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

        // 15초 타임아웃 - 플레이어 초기화가 안 되면 에러 표시
        timeoutId = setTimeout(() => {
          // playerRef가 설정되지 않았으면 초기화 실패
          if (!playerRef.current) {
            console.error('[VdoCipherPlayer] Player initialization timeout');
            const errorMessage = '영상 로딩 시간이 초과되었습니다. 페이지를 새로고침 해주세요.';
            setError(errorMessage);
            setIsLoading(false);
            onError?.(errorMessage);
          }
        }, 15000);
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

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [videoId, autoplay]);

  // 플레이어 이벤트 핸들러들
  const handlePlay = useCallback(() => {
    console.log('[VdoCipherPlayer] play event');
    onPlayRef.current?.();
  }, []);

  const handlePause = useCallback(() => {
    console.log('[VdoCipherPlayer] pause event');
    onPauseRef.current?.();
  }, []);

  const handleEnded = useCallback(() => {
    console.log('[VdoCipherPlayer] ended event');
    onEndedRef.current?.();
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!playerRef.current) return;

    const video = playerRef.current.video;
    const seconds = video.currentTime;
    const duration = video.duration;
    const percent = duration > 0 ? seconds / duration : 0;

    console.log('[VdoCipherPlayer] timeupdate:', seconds, 'seconds, progress:', Math.round(percent * 100) + '%');

    onTimeUpdateRef.current?.({
      seconds,
      percent,
      duration,
    });
  }, []);

  // 플레이어 API 초기화
  const initializePlayer = useCallback(() => {
    if (!iframeRef.current || !window.VdoPlayer) {
      console.log('[VdoCipherPlayer] Cannot initialize: iframe or VdoPlayer API not ready');
      return false;
    }

    try {
      const player = window.VdoPlayer.getInstance(iframeRef.current);
      playerRef.current = player;

      console.log('[VdoCipherPlayer] Player instance created');

      // 이벤트 리스너 등록
      player.video.addEventListener('play', handlePlay);
      player.video.addEventListener('pause', handlePause);
      player.video.addEventListener('ended', handleEnded);
      player.video.addEventListener('timeupdate', handleTimeUpdate);

      setIsLoading(false);
      onReadyRef.current?.();
      return true;
    } catch (err) {
      console.error('[VdoCipherPlayer] Failed to initialize player:', err);
      const errorMessage = '플레이어 초기화에 실패했습니다. 잠시 후 다시 시도해주세요.';
      setError(errorMessage);
      setIsLoading(false);
      onError?.(errorMessage);
      return false;
    }
  }, [handlePlay, handlePause, handleEnded, handleTimeUpdate, onError]);

  // iframe 로드 완료 후 플레이어 초기화
  const handleIframeLoad = useCallback(() => {
    console.log('[VdoCipherPlayer] iframe loaded, apiLoaded:', apiLoaded);
    if (apiLoaded) {
      // API가 이미 로드되어 있으면 바로 초기화
      setTimeout(initializePlayer, 500); // iframe 내부 초기화를 위한 약간의 지연
    }
  }, [apiLoaded, initializePlayer]);

  // API 스크립트 로드 완료
  const handleApiLoad = useCallback(() => {
    console.log('[VdoCipherPlayer] VdoCipher API script loaded');
    setApiLoaded(true);

    // iframe이 이미 로드되어 있으면 플레이어 초기화
    if (iframeRef.current) {
      setTimeout(initializePlayer, 500);
    }
  }, [initializePlayer]);

  // 컴포넌트 언마운트 시 이벤트 리스너 정리
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.video.removeEventListener('play', handlePlay);
          playerRef.current.video.removeEventListener('pause', handlePause);
          playerRef.current.video.removeEventListener('ended', handleEnded);
          playerRef.current.video.removeEventListener('timeupdate', handleTimeUpdate);
        } catch (err) {
          console.log('[VdoCipherPlayer] Error removing event listeners:', err);
        }
      }
    };
  }, [handlePlay, handlePause, handleEnded, handleTimeUpdate]);

  return (
    <div className={`relative overflow-hidden bg-black ${className || 'w-full aspect-video'}`}>
      {/* VdoCipher Player API Script */}
      <Script
        src="https://player.vdocipher.com/v2/api.js"
        strategy="afterInteractive"
        onLoad={handleApiLoad}
      />

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
