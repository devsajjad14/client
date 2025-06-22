'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/admin/layout/Sidebar';
import AdminHeader from './AdminHeader';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === '/admin/login') {
      return;
    }

    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // If we're on the login page, just render the children
  if (pathname === '/admin/login') {
    return children;
  }

  // For all other admin pages, check authentication
  const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
  if (!isAuthenticated) {
    return null; // This will briefly show while redirecting
  }

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-6 py-8 min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 