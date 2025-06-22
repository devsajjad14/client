'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function SeedDataPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/seed/create', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Failed to create demo data')
      }

      toast.success('Demo data created successfully')
    } catch (error) {
      toast.error('Failed to create demo data')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/seed/delete', {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete demo data')
      }

      toast.success('Demo data deleted successfully')
    } catch (error) {
      toast.error('Failed to delete demo data')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Demo Data Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Create or delete demo data for testing
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Data Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Create Demo Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Generate sample products, categories, and other demo data
          </p>
          <button
            onClick={handleCreateData}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Data'}
          </button>
        </motion.div>

        {/* Delete Data Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Delete Demo Data
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Remove all demo data from the database
          </p>
          <button
            onClick={handleDeleteData}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting...' : 'Delete Data'}
          </button>
        </motion.div>
      </div>
    </div>
  )
} 