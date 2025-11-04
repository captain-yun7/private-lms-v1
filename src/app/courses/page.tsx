'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  instructorName: string;
  instructorIntro: string;
  studentCount: number;
  videoCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/courses?sort=latest');
      const data = await response.json();

      if (data.courses) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('강의 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 시간 포맷 함수 (초 -> 시간)
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}시간 ${minutes > 0 ? minutes + '분' : ''}`;
    }
    return `${minutes}분`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 text-white py-20 mt-[73px]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                한국해양대학교 김대정 교수
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              해양공학 강의
            </h1>
            <p className="text-lg md:text-xl text-blue-100">
              이론부터 실무까지, 체계적인 해양공학 교육
            </p>
          </div>
        </div>
      </section>


      {/* Courses Grid */}
      <main className="flex-1 bg-bg-light py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              전체 강의 ({courses.length})
            </h2>
            <p className="text-text-secondary">
              체계적인 해양공학 강의를 수강하세요
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Course Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="card-hover group"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-lg mb-4 overflow-hidden bg-gray-100">
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    {/* Video Count */}
                    <div className="flex items-center gap-1 text-sm text-text-secondary">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>{course.videoCount}개 강의</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-text-secondary text-sm line-clamp-2">
                      {course.description}
                    </p>

                    {/* Price */}
                    <div className="pt-2">
                      <span className="text-2xl font-bold text-primary">
                        ₩{course.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State (when no courses) */}
          {!loading && courses.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-2">
                강의가 없습니다
              </h3>
              <p className="text-text-secondary">
                곧 다양한 강의가 추가될 예정입니다
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
