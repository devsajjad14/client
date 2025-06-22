// components/skeletons/user-button-skeleton.tsx
export function UserButtonSkeleton() {
  return (
    <div className='flex items-center gap-3 py-2 px-4'>
      <div className='w-8 h-8 rounded-full bg-gray-200 animate-pulse' />
      <div className='hidden md:flex flex-col space-y-1'>
        <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
        <div className='h-3 w-24 bg-gray-200 rounded animate-pulse' />
      </div>
    </div>
  )
}
