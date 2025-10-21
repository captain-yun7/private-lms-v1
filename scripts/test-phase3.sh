#!/bin/bash

# Phase 3 테스트 헬퍼 스크립트

echo "🚀 Phase 3 결제 시스템 테스트 가이드"
echo "======================================"
echo ""

# 환경 변수 체크
echo "📋 1. 환경 설정 확인"
echo "-------------------"

if [ -f .env ]; then
    echo "✅ .env 파일 존재"

    if grep -q "NEXT_PUBLIC_TOSS_CLIENT_KEY" .env && grep -q "TOSS_SECRET_KEY" .env; then
        echo "✅ TossPayments 키 설정됨"
        echo "   클라이언트 키: $(grep NEXT_PUBLIC_TOSS_CLIENT_KEY .env | cut -d '=' -f2 | cut -c1-20)..."
        echo "   시크릿 키: $(grep TOSS_SECRET_KEY .env | cut -d '=' -f2 | cut -c1-20)..."
    else
        echo "❌ TossPayments 키가 설정되지 않았습니다"
        echo "   .env 파일에 다음을 추가하세요:"
        echo "   NEXT_PUBLIC_TOSS_CLIENT_KEY=\"test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq\""
        echo "   TOSS_SECRET_KEY=\"test_sk_zXLkKEypNArWmo50nX3lmeaxYG5R\""
        exit 1
    fi
else
    echo "❌ .env 파일이 없습니다"
    echo "   .env.example을 복사하세요: cp .env.example .env"
    exit 1
fi

echo ""
echo "📦 2. 의존성 설치"
echo "-------------------"
if [ -d "node_modules" ]; then
    echo "✅ node_modules 존재"
else
    echo "⚠️  node_modules 없음 - npm install 실행 중..."
    npm install
fi

echo ""
echo "🗄️  3. 데이터베이스 설정"
echo "-------------------"
echo "Prisma 스키마 생성 중..."
npx prisma generate > /dev/null 2>&1
echo "✅ Prisma 클라이언트 생성 완료"

echo ""
echo "🎯 4. 테스트 준비 완료!"
echo "-------------------"
echo ""
echo "다음 명령어로 개발 서버를 실행하세요:"
echo "  npm run dev"
echo ""
echo "그 다음 브라우저에서 http://localhost:3000 접속"
echo ""
echo "📚 상세 테스트 가이드:"
echo "  docs/phase3-testing-guide.md 파일을 참고하세요"
echo ""
echo "🧪 빠른 테스트 시나리오:"
echo "-------------------"
echo ""
echo "1️⃣  카드 결제 테스트:"
echo "   1. 회원가입: http://localhost:3000/register"
echo "   2. 강의 선택: http://localhost:3000/courses"
echo "   3. 결제하기 → 카드 결제 선택"
echo "   4. 테스트 카드번호: 4400000000000008"
echo "   5. 만료일: 2025년 12월, CVC: 123"
echo ""
echo "2️⃣  무통장입금 테스트:"
echo "   1. 강의 선택 → 무통장입금 선택"
echo "   2. 입금 정보 입력 (입금자명, 예정일)"
echo "   3. 관리자로 로그인 (role을 ADMIN으로 변경)"
echo "   4. http://localhost:3000/admin/payments/bank-transfers"
echo "   5. 승인 처리"
echo ""
echo "3️⃣  영수증 확인:"
echo "   1. http://localhost:3000/mypage/payments"
echo "   2. 영수증 보기 클릭"
echo ""
echo "4️⃣  환불 테스트:"
echo "   1. 내 결제 내역에서 환불 신청"
echo "   2. 관리자 페이지: http://localhost:3000/admin/refunds"
echo "   3. 승인/거절 처리"
echo ""
echo "🛠️  유용한 명령어:"
echo "-------------------"
echo "  npx prisma studio    # 데이터베이스 확인 (http://localhost:5555)"
echo "  npm run dev          # 개발 서버 실행"
echo "  npm run build        # 프로덕션 빌드"
echo ""
echo "❓ 문제 발생 시:"
echo "   - 터미널 로그 확인"
echo "   - 브라우저 개발자도구 콘솔 확인"
echo "   - docs/phase3-testing-guide.md의 문제 해결 섹션 참고"
echo ""
echo "✨ 준비 완료! 즐거운 테스트 되세요!"
