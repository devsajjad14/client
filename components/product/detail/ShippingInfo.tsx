interface ShippingInfoProps {
  zipCode: string
  onZipCodeChange: (zip: string) => void
  onCheckZipCode: () => void
}

export function ShippingInfo({
  zipCode,
  onZipCodeChange,
  onCheckZipCode,
}: ShippingInfoProps) {
  const isValidZip = zipCode.length === 5 && /^\d+$/.test(zipCode)

  return (
    <div className='p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/70 shadow-sm backdrop-blur-sm mb-6 overflow-hidden relative'>
      {/* Decorative elements */}
      <div className='absolute -right-10 -top-10 w-32 h-32 rounded-full bg-green-200/20 blur-xl' />
      <div className='absolute -left-5 -bottom-5 w-20 h-20 rounded-full bg-blue-200/20 blur-xl' />

      <div className='flex items-start gap-4 relative z-10'>
        <div className='bg-gradient-to-br from-green-100 to-green-50 p-3 rounded-xl border border-green-200/50 shadow-inner'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6 text-green-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={1.5}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
            />
          </svg>
        </div>

        <div className='flex-1'>
          <h4 className='font-medium text-base mb-1.5 text-gray-900 flex items-center gap-2'>
            Free Shipping
            <span className='text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full'>
              Fast Delivery
            </span>
          </h4>
          <p className='text-sm text-gray-600 mb-3'>
            Arrives in <span className='font-semibold'>3-5 business days</span>
          </p>

          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <input
                type='text'
                placeholder='Enter ZIP Code'
                className='text-sm px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full transition-all duration-200 shadow-sm hover:shadow-md'
                value={zipCode}
                onChange={(e) =>
                  onZipCodeChange(e.target.value.replace(/\D/g, ''))
                }
                maxLength={5}
                pattern='\d{5}'
                inputMode='numeric'
              />
              {zipCode && (
                <button
                  onClick={() => onZipCodeChange('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              )}
            </div>

            <button
              className={`text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                isValidZip
                  ? 'bg-gradient-to-br from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              onClick={onCheckZipCode}
              disabled={!isValidZip}
            >
              Check
            </button>
          </div>

          {isValidZip && (
            <p className='text-xs text-green-600 mt-2 animate-fadeIn'>
              ✓ Valid ZIP code format
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
