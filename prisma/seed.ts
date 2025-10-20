import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. 테스트 사용자 생성
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '관리자',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: '김강사',
      password: hashedPassword,
      role: 'STUDENT', // 실제로는 강사 역할이 있어야 함
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: '이학생',
      password: hashedPassword,
      role: 'STUDENT',
    },
  });

  console.log('✅ Created users');

  // 2. 샘플 강의 생성
  const courses = [
    {
      title: '웹 개발 완벽 가이드',
      description: 'HTML, CSS, JavaScript부터 React까지 모던 웹 개발의 모든 것을 배워보세요.',
      price: 99000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      instructorName: '김강사',
      instructorIntro: '10년차 웹 개발자. 네이버, 카카오에서 근무 경험',
      isPublished: true,
    },
    {
      title: 'UI/UX 디자인 기초',
      description: '사용자 중심의 인터페이스 디자인 원칙과 실전 프로젝트',
      price: 79000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
      instructorName: '이디자이너',
      instructorIntro: 'Google, Apple에서 UX 디자이너로 근무',
      isPublished: true,
    },
    {
      title: 'Python 데이터 분석',
      description: 'Pandas, NumPy부터 데이터 시각화까지 완벽 마스터',
      price: 109000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      instructorName: '박데이터',
      instructorIntro: '데이터 사이언티스트 7년차. 삼성전자 AI팀 근무',
      isPublished: true,
    },
    {
      title: 'React Native 모바일 앱 개발',
      description: 'iOS와 Android 앱을 동시에 개발하는 크로스 플랫폼 기술',
      price: 129000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c',
      instructorName: '최모바일',
      instructorIntro: '모바일 앱 개발 전문가. 배달의민족 앱 개발 참여',
      isPublished: true,
    },
    {
      title: '디지털 마케팅 전략',
      description: 'SNS, 콘텐츠, SEO까지 효과적인 온라인 마케팅 기법',
      price: 89000,
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
      instructorName: '정마케터',
      instructorIntro: '디지털 마케팅 15년차. 쿠팡, 무신사 마케팅팀 리드',
      isPublished: true,
    },
  ];

  for (const courseData of courses) {
    const course = await prisma.course.create({
      data: courseData,
    });

    // 각 강의에 영상 추가
    await prisma.video.createMany({
      data: [
        {
          courseId: course.id,
          title: '강의 소개 및 개발 환경 설정',
          description: '강의 전체 개요와 필요한 개발 환경을 설정합니다.',
          vimeoUrl: 'https://vimeo.com/912345678',
          vimeoId: '912345678',
          duration: 720, // 12분
          order: 1,
          isPreview: true,
        },
        {
          courseId: course.id,
          title: '기초 개념 이해하기',
          description: '기본 개념과 핵심 원리를 학습합니다.',
          vimeoUrl: 'https://vimeo.com/912345679',
          vimeoId: '912345679',
          duration: 1800, // 30분
          order: 2,
          isPreview: true,
        },
        {
          courseId: course.id,
          title: '실전 프로젝트 시작',
          description: '배운 내용을 바탕으로 실제 프로젝트를 시작합니다.',
          vimeoUrl: 'https://vimeo.com/912345680',
          vimeoId: '912345680',
          duration: 2400, // 40분
          order: 3,
          isPreview: false,
        },
        {
          courseId: course.id,
          title: '고급 기능 구현',
          description: '심화 내용과 고급 기능을 다룹니다.',
          vimeoUrl: 'https://vimeo.com/912345681',
          vimeoId: '912345681',
          duration: 1920, // 32분
          order: 4,
          isPreview: false,
        },
      ],
    });

    // 강의 자료 추가
    await prisma.courseFile.createMany({
      data: [
        {
          courseId: course.id,
          fileName: `${course.title.replace(/\s+/g, '_')}_notes.pdf`,
          fileUrl: `https://example.com/files/${course.id}/notes.pdf`,
          fileSize: 1024000, // 1MB
        },
        {
          courseId: course.id,
          fileName: `${course.title.replace(/\s+/g, '_')}_examples.zip`,
          fileUrl: `https://example.com/files/${course.id}/examples.zip`,
          fileSize: 2048000, // 2MB
        },
      ],
    });

    console.log(`✅ Created course: ${course.title}`);
  }

  // 3. 샘플 수강 신청 (학생이 일부 강의 구매)
  const enrolledCourse = courses[0]; // 첫 번째 강의
  const createdCourse = await prisma.course.findFirst({
    where: { title: enrolledCourse.title },
  });

  if (createdCourse) {
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: createdCourse.id,
      },
    });

    console.log(`✅ Enrolled student in: ${createdCourse.title}`);
  }

  console.log('🎉 Seeding completed!');
  console.log(`Created 3 users (admin, instructor, student)`);
  console.log(`Created ${courses.length} courses with videos and files`);
  console.log('\n📝 Test credentials:');
  console.log('Admin: admin@example.com / password123');
  console.log('Instructor: instructor@example.com / password123');
  console.log('Student: student@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
