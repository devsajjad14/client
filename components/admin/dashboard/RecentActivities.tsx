'use client'

import { FiCheckCircle, FiAlertCircle, FiClock, FiPlus } from 'react-icons/fi'

const activities = [
  {
    id: 1,
    type: 'success',
    title: 'New order received',
    description: 'Order #ORD-1024 from John Smith',
    time: '2 min ago',
    icon: <FiCheckCircle className='text-green-500' />,
  },
  {
    id: 2,
    type: 'warning',
    title: 'Payment pending',
    description: 'Invoice #INV-2058 from Jane Doe',
    time: '15 min ago',
    icon: <FiClock className='text-yellow-500' />,
  },
  {
    id: 3,
    type: 'error',
    title: 'Order canceled',
    description: 'Order #ORD-1023 was canceled',
    time: '1 hour ago',
    icon: <FiAlertCircle className='text-red-500' />,
  },
  {
    id: 4,
    type: 'info',
    title: 'New customer registered',
    description: 'Michael Johnson joined',
    time: '2 hours ago',
    icon: <FiPlus className='text-blue-500' />,
  },
  {
    id: 5,
    type: 'success',
    title: 'Order completed',
    description: 'Order #ORD-1022 has been delivered',
    time: '3 hours ago',
    icon: <FiCheckCircle className='text-green-500' />,
  },
  {
    id: 6,
    type: 'warning',
    title: 'Low stock alert',
    description: 'Premium Headphones stock below threshold',
    time: '4 hours ago',
    icon: <FiClock className='text-yellow-500' />,
  },
  {
    id: 7,
    type: 'info',
    title: 'New product added',
    description: 'Wireless Mouse added to inventory',
    time: '5 hours ago',
    icon: <FiPlus className='text-blue-500' />,
  },
  {
    id: 8,
    type: 'success',
    title: 'Payment received',
    description: 'Payment for Order #ORD-1021 received',
    time: '6 hours ago',
    icon: <FiCheckCircle className='text-green-500' />,
  },
  {
    id: 9,
    type: 'error',
    title: 'Failed payment',
    description: 'Payment failed for Order #ORD-1020',
    time: '7 hours ago',
    icon: <FiAlertCircle className='text-red-500' />,
  },
  {
    id: 10,
    type: 'info',
    title: 'Price update',
    description: 'Mechanical Keyboard price updated',
    time: '8 hours ago',
    icon: <FiPlus className='text-blue-500' />,
  },
  {
    id: 11,
    type: 'success',
    title: 'Bulk order received',
    description: 'Order #ORD-1019 from Tech Solutions Inc.',
    time: '9 hours ago',
    icon: <FiCheckCircle className='text-green-500' />,
  },
  {
    id: 12,
    type: 'warning',
    title: 'Shipping delay',
    description: 'Delay in shipping Order #ORD-1018',
    time: '10 hours ago',
    icon: <FiClock className='text-yellow-500' />,
  },
]

export function RecentActivities() {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 h-full'>
      <div className='flex justify-between items-center mb-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Recent Activities
        </h3>
        <button className='text-sm text-blue-600 dark:text-blue-400 hover:underline'>
          View All
        </button>
      </div>

      <div className='space-y-4'>
        {activities.map((activity) => (
          <div key={activity.id} className='flex items-start'>
            <div className='mt-1 mr-3 text-lg'>{activity.icon}</div>
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-gray-900 dark:text-white'>
                {activity.title}
              </h4>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {activity.description}
              </p>
              <p className='text-xs text-gray-400 dark:text-gray-500 mt-1'>
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
