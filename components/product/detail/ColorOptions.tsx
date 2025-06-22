import Image from 'next/image'

interface ColorOption {
  id: string
  name: string
  hex: string
  image: string | null
  hasImage: boolean
  isOutOfStock: boolean
}

type ColorDisplayType = 'image' | 'select' | 'swatches' | 'color-box'

interface ColorOptionsProps {
  options: ColorOption[]
  selectedColor: string | null
  onSelectColor: (color: string | null) => void
  displayColorsAs: ColorDisplayType
}

export function ColorOptions({
  options,
  selectedColor = null,
  onSelectColor,
  displayColorsAs = 'swatches',
}: ColorOptionsProps) {
  const handleColorClick = (colorName: string, isOutOfStock: boolean) => {
    if (isOutOfStock) return

    if (selectedColor === colorName) {
      onSelectColor(null)
    } else {
      onSelectColor(colorName)
    }
  }

  // Handle select dropdown display
  if (displayColorsAs === 'select') {
    return (
      <div className='mb-6'>
        <label
          htmlFor='color-select'
          className='text-sm font-medium mb-3 block'
        >
          Color
        </label>
        <select
          id='color-select'
          className='w-full p-3 border border-gray-200 rounded-none shadow-sm focus:ring-black focus:border-black'
          value={selectedColor || ''}
          onChange={(e) => onSelectColor(e.target.value || null)}
        >
          <option value=''>Select a color</option>
          {options.map((color) => (
            <option
              key={color.id}
              value={color.name}
              disabled={color.isOutOfStock}
              className={color.isOutOfStock ? 'text-gray-400' : ''}
            >
              {color.name} {color.isOutOfStock && '(Out of Stock)'}
            </option>
          ))}
        </select>
      </div>
    )
  }

  // Handle image display
  if (displayColorsAs === 'image' && options.some((c) => c.hasImage)) {
    return (
      <div className='mb-8'>
        <h3 className='text-sm font-medium mb-3'>
          Color:{' '}
          <span className='font-normal'>{selectedColor || 'Not selected'}</span>
        </h3>
        <div className='flex flex-wrap gap-3'>
          {options.map((color) => {
            if (!color.hasImage) return null
            const isSelected = selectedColor === color.name

            return (
              <button
                key={`color-${color.id}`}
                className={`relative transition-all duration-200 ${
                  color.isOutOfStock
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-lg cursor-pointer'
                } ${isSelected ? 'shadow-lg ring-2 ring-black' : 'shadow-md'}`}
                onClick={() => handleColorClick(color.name, color.isOutOfStock)}
                style={{ width: '80px', height: '80px' }}
                title={
                  color.isOutOfStock
                    ? `${color.name} (Out of Stock)`
                    : color.name
                }
                disabled={color.isOutOfStock}
              >
                <Image
                  src={color.image!}
                  alt={color.name}
                  width={80}
                  height={80}
                  className={`w-full h-full object-cover ${
                    color.isOutOfStock ? 'grayscale' : ''
                  }`}
                />

                {color.isOutOfStock && (
                  <div className='absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-8 w-8 text-red-600'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}

                {isSelected && !color.isOutOfStock && (
                  <div className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-6 w-6 text-white'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Handle swatches or color-box display
  const showSwatches =
    displayColorsAs === 'swatches' ||
    (displayColorsAs === 'image' && options.some((c) => c.hex))

  return (
    <div className='mb-8'>
      <h3 className='text-sm font-medium mb-3'>
        Color:{' '}
        <span className='font-normal'>{selectedColor || 'Not selected'}</span>
      </h3>
      <div className='flex flex-wrap gap-3'>
        {options.map((color) => {
          const isSelected = selectedColor === color.name
          const hasHex = color.hex && color.hex !== '#'

          return (
            <button
              key={`color-${color.id}`}
              className={`relative px-4 py-3 transition-all duration-200 flex items-center justify-center ${
                color.isOutOfStock
                  ? 'opacity-60 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-lg'
              } ${
                isSelected && !color.isOutOfStock
                  ? 'bg-black text-black shadow-lg'
                  : 'bg-white text-gray-800 shadow-md'
              } ${showSwatches && hasHex ? '' : 'min-w-[100px]'}`}
              onClick={() => handleColorClick(color.name, color.isOutOfStock)}
              style={{
                backgroundColor: showSwatches && hasHex ? color.hex : '#ffffff',
              }}
              title={
                color.isOutOfStock ? `${color.name} (Out of Stock)` : color.name
              }
              disabled={color.isOutOfStock}
            >
              {(!showSwatches || !hasHex) && (
                <span className='text-sm font-medium'>
                  {color.name.length > 12
                    ? `${color.name.substring(0, 10)}...`
                    : color.name}
                </span>
              )}

              {color.isOutOfStock && (
                <div className='absolute inset-0 flex items-center justify-center'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6 text-red-600'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              )}

              {isSelected && !color.isOutOfStock && (
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4 ml-1'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
