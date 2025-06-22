import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  trend?: 'up' | 'down'
}

export function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        {icon && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {trend === 'up' ? (
            <FiTrendingUp className="text-green-500" />
          ) : (
            <FiTrendingDown className="text-red-500" />
          )}
          <span className={`text-sm font-medium ml-2 ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">vs last month</span>
        </div>
      )}
    </div>
  )
} 