'use client'

import FooterBottom from './footer-bottom'
import FooterLinks from './footer-links'
import FooterLogo from './footer-logo'
import Newsletter from './news-letter'

export default function Footer() {
  return (
    <footer className='bg-gray-900 text-white py-10 shadow-xl'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-col md:flex-row justify-between items-center gap-8'>
          <FooterLogo />
          <Newsletter />
        </div>

        <FooterLinks />
        <FooterBottom />
      </div>
    </footer>
  )
}
