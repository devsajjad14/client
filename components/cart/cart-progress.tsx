import { CheckIcon } from '@heroicons/react/24/solid'

export default function CartProgress({ step }: { step: number }) {
  return (
    <nav className='flex items-center justify-center' aria-label='Progress'>
      <ol className='flex items-center space-x-5'>
        {['Cart', 'Details', 'Payment', 'Review'].map((item, i) => (
          <li key={item}>
            {i + 1 < step ? (
              <div className='flex items-center'>
                <span className='flex h-9 items-center'>
                  <span className='relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600'>
                    <CheckIcon className='h-5 w-5 text-white' />
                  </span>
                </span>
                <span className='ml-3 text-sm font-medium text-blue-600'>
                  {item}
                </span>
              </div>
            ) : i + 1 === step ? (
              <div className='flex items-center' aria-current='step'>
                <span className='flex h-9 items-center' aria-hidden='true'>
                  <span className='relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white'>
                    <span className='h-2.5 w-2.5 rounded-full bg-blue-600' />
                  </span>
                </span>
                <span className='ml-3 text-sm font-medium text-blue-600'>
                  {item}
                </span>
              </div>
            ) : (
              <div className='flex items-center'>
                <span className='flex h-9 items-center' aria-hidden='true'>
                  <span className='relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white'>
                    <span className='h-2.5 w-2.5 rounded-full bg-transparent' />
                  </span>
                </span>
                <span className='ml-3 text-sm font-medium text-gray-500'>
                  {item}
                </span>
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
