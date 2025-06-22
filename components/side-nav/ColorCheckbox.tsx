import { Check } from 'lucide-react'

interface ColorCheckboxProps {
  color: string
  isChecked: boolean
  onChange: () => void
}

export default function ColorCheckbox({
  color,
  isChecked,
  onChange,
}: ColorCheckboxProps) {
  return (
    <div className='flex items-center gap-3 cursor-pointer' onClick={onChange}>
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          isChecked ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'
        }`}
      >
        {isChecked && <Check className='w-3 h-3 text-white' />}
      </div>
      <span className='text-gray-600 hover:text-blue-600'>{color}</span>
    </div>
  )
}
