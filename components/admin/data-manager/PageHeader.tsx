'use client'

import { FiClock } from 'react-icons/fi'

interface PageHeaderProps {
  title?: string
  subtitle?: string
  version?: string
}

export function PageHeader({ 
  title = "Data Manager",
  subtitle = "Advanced data import and synchronization tools",
  version = "v2.1.0"
}: PageHeaderProps) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-lg">
              Coming in Next Build
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <FiClock className="w-4 h-4" />
              <span className="text-sm font-medium">{version}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 