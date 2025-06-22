'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiUpload, FiFileText, FiCheckCircle, FiDatabase, FiX } from 'react-icons/fi'

interface DataImporterProps {
  onImport?: (file: File) => void
  maxFileSize?: number // in MB
  acceptedFormats?: string[]
}

export function DataImporter({ 
  onImport, 
  maxFileSize = 50, 
  acceptedFormats = ['.json', '.csv'] 
}: DataImporterProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (file: File) => {
    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`File size must be less than ${maxFileSize}MB`)
      return
    }
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedFormats.includes(fileExtension)) {
      alert(`Please upload a ${acceptedFormats.join(' or ')} file`)
      return
    }
    
    setSelectedFile(file)
  }

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return
    
    setIsImporting(true)
    setImportProgress(0)
    
    // Simulate import progress
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsImporting(false)
          onImport?.(selectedFile)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setImportProgress(0)
    setIsImporting(false)
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <FiUpload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Data Importer
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Upload JSON or CSV files to import data
            </p>
          </div>
        </div>

        {/* File Upload Area */}
        <div className="mb-6">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive
                ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
          >
            <FiFileText className={`w-12 h-12 mx-auto mb-4 transition-colors ${
              dragActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`} />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop your files here, or{' '}
              <label className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                browse
                <input
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Supports {acceptedFormats.join(', ')} formats up to {maxFileSize}MB
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
            <div className="flex items-center justify-between">
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
              <button
                onClick={removeFile}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
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
          disabled={!selectedFile || isImporting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
        >
          <FiDatabase className="w-5 h-5 inline mr-2" />
          {isImporting ? 'Importing...' : 'Import to Database'}
        </button>
      </div>
    </div>
  )
} 