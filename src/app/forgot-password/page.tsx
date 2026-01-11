'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '요청 처리 중 오류가 발생했습니다.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-light py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold gradient-text">선박조종연구소</h1>
          </Link>
          <p className="mt-2 text-text-secondary">비밀번호 찾기</p>
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
              <h2 className="text-xl font-semibold text-text-primary mb-2">이메일 발송 완료</h2>
              <p className="text-text-secondary mb-6">
                입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.<br />
                이메일을 확인해주세요.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
              </p>
              <Link
                href="/login"
                className="inline-block py-3 px-6 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          ) : (
            // 입력 폼
            <>
              <p className="text-text-secondary text-center mb-6">
                가입 시 등록한 이메일 주소를 입력하시면<br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                    placeholder="example@email.com"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
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
                    '비밀번호 재설정 링크 받기'
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
