'use client'

import { motion } from 'framer-motion'
import { 
  FiShield, 
  FiZap, 
  FiDatabase, 
  FiBarChart,
  FiTrendingUp,
  FiClock,
  FiSettings,
  FiCheckCircle
} from 'react-icons/fi'

interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  color: string
}

const features: Feature[] = [
  {
    icon: FiShield,
    title: "Data Validation",
    description: "Advanced validation rules ensure data integrity",
    color: "from-emerald-500 to-teal-600"
  },
  {
    icon: FiZap,
    title: "Real-time Sync",
    description: "Instant synchronization with webhook support",
    color: "from-yellow-500 to-orange-600"
  },
  {
    icon: FiDatabase,
    title: "Multi-format Support",
    description: "JSON, CSV, XML, and custom formats",
    color: "from-blue-500 to-indigo-600"
  },
  {
    icon: FiBarChart,
    title: "Analytics Dashboard",
    description: "Comprehensive sync analytics and reporting",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: FiTrendingUp,
    title: "Performance Monitoring",
    description: "Real-time performance metrics and alerts",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: FiClock,
    title: "Scheduled Sync",
    description: "Automated sync with custom scheduling",
    color: "from-indigo-500 to-purple-600"
  },
  {
    icon: FiSettings,
    title: "Advanced Configuration",
    description: "Flexible configuration options for complex workflows",
    color: "from-gray-500 to-slate-600"
  },
  {
    icon: FiCheckCircle,
    title: "Data Integrity",
    description: "Ensures data consistency across all operations",
    color: "from-cyan-500 to-blue-600"
  }
]

export function FeaturesGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 * index }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 group"
        >
          <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform duration-200`}>
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {feature.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
} 