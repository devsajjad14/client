'use client'
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paypalOrderId = searchParams.get('paypal_order_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="bg-white/90 shadow-2xl rounded-3xl p-8 md:p-12 max-w-xl w-full flex flex-col items-center border border-gray-100">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 shadow-lg">
            <span className="text-5xl md:text-6xl select-none" role="img" aria-label="Success">🎉</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4 text-center">
          Thank You for Your Order!
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-6 text-center">
          Your order has been placed successfully.<br />
          We appreciate your trust in us.
        </p>
        <div className="w-full bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-4 mb-6 border border-indigo-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
            <div>
              <span className="block text-xs text-gray-500 font-medium">Order ID</span>
              <span className="block text-base font-semibold text-indigo-700 tracking-wide">{orderId}</span>
            </div>
            <div>
              <span className="block text-xs text-gray-500 font-medium">PayPal Order ID</span>
              <span className="block text-base font-semibold text-purple-700 tracking-wide">{paypalOrderId}</span>
            </div>
          </div>
        </div>
        <div className="w-full mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
            <p className="text-sm text-yellow-800 font-semibold">
              <span className="mr-2">⚠️</span>
              <span>This order has <b>not</b> been inserted in the database. It will be done in a future build.</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 w-full">
          <Link href="/" className="inline-block w-full md:w-auto px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-center">
            Continue Shopping
          </Link>
          <p className="text-xs text-gray-400 mt-2 text-center">
            A confirmation email with your order details will be sent to you soon.<br />
            If you have any questions, please <Link href="/contact" className="underline text-indigo-600 hover:text-purple-600">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
} 