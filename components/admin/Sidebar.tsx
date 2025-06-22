'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiTag,
  FiBarChart2,
  FiSettings,
  FiDatabase,
} from 'react-icons/fi'

const navigation = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: <FiHome className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: <FiSettings className="h-5 w-5" />,
  },
  {
    title: 'Data Mode',
    href: '/admin/data-mode',
    icon: <FiDatabase className="h-5 w-5" />,
  },
  {
    title: 'Catalog',
    href: '/admin/catalog',
    icon: <FiPackage className="h-5 w-5" />,
  },
  {
    title: 'Sales',
    href: '/admin/sales',
    icon: <FiShoppingCart className="h-5 w-5" />,
  },
  {
    title: 'Marketing',
    href: '/admin/marketing',
    icon: <FiTag className="h-5 w-5" />,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: <FiBarChart2 className="h-5 w-5" />,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div
                  className={`mr-3 ${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                >
                  {item.icon}
                </div>
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 