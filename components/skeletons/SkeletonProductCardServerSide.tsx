// components/skeletons/SkeletonProductCardServerSide.tsx
import { Card } from '@/components/ui/card'

export default function SkeletonProductCardServerSide() {
  return (
    <Card className='p-0 flex flex-col justify-between overflow-hidden shadow-lg m-2 h-full'>
      <div className='relative w-full aspect-square overflow-hidden p-4 bg-gray-100 animate-pulse'>
        <div className='w-full h-full flex items-center justify-center bg-gray-200 rounded-lg'></div>
      </div>

      <div className='flex flex-col gap-2 p-6'>
        <div className='h-6 w-3/4 bg-gray-200 rounded animate-pulse'></div>
        <div className='h-5 w-1/2 bg-gray-200 rounded animate-pulse'></div>
        <div className='h-4 w-2/3 bg-gray-200 rounded animate-pulse'></div>
      </div>

      <div className='flex justify-center items-center p-6 bg-gray-50 rounded-b-lg'>
        <div className='w-full h-10 bg-gray-200 rounded-lg animate-pulse'></div>
      </div>
    </Card>
  )
}
