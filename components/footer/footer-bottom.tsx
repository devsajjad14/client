'use client'

export default function FooterBottom() {
  return (
    <div className='text-center text-sm text-gray-400 mt-10 border-t border-gray-700 pt-6'>
      <p>&copy; {new Date().getFullYear()} Celerant. All rights reserved.</p>
    </div>
  )
}
