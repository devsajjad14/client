'use client'

import { motion } from 'framer-motion'

export default function Loader() {
  return (
    <motion.div
      className='w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
    />
  )
}
