'use client'

import Link from 'next/link'

export default function FooterLinks() {
  const links = [
    {
      title: 'Customer Service',
      items: [
        { label: 'Your Account', href: '/usermanagement/manageacct.cfm' },
        { label: 'Contact Us', href: '/info/contact-us' },
        { label: 'Gift Cards', href: '/giftcard.cfm' },
      ],
    },
    {
      title: 'Information',
      items: [
        { label: 'Terms and Conditions', href: '/info/terms-and-conditions' },
        { label: 'Visit Our Blog', href: '/blog/' },
      ],
    },
    {
      title: 'Company Info',
      items: [
        { label: 'About Us', href: '/info/about-us' },
        { label: 'Careers', href: '/info/careers' },
      ],
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-gray-300'>
      {links.map((section, index) => (
        <div key={index}>
          <h3 className='text-lg font-semibold mb-3 text-gray-100'>
            {section.title}
          </h3>
          <ul className='space-y-2'>
            {section.items.map((item, idx) => (
              <li key={idx}>
                <Link
                  href={item.href}
                  className='hover:text-gray-50 transition'
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
