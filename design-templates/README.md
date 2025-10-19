# Design Templates

Private LMS 프로젝트의 디자인 템플릿 모음입니다.

## 📁 파일 목록

### 🆕 LiveKlass-Inspired (추천)
**파일**: `liveklass-inspired.html`, `liveklass-style.css`

**특징**:
- 모던하고 깔끔한 디자인
- Indigo/Purple 계열의 Primary 컬러 (#6366F1)
- 큰 타이포그래피와 넓은 여백
- 부드러운 그라데이션과 섀도우
- 모바일 우선 반응형 디자인
- Sticky 헤더 (스크롤 시 고정)
- 호버 효과와 부드러운 애니메이션

**색상 팔레트**:
- Primary: #6366F1 (Indigo)
- Secondary: #10B981 (Green)
- Accent: #F59E0B (Amber)
- Background: #FFFFFF, #F9FAFB
- Text: #111827, #6B7280

**사용 방법**:
```bash
# 브라우저에서 열기
open liveklass-inspired.html
# 또는
python3 -m http.server 8000
# http://localhost:8000/liveklass-inspired.html 접속
```

---

### 기존 템플릿들

#### 1. index.html
- 기본 템플릿

#### 2. modern-minimal.html
- 미니멀한 디자인

#### 3. modern-sophisticated.html
- 세련된 모던 디자인

#### 4. colorful-gradient.html
- 컬러풀한 그라데이션 스타일

#### 5. premium-dark.html
- 다크 모드 프리미엄 스타일

#### 6. classic-business.html
- 클래식한 비즈니스 스타일

#### 7. wework-inspired.html
- WeWork 스타일

---

## 🎨 디자인 시스템 (LiveKlass-Inspired 기준)

### Typography
```css
h1: 2.5rem ~ 4rem (clamp 사용)
h2: 2.5rem
h3: 1.5rem
body: 1rem
small: 0.875rem
```

### Spacing
```css
xs: 0.5rem
sm: 1rem
md: 1.5rem
lg: 2rem
xl: 3rem
2xl: 4rem
3xl: 6rem
```

### Border Radius
```css
sm: 0.375rem
md: 0.5rem
lg: 0.75rem
xl: 1rem
2xl: 1.5rem
```

### Shadows
- sm: 미세한 그림자
- md: 일반 카드 그림자
- lg: 호버 시 그림자
- xl: 강조 그림자

---

## 🚀 Next.js 프로젝트로 이전하기

### 1. TailwindCSS 변환
CSS 변수를 TailwindCSS 설정으로 변환:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#818CF8',
        },
        secondary: '#10B981',
        accent: '#F59E0B',
      },
    },
  },
}
```

### 2. 컴포넌트 분리
HTML을 React 컴포넌트로 분리:
- `Header.tsx` - 네비게이션
- `Hero.tsx` - 히어로 섹션
- `Features.tsx` - 특징 섹션
- `CourseCard.tsx` - 강의 카드
- `Footer.tsx` - 푸터

### 3. 페이지 구성
```
app/
├── page.tsx          <- 루트 페이지 (liveklass-inspired.html 기반)
├── layout.tsx        <- 공통 레이아웃
└── components/
    ├── Header.tsx
    ├── Hero.tsx
    ├── Features.tsx
    ├── CourseCard.tsx
    └── Footer.tsx
```

---

## 📱 반응형 브레이크포인트

```css
/* Mobile First */
Mobile: < 768px
Tablet: 768px ~ 1024px
Desktop: > 1024px
Wide: > 1280px
```

---

## 🎯 다음 단계

1. **LiveKlass-Inspired 템플릿 검토**
   - 브라우저에서 열어서 확인
   - 색상, 레이아웃, 타이포그래피 검토
   - 필요한 수정사항 피드백

2. **Next.js 프로젝트로 이전**
   - TailwindCSS 설정
   - 컴포넌트 분리
   - 반응형 최적화

3. **추가 페이지 디자인**
   - 강의 목록 페이지
   - 강의 상세 페이지
   - 로그인/회원가입 페이지
   - 마이페이지

---

## 💡 디자인 참고 사항

### 현대적인 웹 디자인 트렌드
- **큰 타이포그래피**: 임팩트 있는 헤드라인
- **넓은 여백**: 시각적 여유와 집중
- **부드러운 그림자**: 입체감 부여
- **미묘한 그라데이션**: 깊이감 추가
- **Glassmorphism**: 반투명 효과 (헤더)
- **Smooth Animation**: 부드러운 인터랙션

### 색상 사용 원칙
- Primary: 주요 CTA 버튼, 강조
- Secondary: 보조 버튼, 성공 메시지
- Accent: 특별한 요소, 배지
- Gray Scale: 텍스트, 배경, 테두리

---

**작성일**: 2025-01-19
**디자인 베이스**: LiveKlass 스타일
