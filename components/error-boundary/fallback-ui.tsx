'use client'

export default function FallbackUI({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center'>
      <p>Something went wrong.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
        >
          Retry
        </button>
      )}
    </div>
  )
}
