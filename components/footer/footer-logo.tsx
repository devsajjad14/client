'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function FooterLogo() {
  return (
    <div className='flex items-center space-x-4'>
      <Link href='/'>
        <Image
          src='/images/site/logo.svg'
          alt='Logo Footer'
          width={100}
          height={100}
          className='drop-shadow-lg transition-transform duration-300 hover:scale-105 filter brightness-0 invert'
        />
      </Link>
    </div>
  )
}
