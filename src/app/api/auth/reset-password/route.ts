import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: '새 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 유효성 검사
    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 토큰 확인
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: '유효하지 않거나 만료된 링크입니다.' },
        { status: 400 }
      );
    }

    // 토큰 만료 확인
    if (new Date() > resetToken.expires) {
      // 만료된 토큰 삭제
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: '링크가 만료되었습니다. 비밀번호 찾기를 다시 진행해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 비밀번호 해시 및 업데이트
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 사용된 토큰 삭제
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({
      message: '비밀번호가 성공적으로 변경되었습니다.',
    });
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    return NextResponse.json(
      { error: '비밀번호 재설정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 토큰 유효성 확인 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: '토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: '유효하지 않은 링크입니다.' },
        { status: 400 }
      );
    }

    if (new Date() > resetToken.expires) {
      return NextResponse.json(
        { valid: false, error: '링크가 만료되었습니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('토큰 확인 오류:', error);
    return NextResponse.json(
      { error: '토큰 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
