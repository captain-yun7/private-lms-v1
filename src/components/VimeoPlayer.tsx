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

  useEffect(() => {
    if (!containerRef.current) return;

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
      const player = new Player(containerRef.current, {
        id: parseInt(videoId),
        autoplay,
        controls,
        responsive,
        width: responsive ? undefined : 640,
      });

      playerRef.current = player;

      // Ready 이벤트
      player.ready().then(() => {
        setIsLoading(false);
        setError(null);
        onReady?.();
      }).catch((err) => {
        console.error('Vimeo player error:', err);
        setError('비디오를 로드할 수 없습니다.');
        setIsLoading(false);
      });

      // 이벤트 리스너 등록
      if (onPlay) {
        player.on('play', onPlay);
      }

      if (onPause) {
        player.on('pause', onPause);
      }

      if (onEnded) {
        player.on('ended', onEnded);
      }

      if (onTimeUpdate) {
        player.on('timeupdate', (data) => {
          onTimeUpdate({
            seconds: data.seconds,
            percent: data.percent,
            duration: data.duration,
          });
        });
      }

      // Cleanup
      return () => {
        player.destroy();
      };
    } catch (err) {
      console.error('Failed to initialize Vimeo player:', err);
      setError('플레이어 초기화에 실패했습니다.');
      setIsLoading(false);
    }
  }, [vimeoUrl, autoplay, controls, responsive, onReady, onPlay, onPause, onEnded, onTimeUpdate]);

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
