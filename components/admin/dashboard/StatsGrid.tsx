'use client'

import { motion } from 'framer-motion'
import {
  FiTrendingUp,
  FiDollarSign,
  FiUsers,
  FiShoppingBag,
} from 'react-icons/fi'
import { useEffect, useState } from 'react'

interface Stats {
  totalRevenue: number
  totalUsers: number
  totalOrders: number
  lowStockItems: number
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
}

export function StatsGrid() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/dashboard/stats')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className='bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border shadow-sm animate-pulse'
          >
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4'></div>
            <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4'></div>
          </div>
        ))}
      </div>
    )
  }

  const statsData = [
    {
      title: 'Total Revenue',
      value: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(stats.totalRevenue),
      change: '+12.5%',
      icon: <FiDollarSign className='text-blue-500' size={20} />,
      color: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'border-blue-100 dark:border-blue-900/50',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: '+8.2%',
      icon: <FiUsers className='text-green-500' size={20} />,
      color: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-100 dark:border-green-900/50',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: '+3.7%',
      icon: <FiShoppingBag className='text-purple-500' size={20} />,
      color: 'bg-purple-50 dark:bg-purple-900/30',
      borderColor: 'border-purple-100 dark:border-purple-900/50',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toLocaleString(),
      change: '+1.2%',
      icon: <FiTrendingUp className='text-orange-500' size={20} />,
      color: 'bg-orange-50 dark:bg-orange-900/30',
      borderColor: 'border-orange-100 dark:border-orange-900/50',
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {statsData.map((stat, i) => (
        <motion.div
          key={stat.title}
          custom={i}
          initial='hidden'
          animate='visible'
          variants={itemVariants}
          className={`${stat.color} ${stat.borderColor} p-6 rounded-xl border shadow-sm`}
        >
          <div className='flex justify-between'>
            <div>
              <p className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                {stat.title}
              </p>
              <p className='mt-1 text-2xl font-semibold text-gray-900 dark:text-white'>
                {stat.value}
              </p>
            </div>
            <div className='h-10 w-10 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-xs'>
              {stat.icon}
            </div>
          </div>
          <p
            className={`mt-3 text-sm ${
              stat.change.startsWith('+')
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            <span className='font-medium'>{stat.change}</span> vs last month
          </p>
        </motion.div>
      ))}
    </div>
  )
}
