'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiDownload, 
  FiDatabase, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle,
  FiClock,
  FiSettings,
  FiBarChart,
  FiTrendingUp,
  FiShield,
  FiZap,
  FiFilter,
  FiCalendar,
  FiGrid,
  FiList,
  FiSearch,
  FiRefreshCw,
  FiPlay,
  FiPause
} from 'react-icons/fi'

export default function DataManagerExportPage() {
  const [selectedTables, setSelectedTables] = useState<string[]>([])
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'xml'>('json')
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [exportMode, setExportMode] = useState<'custom' | 'all' | 'exclude'>('custom')
  const [excludedTables, setExcludedTables] = useState<string[]>([])

  const availableTables = [
    { id: 'products', name: 'Products', count: 1247, lastUpdated: '2 hours ago' },
    { id: 'customers', name: 'Customers', count: 892, lastUpdated: '1 hour ago' },
    { id: 'orders', name: 'Orders', count: 2156, lastUpdated: '30 minutes ago' },
    { id: 'categories', name: 'Categories', count: 45, lastUpdated: '1 day ago' },
    { id: 'brands', name: 'Brands', count: 78, lastUpdated: '2 days ago' },
    { id: 'reviews', name: 'Reviews', count: 3421, lastUpdated: '15 minutes ago' },
    { id: 'inventory', name: 'Inventory', count: 1890, lastUpdated: '5 minutes ago' },
    { id: 'transactions', name: 'Transactions', count: 5678, lastUpdated: '1 minute ago' }
  ]

  const handleTableToggle = (tableId: string) => {
    if (exportMode === 'exclude') {
      setExcludedTables(prev =>
        prev.includes(tableId)
          ? prev.filter(id => id !== tableId)
          : [...prev, tableId]
      )
    } else {
      setSelectedTables(prev =>
        prev.includes(tableId)
          ? prev.filter(id => id !== tableId)
          : [...prev, tableId]
      )
    }
  }

  const handleSelectAll = () => {
    setSelectedTables(availableTables.map(table => table.id))
  }

  const handleClearAll = () => {
    setSelectedTables([])
  }

  const handleExport = () => {
    if (selectedTables.length === 0) return
    
    setIsExporting(true)
    setExportProgress(0)
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExporting(false)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  const filteredTables = availableTables.filter(table =>
    table.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const effectiveSelectedTables =
    exportMode === 'all'
      ? availableTables.map(t => t.id)
      : exportMode === 'exclude'
        ? availableTables.map(t => t.id).filter(id => !excludedTables.includes(id))
        : selectedTables

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
                Advanced data export and synchronization tools
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Export Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Export Settings */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <FiDownload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Export Settings
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure your data export
                  </p>
                </div>
              </div>

              {/* Format Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'json', label: 'JSON', icon: FiFileText },
                    { value: 'csv', label: 'CSV', icon: FiFileText },
                    { value: 'xml', label: 'XML', icon: FiFileText }
                  ].map((format) => (
                    <motion.button
                      key={format.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExportFormat(format.value as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                        exportFormat === format.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <format.icon className="w-5 h-5 mx-auto mb-2" />
                      <span className="text-sm font-medium">{format.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Selection Controls */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Selected Tables ({selectedTables.length})
                  </label>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSelectAll}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Select All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClearAll}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Clear
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Export Progress */}
              {exportProgress > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Exporting data...
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {exportProgress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${exportProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                disabled={selectedTables.length === 0 || isExporting}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <FiDownload className="w-5 h-5" />
                {isExporting ? 'Exporting...' : 'Export Data'}
              </motion.button>
            </div>

            {/* Export Statistics */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Export Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiBarChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Total Records
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {availableTables.reduce((sum, table) => sum + table.count, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Last Export
                    </span>
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    2 hours ago
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tables Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Select Tables
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose which data tables to export
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search tables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* View Mode Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <FiGrid className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <FiList className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Premium Export Mode Options */}
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setExportMode('all'); setExcludedTables([]); setSelectedTables([]); }}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-lg flex items-center gap-3 font-semibold text-lg justify-center ${
                    exportMode === 'all'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-400 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FiCheckCircle className="w-6 h-6" />
                  All Tables
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setExportMode('exclude'); setSelectedTables([]); }}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-lg flex items-center gap-3 font-semibold text-lg justify-center ${
                    exportMode === 'exclude'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FiFilter className="w-6 h-6" />
                  All Tables Except...
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setExportMode('custom'); setExcludedTables([]); setSelectedTables([]); }}
                  className={`flex-1 px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-lg flex items-center gap-3 font-semibold text-lg justify-center ${
                    exportMode === 'custom'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-400 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <FiList className="w-6 h-6" />
                  Custom Selection
                </motion.button>
              </div>

              {/* Tables Grid/List */}
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}>
                {filteredTables.map((table, index) => (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer ${
                      (exportMode === 'all' || (exportMode === 'exclude' && !excludedTables.includes(table.id)) || (exportMode === 'custom' && selectedTables.includes(table.id)))
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white/50 dark:bg-gray-700/50'
                    }`}
                    onClick={() => handleTableToggle(table.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          (exportMode === 'all' || (exportMode === 'exclude' && !excludedTables.includes(table.id)) || (exportMode === 'custom' && selectedTables.includes(table.id)))
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                        }`}>
                          <FiDatabase className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {table.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {table.count.toLocaleString()} records
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Updated
                          </p>
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {table.lastUpdated}
                          </p>
                        </div>
                        {(exportMode === 'all' || (exportMode === 'exclude' && !excludedTables.includes(table.id)) || (exportMode === 'custom' && selectedTables.includes(table.id))) && (
                          <FiCheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {(exportMode === 'exclude' && excludedTables.includes(table.id)) && (
                          <FiAlertCircle className="w-5 h-5 text-red-400" title="Excluded" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 