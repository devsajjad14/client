import Loader from './Loader'

export default async function LoadingPage() {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50'>
      <div className='p-6 rounded-lg shadow-md bg-white text-center'>
        {/* Loader */}
        <Loader />

        {/* Loading Text */}
        <p className='text-gray-700 mt-4'>Loading...</p>
      </div>
    </div>
  )
}
