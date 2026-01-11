import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, getPasswordResetEmailTemplate } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: '이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true },
    });

    // 사용자가 없거나 소셜 로그인 사용자(password가 null)인 경우에도
    // 보안상 동일한 메시지를 반환합니다.
    if (!user || !user.password) {
      // 실제로는 이메일을 보내지 않지만, 같은 응답을 반환
      return NextResponse.json({
        message: '입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.',
      });
    }

    // 기존 토큰 삭제
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email! },
    });

    // 새 토큰 생성 (1시간 유효)
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1시간

    await prisma.passwordResetToken.create({
      data: {
        email: user.email!,
        token,
        expires,
      },
    });

    // 재설정 링크 생성
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // 이메일 발송
    const emailTemplate = getPasswordResetEmailTemplate(resetUrl, user.name || undefined);

    await sendEmail({
      to: user.email!,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    return NextResponse.json({
      message: '입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.',
    });
  } catch (error) {
    console.error('비밀번호 재설정 요청 오류:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 요청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
