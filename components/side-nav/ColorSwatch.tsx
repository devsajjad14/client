import { Check } from 'lucide-react'

interface ColorSwatchProps {
  color: string
  hex: string
  isChecked: boolean
  onChange: () => void
}

export default function ColorSwatch({
  color,
  hex,
  isChecked,
  onChange,
}: ColorSwatchProps) {
  return (
    <div
      className='w-8 h-8 rounded-full cursor-pointer border-2 border-gray-200 hover:border-blue-500 relative'
      style={{ backgroundColor: hex }}
      onClick={onChange}
      title={color}
    >
      {isChecked && (
        <div className='absolute top-0 right-0 bg-blue-600 w-4 h-4 rounded-full flex items-center justify-center'>
          <Check className='w-3 h-3 text-white' />
        </div>
      )}
    </div>
  )
}
