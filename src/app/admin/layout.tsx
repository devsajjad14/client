'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAdminAuthenticated } from '../../utils/adminAuth';
import AdminHeader from '../../components/admin/AdminHeader';

export default function AdminLayout({
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
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // If we're on the login page, just render the children
  if (pathname === '/admin/login') {
    return children;
  }

  // For all other admin pages, check authentication
  if (!isAdminAuthenticated()) {
    return null; // This will briefly show while redirecting
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 