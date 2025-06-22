import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function StockIndicator({
  maxQuantity,
  currentQuantity,
}: {
  maxQuantity: number
  currentQuantity: number
}) {
  const stockPercentage = (currentQuantity / maxQuantity) * 100

  let stockClass = ''
  let text = ''

  if (stockPercentage > 50) {
    stockClass = 'bg-green-100 text-green-800'
    text = 'In Stock'
  } else if (stockPercentage > 10) {
    stockClass = 'bg-yellow-100 text-yellow-800'
    text = 'Low Stock'
  } else {
    stockClass = 'bg-red-100 text-red-800'
    text = 'Almost Gone'
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stockClass}`}
    >
      {stockPercentage <= 10 && (
        <ExclamationTriangleIcon className='mr-1 h-3 w-3' />
      )}
      {text}
    </span>
  )
}
