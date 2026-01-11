'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // 토큰 유효성 검사
  useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidating(false);
        setTokenValid(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
        } else {
          setError(data.error || '유효하지 않은 링크입니다.');
          setTokenValid(false);
        }
      } catch (err) {
        setError('링크 확인 중 오류가 발생했습니다.');
        setTokenValid(false);
      } finally {
        setValidating(false);
      }
    }

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '비밀번호 변경에 실패했습니다.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 로딩 중
  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">링크 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">선박조종연구소</h1>
          </Link>
          <p className="mt-2 text-text-secondary">비밀번호 재설정</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {success ? (
            // 성공 메시지
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">비밀번호 변경 완료</h2>
              <p className="text-text-secondary mb-6">
                비밀번호가 성공적으로 변경되었습니다.<br />
                새 비밀번호로 로그인해주세요.
              </p>
              <Link
                href="/login"
                className="inline-block py-3 px-6 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                로그인하기
              </Link>
            </div>
          ) : !tokenValid ? (
            // 토큰 유효하지 않음
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">유효하지 않은 링크</h2>
              <p className="text-text-secondary mb-6">
                {error || '링크가 만료되었거나 유효하지 않습니다.'}
                <br />
                비밀번호 찾기를 다시 진행해주세요.
              </p>
              <Link
                href="/forgot-password"
                className="inline-block py-3 px-6 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                비밀번호 찾기
              </Link>
            </div>
          ) : (
            // 비밀번호 변경 폼
            <>
              <p className="text-text-secondary text-center mb-6">
                새로운 비밀번호를 입력해주세요.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register('password')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="최소 8자 이상"
                    disabled={loading}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="비밀번호를 다시 입력하세요"
                    disabled={loading}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </span>
                  ) : (
                    '비밀번호 변경'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                  로그인으로 돌아가기
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">로딩 중...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
