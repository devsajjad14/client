// components/header/menu.tsx
import dynamic from 'next/dynamic'
import { EllipsisVertical } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/common/sheet'

// Dynamic import to preserve original cart behavior
const CartButton = dynamic(() => import('./cart-button'), {
  ssr: false,
})

export default function Menu() {
  return (
    <div className='flex items-center'>
      {/* Desktop Cart */}
      <div className='hidden md:block'>
        <CartButton />
      </div>

      {/* Mobile Menu (Preserved your original sheet) */}
      <div className='md:hidden'>
        <Sheet>
          <SheetTrigger className='p-2 rounded-full hover:bg-gray-100'>
            <EllipsisVertical className='w-5 h-5' />
          </SheetTrigger>
          <SheetContent className='w-[300px]'>
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className='mt-4 space-y-4'>
              <CartButton />
              {/* Add other mobile menu items here */}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
