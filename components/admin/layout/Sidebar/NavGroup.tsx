'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiChevronRight } from 'react-icons/fi'

type NavGroupProps = {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  isOpen: boolean
  expanded: boolean
  onToggle: () => void
}

export function NavGroup({ icon, title, children, isOpen, expanded, onToggle }: NavGroupProps) {
  return (
    <div className='overflow-hidden mb-3'>
      <button
        onClick={onToggle}
        className='w-full flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm'
      >
        <div className='flex items-center space-x-3'>
          <span className='text-lg text-primary-600 dark:text-primary-400'>{icon}</span>
          {isOpen && <span className='font-medium'>{title}</span>}
        </div>
        {isOpen &&
          (expanded ? (
            <FiChevronDown className='transition-transform duration-200 text-gray-500' />
          ) : (
            <FiChevronRight className='transition-transform duration-200 text-gray-500' />
          ))}
      </button>

      {isOpen && (
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='mt-1.5 space-y-0.5'
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
