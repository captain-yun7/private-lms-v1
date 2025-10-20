'use client';

import { useEffect, useRef, useState } from 'react';
import Player from '@vimeo/player';

interface VimeoPlayerProps {
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

export default function VimeoPlayer({
  vimeoUrl,
  onReady,
  onPlay,
  onPause,
  onEnded,
  onTimeUpdate,
  autoplay = false,
  controls = true,
  responsive = true,
  className = '',
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // 콜백 함수들을 ref로 저장하여 useEffect dependency 문제 해결
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

  useEffect(() => {
    if (!containerRef.current) return;

    // React Strict Mode에서 중복 초기화 방지
    if (initializedRef.current && playerRef.current) {
      console.log('[VimeoPlayer] Already initialized, skipping');
      return;
    }

    initializedRef.current = true;
    let player: Player | null = null;

    console.log('[VimeoPlayer] Starting initialization');

    try {
      // Vimeo URL에서 video ID 추출
      const getVimeoId = (url: string): string | null => {
        const patterns = [
          /vimeo\.com\/(\d+)/,
          /vimeo\.com\/video\/(\d+)/,
          /player\.vimeo\.com\/video\/(\d+)/,
        ];

        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) {
            return match[1];
          }
        }
        return null;
      };

      const videoId = getVimeoId(vimeoUrl);

      if (!videoId) {
        setError('유효하지 않은 Vimeo URL입니다.');
        setIsLoading(false);
        return;
      }

      // Vimeo Player 초기화
      console.log('[VimeoPlayer] Initializing player with video ID:', videoId);
      player = new Player(containerRef.current, {
        id: parseInt(videoId),
        autoplay,
        controls,
        responsive,
        width: responsive ? undefined : 640,
        playsinline: true,
        dnt: true,
      });

      console.log('[VimeoPlayer] Player instance created');
      playerRef.current = player;

      // Ready 이벤트
      player.ready().then(() => {
        console.log('[VimeoPlayer] Player ready!');

        // 플레이어 정보 확인
        player!.getDuration().then((duration) => {
          console.log('[VimeoPlayer] Video duration:', duration);
        });

        player!.getPaused().then((paused) => {
          console.log('[VimeoPlayer] Is paused:', paused);
        });

        setIsLoading(false);
        setError(null);
        onReadyRef.current?.();
      }).catch((err) => {
        console.error('Vimeo player error:', err);
        setError('비디오를 로드할 수 없습니다.');
        setIsLoading(false);
      });

      // 이벤트 리스너 등록
      player.on('play', () => {
        console.log('[VimeoPlayer] play event');
        onPlayRef.current?.();
      });

      player.on('pause', () => {
        console.log('[VimeoPlayer] pause event');
        onPauseRef.current?.();
      });

      player.on('ended', () => {
        console.log('[VimeoPlayer] ended event');
        onEndedRef.current?.();
      });

      player.on('timeupdate', (data) => {
        console.log('[VimeoPlayer] timeupdate event:', data);
        onTimeUpdateRef.current?.({
          seconds: data.seconds,
          percent: data.percent,
          duration: data.duration,
        });
      });

      // Cleanup - initializedRef는 리셋하지 않음 (React Strict Mode 대응)
      return () => {
        console.log('[VimeoPlayer] Cleanup called (strict mode), keeping player');
        // playerRef와 initializedRef를 유지하여 재초기화 방지
      };
    } catch (err) {
      console.error('Failed to initialize Vimeo player:', err);
      setError('플레이어 초기화에 실패했습니다.');
      setIsLoading(false);
    }
  }, [vimeoUrl, autoplay, controls, responsive]);

  return (
    <div className={`relative ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">비디오 로딩 중...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white text-lg">{error}</p>
          </div>
        </div>
      )}

      {/* Vimeo Player Container */}
      <div ref={containerRef} className="w-full" />
    </div>
  );
}
