'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiRefreshCw, 
  FiSettings, 
  FiClock, 
  FiBarChart, 
  FiTrendingUp,
  FiToggleRight,
  FiToggleLeft,
  FiFolder,
  FiChevronRight,
  FiCheck,
  FiZap,
  FiShield,
  FiActivity
} from 'react-icons/fi'

interface AutoSyncProps {
  onSyncToggle?: (enabled: boolean) => void
  onIntervalChange?: (interval: number) => void
  onFolderSelect?: (folderPath: string) => void
}

export function AutoSync({ onSyncToggle, onIntervalChange, onFolderSelect }: AutoSyncProps) {
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(false)
  const [syncInterval, setSyncInterval] = useState(30)
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [isSelectingFolder, setIsSelectingFolder] = useState(false)

  const handleSyncToggle = (enabled: boolean) => {
    setIsAutoSyncEnabled(enabled)
    onSyncToggle?.(enabled)
  }

  const handleIntervalChange = (interval: number) => {
    setSyncInterval(interval)
    onIntervalChange?.(interval)
  }

  const handleFolderSelect = () => {
    setIsSelectingFolder(true)
    // Simulate folder selection
    setTimeout(() => {
      const mockFolderPath = '/data/sync-folder'
      setSelectedFolder(mockFolderPath)
      setIsSelectingFolder(false)
      onFolderSelect?.(mockFolderPath)
    }, 1500)
  }

  const clearFolderSelection = () => {
    setSelectedFolder('')
    onFolderSelect?.('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden"
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-teal-50/50 dark:from-green-900/20 dark:via-emerald-900/10 dark:to-teal-900/20"></div>
      
      {/* Animated Border */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-400/20 via-emerald-400/20 to-teal-400/20 animate-pulse"></div>
      
      <div className="relative p-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="relative">
            <div className="p-4 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-2xl shadow-lg">
              <FiRefreshCw className="w-7 h-7 text-white" />
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-700 dark:from-white dark:via-green-200 dark:to-emerald-300 bg-clip-text text-transparent">
              Auto Sync
            </h2>
            <div className="mt-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <FiFolder className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Source Location
                  </span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-inner">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {selectedFolder || 'No folder selected'}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFolderSelect}
                  disabled={isSelectingFolder}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  {isSelectingFolder ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Selecting...</span>
                    </>
                  ) : (
                    <>
                      <FiFolder className="w-4 h-4" />
                      <span>Browse</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Selected Folder Display */}
        <AnimatePresence>
          {selectedFolder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200/50 dark:border-green-800/50 rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <FiFolder className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-green-800 dark:text-green-200 text-lg">
                      Active Sync Location
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-mono bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded">
                      {selectedFolder}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/50 rounded-full">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-green-500 rounded-full"
                    />
                    <span className="text-xs font-bold text-green-700 dark:text-green-300">
                      MONITORING
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFolderSelection}
                    className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors font-medium"
                  >
                    Change
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          {/* Sync Toggle */}
          <div className="p-5 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700/50 dark:to-slate-700/50 rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <FiSettings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    Enable Auto Sync
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically sync data from selected folder
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSyncToggle(!isAutoSyncEnabled)}
                disabled={!selectedFolder}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 shadow-lg ${
                  isAutoSyncEnabled 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/50' 
                    : selectedFolder 
                      ? 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500' 
                      : 'bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                }`}
              >
                <motion.span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                    isAutoSyncEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                  layout
                />
              </motion.button>
            </div>
          </div>

          {/* Sync Interval */}
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <FiClock className="w-4 h-4 text-white" />
              </div>
              <label className="text-lg font-bold text-gray-900 dark:text-white">
                Sync Interval
              </label>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="range"
                  min="5"
                  max="120"
                  value={syncInterval}
                  onChange={(e) => handleIntervalChange(Number(e.target.value))}
                  disabled={!selectedFolder}
                  className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>5m</span>
                  <span>120m</span>
                </div>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {syncInterval}m
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400">interval</p>
              </div>
            </div>
          </div>

          {/* Sync Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200/50 dark:border-blue-800/50 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <FiClock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-blue-800 dark:text-blue-200">
                      Last Sync
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {selectedFolder ? '2 minutes ago' : 'No folder selected'}
                    </p>
                  </div>
                </div>
                {selectedFolder && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-green-500 rounded-full shadow-lg"
                  />
                )}
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-800/50 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <FiBarChart className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-purple-800 dark:text-purple-200">
                      Sync Statistics
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      {selectedFolder ? '1,247 records synced today' : 'No sync data available'}
                    </p>
                  </div>
                </div>
                {selectedFolder && (
                  <FiTrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </motion.div>
  )
} 