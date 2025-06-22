'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FiUpload, 
  FiDatabase, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle,
  FiClock,
  FiRefreshCw,
  FiToggleRight,
  FiToggleLeft,
  FiSettings,
  FiBarChart,
  FiTrendingUp,
  FiShield,
  FiZap
} from 'react-icons/fi'
import { AutoSync } from '../../../../components/admin/data-manager/AutoSync'

export default function DataManagerImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleImport = () => {
    // Simulate import progress
    setImportProgress(0)
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Data Manager
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Advanced data import and synchronization tools
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
                Coming in Next Build
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <FiClock className="w-4 h-4" />
                <span className="text-sm">v2.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Data Importer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <FiUpload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Instant Data Importer
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Upload JSON or CSV files to import data
                  </p>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <FiFileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop your files here, or{' '}
                    <label className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                      browse
                      <input
                        type="file"
                        accept=".json,.csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Supports JSON and CSV formats up to 50MB
                  </p>
                </div>
              </div>

              {/* File Info */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Import Progress */}
              {importProgress > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Importing data...
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {importProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${importProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Import Button */}
              <button
                onClick={handleImport}
                disabled={!selectedFile || importProgress > 0}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                <FiDatabase className="w-5 h-5 inline mr-2" />
                Import to Database
              </button>
            </div>
          </motion.div>

          {/* Auto Sync Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AutoSync />
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
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
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-lg w-fit mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  )
} 