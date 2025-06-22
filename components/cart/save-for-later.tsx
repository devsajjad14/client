'use client'

import { useState } from 'react'
import { BookmarkIcon, BookmarkSlashIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'

interface SaveForLaterProps {
  onSave?: () => void
  onRemove?: () => void
}

export default function SaveForLater({ onSave, onRemove }: SaveForLaterProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleSave = () => {
    if (isAnimating) return

    setIsAnimating(true)
    setTimeout(() => {
      if (isSaved) {
        onRemove?.()
      } else {
        onSave?.()
      }
      setIsSaved(!isSaved)
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div className='mt-4 flex justify-end'>
      <button
        onClick={handleSave}
        className={`flex items-center text-sm font-medium ${
          isSaved ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {isSaved ? (
          <motion.span
            key='saved'
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className='flex items-center'
          >
            <BookmarkSlashIcon className='h-5 w-5 mr-1' />
            Saved for Later
          </motion.span>
        ) : (
          <motion.span
            key='save'
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className='flex items-center'
          >
            <BookmarkIcon className='h-5 w-5 mr-1' />
            Save for Later
          </motion.span>
        )}
      </button>
    </div>
  )
}
