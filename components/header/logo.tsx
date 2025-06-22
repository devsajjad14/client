// components/header/logo.tsx
import Image from 'next/image'
import Link from 'next/link'

export default function Logo() {
  return (
    <Link href='/' className='block' prefetch={false} aria-label='Home'>
      <Image
        src='/images/site/logo.svg'
        alt='Logo'
        width={120}
        height={40}
        priority
        className='w-auto h-20' // Fixed aspect ratio
      />
    </Link>
  )
}
