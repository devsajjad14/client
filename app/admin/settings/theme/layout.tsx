import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Theme Settings | Admin Dashboard',
  description: 'Customize your store\'s appearance, layout, and display settings. Manage banners, products per page, and various display options.',
}

export default function ThemeSettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 