// VdoCipher API 유틸리티

const VDOCIPHER_API_SECRET = process.env.VDOCIPHER_API_SECRET;
const VDOCIPHER_API_URL = 'https://dev.vdocipher.com/api';

interface OTPResponse {
  otp: string;
  playbackInfo: string;
}

interface WatermarkConfig {
  text: string;
  alpha?: string;
  color?: string;
  size?: string;
  interval?: string;
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  upload_time: number;
  length: number;
  status: string;
  poster: string;
}

/**
 * VdoCipher OTP 발급 (영상 재생용)
 */
export async function generateOTP(
  videoId: string,
  options?: {
    ttl?: number; // OTP 유효시간 (초)
    watermark?: WatermarkConfig;
  }
): Promise<OTPResponse> {
  if (!VDOCIPHER_API_SECRET) {
    throw new Error('VDOCIPHER_API_SECRET is not configured');
  }

  const body: Record<string, any> = {};

  // OTP 유효시간 설정
  if (options?.ttl) {
    body.ttl = options.ttl;
  }

  // 워터마크 설정 (다이나믹 워터마크)
  if (options?.watermark) {
    const annotate = [{
      type: 'rtext', // rotating text (움직이는 워터마크)
      text: options.watermark.text,
      alpha: options.watermark.alpha || '0.5',
      color: options.watermark.color || '0xFFFFFF',
      size: options.watermark.size || '14',
      interval: options.watermark.interval || '5000',
    }];
    body.annotate = JSON.stringify(annotate);
  }

  const response = await fetch(`${VDOCIPHER_API_URL}/videos/${videoId}/otp`, {
    method: 'POST',
    headers: {
      'Authorization': `Apisecret ${VDOCIPHER_API_SECRET}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('VdoCipher OTP error:', errorText);
    throw new Error(`Failed to generate OTP: ${response.status}`);
  }

  return response.json();
}

/**
 * VdoCipher 영상 업로드용 자격증명 발급
 */
export async function getUploadCredentials(title?: string): Promise<{
  clientPayload: {
    policy: string;
    key: string;
    'x-amz-signature': string;
    'x-amz-algorithm': string;
    'x-amz-date': string;
    'x-amz-credential': string;
    uploadLink: string;
  };
  videoId: string;
}> {
  if (!VDOCIPHER_API_SECRET) {
    throw new Error('VDOCIPHER_API_SECRET is not configured');
  }

  const params = new URLSearchParams();
  if (title) {
    params.append('title', title);
  }

  const response = await fetch(`${VDOCIPHER_API_URL}/videos?${params.toString()}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Apisecret ${VDOCIPHER_API_SECRET}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('VdoCipher upload credentials error:', errorText);
    throw new Error(`Failed to get upload credentials: ${response.status}`);
  }

  return response.json();
}

/**
 * VdoCipher 영상 정보 조회
 */
export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
  if (!VDOCIPHER_API_SECRET) {
    throw new Error('VDOCIPHER_API_SECRET is not configured');
  }

  const response = await fetch(`${VDOCIPHER_API_URL}/videos/${videoId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Apisecret ${VDOCIPHER_API_SECRET}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('VdoCipher video info error:', errorText);
    throw new Error(`Failed to get video info: ${response.status}`);
  }

  return response.json();
}

/**
 * VdoCipher 영상 삭제
 */
export async function deleteVideo(videoId: string): Promise<void> {
  if (!VDOCIPHER_API_SECRET) {
    throw new Error('VDOCIPHER_API_SECRET is not configured');
  }

  const response = await fetch(`${VDOCIPHER_API_URL}/videos`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Apisecret ${VDOCIPHER_API_SECRET}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ videos: [videoId] }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('VdoCipher delete error:', errorText);
    throw new Error(`Failed to delete video: ${response.status}`);
  }
}
