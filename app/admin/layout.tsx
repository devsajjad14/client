import { Metadata } from 'next'
import AdminLayoutClient from './components/AdminLayoutClient'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your store settings, products, orders, and more from the admin dashboard.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
