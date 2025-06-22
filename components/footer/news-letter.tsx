'use client'

export default function Newsletter() {
  return (
    <div className='w-full md:w-1/2 bg-gray-800 p-5 rounded-2xl shadow-lg'>
      <form
        action='/toolset/emailsignup.cfm'
        method='post'
        className='space-y-3'
      >
        <h2 className='text-xl font-semibold text-gray-100'>
          {' '}
          {/* Changed from h3 to h2 */}
          Subscribe for Newsletter
        </h2>
        <p className='text-sm text-gray-400'>
          Stay updated with the latest trends and offers in your inbox.
        </p>
        <div className='flex items-center bg-gray-700 rounded-lg overflow-hidden shadow-md'>
          <input
            type='email'
            name='emailSubscription'
            placeholder='Enter your email'
            required
            className='w-full px-4 py-2 text-white bg-transparent focus:outline-none'
          />
          <button
            type='submit'
            className='px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-r-lg transition-all'
          >
            Subscribe
          </button>
        </div>
      </form>
    </div>
  )
}
