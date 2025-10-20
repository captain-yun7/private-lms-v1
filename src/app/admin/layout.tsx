import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 로그인 여부 확인
  if (!session?.user) {
    redirect('/login?callbackUrl=/admin');
  }

  // 관리자 권한 확인
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
