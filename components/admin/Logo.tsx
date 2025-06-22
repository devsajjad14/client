import { motion } from 'framer-motion'
import Link from 'next/link'

type LogoProps = {
  className?: string
  compact?: boolean
}

export function Logo({ className = '', compact = false }: LogoProps) {
  return (
    <Link href='/admin' className={`flex items-center ${className}`}>
      {compact ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center'
        >
          <span className='text-white font-bold text-sm'>AP</span>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex items-center space-x-2'
        >
          <div className='w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center'>
            <span className='text-white font-bold text-sm'>AP</span>
          </div>
          <span className='font-bold whitespace-nowrap'>Admin Panel</span>
        </motion.div>
      )}
    </Link>
  )
}
