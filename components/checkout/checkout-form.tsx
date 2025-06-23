'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon, LockClosedIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import { useSession, signIn } from 'next-auth/react'
import { useAuthStore } from '@/store/auth-store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { saveBillingAddress, saveShippingAddress } from '@/lib/actions/checkout'
import { useCartStore } from '@/lib/stores/cart-store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const steps = ['Billing', 'Shipping', 'Payment'] as const
type Step = (typeof steps)[number]

interface FormData {
  name: string
  email: string
  password: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface FormErrors {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface ShippingFormData {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface PaymentFormData {
  cardNumber: string
  expiryDate: string
  cvc: string
  nameOnCard: string
}

interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

interface ShippingFormErrors {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

// Define a more explicit session type

// Country name to ISO 2-letter code mapping
const countryNameToCode: Record<string, string> = {
  'Pakistan': 'PK',
  'United States': 'US',
  'India': 'IN',
  'Canada': 'CA',
  'United Kingdom': 'GB',
  // Add more as needed
};

function getCountryCode(country: string): string {
  return countryNameToCode[country] || country || 'US';
}

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export default function CheckoutForm() {
  const [currentStep, setCurrentStep] = useState<Step>('Billing')
  const [isReturningCustomerOpen, setIsReturningCustomerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [shippingFormData, setShippingFormData] = useState<ShippingFormData>({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  })
  const [sameAsBilling, setSameAsBilling] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>(
    'standard'
  )
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  // Fix Zustand store usage
  const shippingCost = useCartStore((state) => state.shippingCost)
  const updateShippingCost = useCartStore((state) => state.updateShippingCost)

  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    nameOnCard: '',
  })

  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [shippingFormErrors, setShippingFormErrors] =
    useState<ShippingFormErrors>({})

  const [paymentMethod, setPaymentMethod] = useState<'credit-card' | 'paypal'>('credit-card')

  const cartItems = useCartStore((state) => state.items)

  // Initialize form data from session only once when component mounts
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user?.name || prev.name,
        email: session.user?.email || prev.email,
      }))
    }
  }, [status, session?.user])

  // Fetch addresses only when currentStep changes and user is authenticated
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.email) return

    const fetchAddresses = async () => {
      try {
        const type = currentStep === 'Billing' ? 'billing' : 'shipping'
        const response = await fetch(`/api/addresses?type=${type}`)
        if (!response.ok) throw new Error(`Failed to fetch ${type} address`)

        const addresses = await response.json()
        if (addresses.length > 0) {
          const defaultAddress =
            addresses.find((addr: Address) => addr.isDefault) || addresses[0]

          if (currentStep === 'Billing') {
            setFormData((prev) => ({
              ...prev,
              street: defaultAddress.street || prev.street,
              city: defaultAddress.city || prev.city,
              state: defaultAddress.state || prev.state,
              postalCode: defaultAddress.postalCode || prev.postalCode,
              country: defaultAddress.country || prev.country,
            }))
          } else {
            setShippingFormData((prev) => ({
              ...prev,
              street: defaultAddress.street || prev.street,
              city: defaultAddress.city || prev.city,
              state: defaultAddress.state || prev.state,
              postalCode: defaultAddress.postalCode || prev.postalCode,
              country: defaultAddress.country || prev.country,
            }))
          }
        }
      } catch (error) {
        console.error(
          `Error fetching ${currentStep.toLowerCase()} address:`,
          error
        )
      }
    }

    fetchAddresses()
  }, [currentStep, status, session?.user?.email])

  // Update shipping form data when sameAsBilling changes
  useEffect(() => {
    if (sameAsBilling) {
      setShippingFormData({
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
      })
    }
  }, [sameAsBilling, formData])

  // Update shipping cost when shipping method changes
  useEffect(() => {
    const newShippingCost = shippingMethod === 'standard' ? 5.99 : 12.99
    if (newShippingCost !== shippingCost) {
      updateShippingCost(newShippingCost)
    }
  }, [shippingMethod, shippingCost, updateShippingCost])

  // Memoize validation functions
  const validateBillingForm = useCallback((): boolean => {
    const errors: FormErrors = {}
    let isValid = true

    // Street address validation
    if (!formData.street.trim()) {
      errors.street = 'Street address is required'
      isValid = false
    } else if (formData.street.trim().length < 5) {
      errors.street =
        'Please enter a valid street address (minimum 5 characters)'
      isValid = false
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required'
      isValid = false
    } else if (formData.city.trim().length < 2) {
      errors.city = 'Please enter a valid city name (minimum 2 characters)'
      isValid = false
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State/Province is required'
      isValid = false
    } else if (formData.state.trim().length < 2) {
      errors.state =
        'Please enter a valid state/province name (minimum 2 characters)'
      isValid = false
    }

    // Postal code validation
    if (!formData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required'
      isValid = false
    } else {
      // Remove any spaces from postal code
      const cleanPostalCode = formData.postalCode.replace(/\s/g, '')
      if (!/^\d{5}(-\d{4})?$/.test(cleanPostalCode)) {
        errors.postalCode =
          'Please enter a valid postal code (e.g., 12345 or 12345-6789)'
        isValid = false
      }
    }

    // Country validation
    if (!formData.country.trim()) {
      errors.country = 'Country is required'
      isValid = false
    } else if (formData.country.trim().length < 2) {
      errors.country =
        'Please enter a valid country name (minimum 2 characters)'
      isValid = false
    }

    setFormErrors(errors)

    // Show toast message if there are any errors
    if (!isValid) {
      const errorMessages = Object.values(errors)
      if (errorMessages.length > 0) {
        toast.error(errorMessages[0], {
          description:
            errorMessages.length > 1
              ? 'Please check all required fields'
              : undefined,
        })
      }
    }

    return isValid
  }, [formData, setFormErrors])

  const validateShippingForm = useCallback((): boolean => {
    const errors: ShippingFormErrors = {}
    let isValid = true

    // Skip validation if same as billing
    if (sameAsBilling) {
      setShippingFormErrors({})
      return true
    }

    // Street address validation
    if (!shippingFormData.street.trim()) {
      errors.street = 'Street address is required'
      isValid = false
    } else if (shippingFormData.street.trim().length < 5) {
      errors.street =
        'Please enter a valid street address (minimum 5 characters)'
      isValid = false
    }

    // City validation
    if (!shippingFormData.city.trim()) {
      errors.city = 'City is required'
      isValid = false
    } else if (shippingFormData.city.trim().length < 2) {
      errors.city = 'Please enter a valid city name (minimum 2 characters)'
      isValid = false
    }

    // State validation
    if (!shippingFormData.state.trim()) {
      errors.state = 'State/Province is required'
      isValid = false
    } else if (shippingFormData.state.trim().length < 2) {
      errors.state =
        'Please enter a valid state/province name (minimum 2 characters)'
      isValid = false
    }

    // Postal code validation
    if (!shippingFormData.postalCode.trim()) {
      errors.postalCode = 'Postal code is required'
      isValid = false
    } else {
      // Remove any spaces from postal code
      const cleanPostalCode = shippingFormData.postalCode.replace(/\s/g, '')
      if (!/^\d{5}(-\d{4})?$/.test(cleanPostalCode)) {
        errors.postalCode =
          'Please enter a valid postal code (e.g., 12345 or 12345-6789)'
        isValid = false
      }
    }

    // Country validation
    if (!shippingFormData.country.trim()) {
      errors.country = 'Country is required'
      isValid = false
    } else if (shippingFormData.country.trim().length < 2) {
      errors.country =
        'Please enter a valid country name (minimum 2 characters)'
      isValid = false
    }

    setShippingFormErrors(errors)

    // Show toast message if there are any errors
    if (!isValid) {
      const errorMessages = Object.values(errors)
      if (errorMessages.length > 0) {
        toast.error(errorMessages[0], {
          description:
            errorMessages.length > 1
              ? 'Please check all required fields'
              : undefined,
        })
      }
    }

    return isValid
  }, [shippingFormData, sameAsBilling, setShippingFormErrors])

  // Update handleNextStep to include shipping validation
  const handleNextStep = useCallback(async () => {
    if (isLoading) return
    setIsLoading(true)

    try {
      if (currentStep === 'Billing') {
        if (!validateBillingForm()) {
          setIsLoading(false)
          return
        }

        try {
          const billingData = new FormData()
          billingData.set('type', 'billing')
          billingData.set('isDefault', 'true')
          billingData.set('street', formData.street)
          billingData.set('city', formData.city)
          billingData.set('state', formData.state)
          billingData.set('postalCode', formData.postalCode)
          billingData.set('country', formData.country)

          const billingResult = await saveBillingAddress(null, billingData)
          if (billingResult?.error) {
            toast.error(billingResult.error)
            return
          }

          setCurrentStep('Shipping')
          toast.success('Billing information saved successfully')
        } catch (error: unknown) {
          console.error('Error saving billing address:', error)
          toast.error('Failed to save billing address. Please try again.')
          setIsLoading(false)
          return
        }
      } else if (currentStep === 'Shipping') {
        if (!validateShippingForm()) {
          setIsLoading(false)
          return
        }
        try {
          const shippingFormDataToSubmit = new FormData()

          if (sameAsBilling) {
            shippingFormDataToSubmit.set('street', formData.street)
            shippingFormDataToSubmit.set('city', formData.city)
            shippingFormDataToSubmit.set('state', formData.state)
            shippingFormDataToSubmit.set('postalCode', formData.postalCode)
            shippingFormDataToSubmit.set('country', formData.country)
          } else {
            shippingFormDataToSubmit.set('street', shippingFormData.street)
            shippingFormDataToSubmit.set('city', shippingFormData.city)
            shippingFormDataToSubmit.set('state', shippingFormData.state)
            shippingFormDataToSubmit.set(
              'postalCode',
              shippingFormData.postalCode
            )
            shippingFormDataToSubmit.set('country', shippingFormData.country)
          }

          shippingFormDataToSubmit.set('isDefault', 'true')
          shippingFormDataToSubmit.set('shippingMethod', shippingMethod)

          const shippingResult = await saveShippingAddress(
            null,
            shippingFormDataToSubmit
          )
          if (shippingResult?.error) {
            toast.error(shippingResult.error)
            return
          }

          setCurrentStep('Payment')
          toast.success('Shipping information saved successfully')
        } catch (error: unknown) {
          console.error('Error saving shipping address:', error)
          toast.error('Failed to save shipping information')
          setIsLoading(false)
          return
        }
      } else if (currentStep === 'Payment') {
        if (paymentMethod === 'paypal') {
          // Build payload for backend
          const payload = {
            order_id: generateOrderId(),
            customer: {
              email: formData.email,
              first_name: formData.name.split(' ')[0] || '',
              last_name: formData.name.split(' ').slice(1).join(' ') || '',
              phone: session?.user?.phone || '',
            },
            items: cartItems.map(item => ({
              product_id: String(item.productId),
              name: item.name || 'Product',
              quantity: Number(item.quantity) || 1,
              unit_price: String(Number(item.price) || 0),
              currency: 'USD',
            })),
            shipping_address: {
              line1: shippingFormData.street,
              line2: '',
              city: shippingFormData.city,
              state: shippingFormData.state,
              postal_code: shippingFormData.postalCode,
              country_code: getCountryCode(shippingFormData.country),
            },
            billing_address: {
              line1: formData.street,
              line2: '',
              city: formData.city,
              state: formData.state,
              postal_code: formData.postalCode,
              country_code: getCountryCode(formData.country),
            },
            subtotal: calculateSubtotal(cartItems),
            tax_amount: calculateTax(cartItems),
            shipping_amount: shippingCost,
            discount_amount: 0,
            total_amount: calculateTotal(cartItems, shippingCost),
            currency: 'USD',
            payment_method: 'paypal',
            notes: '',
          };
          // Log the payload for debugging
          console.log('Payload being sent:', JSON.stringify(payload, null, 2));
          // Use only valid product IDs for testing
          const validProductIds = [1850, 1851, 1857, 1849, 1868, 1842, 1856, 1845, 1844, 1852, 1854, 1853, 1841, 1846];
          // Prepare order items for DB insert
          let orderItemsData: {
            productId: number;
            name: string;
            quantity: number;
            unitPrice: string;
            totalPrice: string;
            // Add other fields as needed (color, size, sku, etc.)
          }[] = cartItems.map((item, idx) => {
            const name = item.name || 'Product';
            const quantity = Number(item.quantity) || 1;
            const unitPrice = Number(item.price) || 0;
            const totalPrice = unitPrice * quantity;
            // Always use a valid productId from the list (cycle through for multiple items)
            const productId = validProductIds[idx % validProductIds.length];
            return {
              productId,
              name,
              quantity,
              unitPrice: String(unitPrice),
              totalPrice: String(totalPrice),
              // Add other fields as needed (color, size, sku, etc.)
            };
          });
          console.log('Order items data for DB:', orderItemsData);
          // POST to backend
          try {
            const response = await fetch(`${BACKEND_URL}/checkout/process-paypal`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
              toast.error(result.message || 'Failed to process PayPal order');
              setIsLoading(false);
              return;
            }
            // Redirect to thank you page with order info (no DB insert)
            router.push(`/orders/thank-you?order_id=${result.order_id}&paypal_order_id=${result.paypal_order_id}`);
            return;
          } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            toast.error('Network or fetch error.');
            setIsLoading(false);
            return;
          }
        } else {
          toast.success('Order placed successfully!');
          router.push('/order-confirmation');
        }
      }
    } catch (error: unknown) {
      console.error('Error in handleNextStep:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [
    currentStep,
    formData,
    shippingFormData,
    sameAsBilling,
    shippingMethod,
    isLoading,
    router,
    validateBillingForm,
    validateShippingForm,
    setIsLoading,
    paymentMethod,
    session,
    cartItems,
    shippingCost
  ])

  // Cache the handleInputChange function
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [setFormData]
  )

  // Cache the handleShippingInputChange function
  const handleShippingInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setShippingFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [setShippingFormData]
  )

  // Cache the handlePaymentInputChange function
  const handlePaymentInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setPaymentFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [setPaymentFormData]
  )

  // Cache the handleReturningCustomerLogin function
  const handleReturningCustomerLogin = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsLoading(true)
      setLoginError('')

      const formData = new FormData(e.currentTarget)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setLoginError('Invalid email or password')
        } else {
          const response = await fetch('/api/auth/session')
          const data = await response.json()
          setUser(data?.user || null)
        }
      } catch (error: unknown) {
        console.log('Login error:', error)
        setLoginError('An error occurred during login')
      } finally {
        setIsLoading(false)
      }
    },
    [setUser, setIsLoading, setLoginError]
  )

  // Utility: Generate a simple order ID (for demo; use a better one in production)
  function generateOrderId() {
    return 'ORDER-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Utility: Calculate subtotal
  function calculateSubtotal(items: { price: number; quantity: number }[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // Utility: Calculate tax (example: 8%)
  function calculateTax(items: { price: number; quantity: number }[]): number {
    return Math.round(calculateSubtotal(items) * 0.08 * 100) / 100;
  }

  // Utility: Calculate total
  function calculateTotal(items: { price: number; quantity: number }[], shippingCost: number): number {
    return Math.round((calculateSubtotal(items) + calculateTax(items) + shippingCost) * 100) / 100;
  }

  return (
    <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div>
        {/* Logo/Header */}
        <div className='flex justify-center mb-6'>
          <div className='w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg'>
            <LockClosedIcon className='h-5 w-5 text-white' />
          </div>
        </div>

        {/* Returning Customer Section */}
        {!session && (
          <div className='mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-200'>
            <button
              onClick={() =>
                setIsReturningCustomerOpen(!isReturningCustomerOpen)
              }
              className='flex w-full items-center justify-between group'
            >
              <span className='text-sm font-medium text-gray-900 group-hover:text-black transition-colors duration-300'>
                Returning customer? Click to login
              </span>
              {isReturningCustomerOpen ? (
                <ChevronUpIcon className='ml-2 h-5 w-5 text-gray-500 group-hover:text-black transition-colors duration-300' />
              ) : (
                <ChevronDownIcon className='ml-2 h-5 w-5 text-gray-500 group-hover:text-black transition-colors duration-300' />
              )}
            </button>

            <AnimatePresence>
              {isReturningCustomerOpen && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className='mt-4 space-y-3 overflow-hidden'
                  onSubmit={handleReturningCustomerLogin}
                >
                  <div className='space-y-1'>
                    <label
                      htmlFor='email'
                      className='block text-xs font-medium text-gray-700'
                    >
                      Email address
                    </label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm transition-all duration-300 px-3 py-2 text-sm'
                      placeholder='your@email.com'
                      required
                    />
                  </div>
                  <div className='space-y-1'>
                    <label
                      htmlFor='password'
                      className='block text-xs font-medium text-gray-700'
                    >
                      Password
                    </label>
                    <input
                      type='password'
                      id='password'
                      name='password'
                      className='block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm transition-all duration-300 px-3 py-2 text-sm'
                      placeholder='••••••••'
                      required
                    />
                  </div>
                  {loginError && (
                    <p className='text-sm text-red-600'>{loginError}</p>
                  )}
                  <div className='pt-1'>
                    <button
                      type='submit'
                      disabled={isLoading}
                      className={`w-full flex justify-center items-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 ${
                        isLoading
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-black hover:bg-gray-800 hover:shadow-md'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Login'
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Progress Steps */}
        <div className='mb-6 p-4 rounded-xl bg-white border border-gray-200'>
          <ol className='flex items-center justify-between'>
            {steps.map((step, index) => {
              const isCurrent = currentStep === step
              const isPast = steps.indexOf(currentStep) > index
              const isLast = index === steps.length - 1

              return (
                <li
                  key={step}
                  className={`relative flex-1 ${isLast ? 'flex-none' : ''}`}
                >
                  <div className='group flex flex-col items-center'>
                    <div className='flex items-center'>
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                          isPast
                            ? 'bg-black shadow-md'
                            : isCurrent
                            ? 'bg-white border-2 border-black'
                            : 'bg-gray-100 border-2 border-gray-300'
                        }`}
                      >
                        {isPast ? (
                          <CheckIcon className='h-4 w-4 text-white' />
                        ) : (
                          <span
                            className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                              isCurrent ? 'bg-black' : 'bg-gray-400'
                            }`}
                          />
                        )}
                      </span>
                      {!isLast && (
                        <div
                          className={`hidden sm:block h-0.5 mx-2 flex-1 transition-all duration-500 ${
                            isPast ? 'bg-black' : 'bg-gray-200'
                          }`}
                          style={{ width: '40px' }}
                        />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium tracking-wide transition-all duration-300 ${
                        isPast
                          ? 'text-black'
                          : isCurrent
                          ? 'text-black font-semibold'
                          : 'text-gray-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Step Content */}
        <div className='rounded-xl bg-white p-6 border border-gray-200'>
          <AnimatePresence mode='wait'>
            {currentStep === 'Billing' && (
              <motion.div
                key='billing'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {!session?.user && (
                  <div className='space-y-4'>
                    <h2 className='text-lg font-bold text-gray-900'>
                      Contact Information
                    </h2>
                    <div className='grid grid-cols-1 gap-4'>
                      <div>
                        <Label htmlFor='name'>Full Name</Label>
                        <Input
                          type='text'
                          id='name'
                          name='name'
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                          type='email'
                          id='email'
                          name='email'
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor='password'>Password</Label>
                        <Input
                          type='password'
                          id='password'
                          name='password'
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`${
                    !session ? 'pt-4 border-t border-gray-200' : ''
                  } mt-5`}
                >
                  <h2 className='text-lg font-bold text-gray-900'>
                    Billing Address
                  </h2>
                  <p className='mt-1 text-xs text-gray-500'>
                    Use a permanent address where you can receive mail
                  </p>
                  <form
                    id='billing-form'
                    onSubmit={(e) => e.preventDefault()}
                    className='mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2'
                  >
                    <input type='hidden' name='type' value='billing' />
                    <input type='hidden' name='isDefault' value='true' />

                    <div className='sm:col-span-2'>
                      <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                        Street address*
                      </label>
                      <input
                        type='text'
                        name='street'
                        id='street'
                        value={formData.street}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                          formErrors.street ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {formErrors.street && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.street}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                        City*
                      </label>
                      <input
                        type='text'
                        name='city'
                        id='city'
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                          formErrors.city ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {formErrors.city && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                        State/Province*
                      </label>
                      <input
                        type='text'
                        name='state'
                        id='state'
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                          formErrors.state ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {formErrors.state && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                        ZIP/Postal code*
                      </label>
                      <input
                        type='text'
                        name='postalCode'
                        id='postalCode'
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                          formErrors.postalCode ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {formErrors.postalCode && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.postalCode}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                        Country*
                      </label>
                      <input
                        type='text'
                        name='country'
                        id='country'
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                          formErrors.country ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {formErrors.country && (
                        <p className='mt-1 text-xs text-red-500'>
                          {formErrors.country}
                        </p>
                      )}
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {currentStep === 'Shipping' && (
              <motion.div
                key='shipping'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className='mb-6'>
                  <h2 className='text-xl font-bold text-gray-900 tracking-tight'>
                    Shipping Information
                  </h2>
                  <p className='mt-1 text-xs text-gray-500'>
                    Where should we deliver your order?
                  </p>
                </div>

                <div className='space-y-6'>
                  <div className='flex items-center'>
                    <input
                      id='same-as-billing'
                      name='same-as-billing'
                      type='checkbox'
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className='h-4 w-4 rounded border-gray-200 text-black focus:ring-black'
                    />
                    <label
                      htmlFor='same-as-billing'
                      className='ml-2 block text-xs text-gray-700'
                    >
                      Same as billing address
                    </label>
                  </div>

                  <form id='shipping-form' className='space-y-6'>
                    <input type='hidden' name='type' value='shipping' />
                    <input type='hidden' name='isDefault' value='true' />
                    <input
                      type='hidden'
                      name='shippingMethod'
                      value={shippingMethod}
                    />

                    <div className='space-y-4'>
                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                          Street address*
                        </label>
                        <input
                          type='text'
                          name='street'
                          value={shippingFormData.street}
                          onChange={handleShippingInputChange}
                          className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                            shippingFormErrors.street ? 'border-red-500' : ''
                          }`}
                          required
                          disabled={sameAsBilling}
                        />
                        {shippingFormErrors.street && (
                          <p className='mt-1 text-xs text-red-500'>
                            {shippingFormErrors.street}
                          </p>
                        )}
                      </div>

                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                        <div>
                          <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                            City*
                          </label>
                          <input
                            type='text'
                            name='city'
                            value={shippingFormData.city}
                            onChange={handleShippingInputChange}
                            className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                              shippingFormErrors.city ? 'border-red-500' : ''
                            }`}
                            required
                            disabled={sameAsBilling}
                          />
                          {shippingFormErrors.city && (
                            <p className='mt-1 text-xs text-red-500'>
                              {shippingFormErrors.city}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                            State/Province*
                          </label>
                          <input
                            type='text'
                            name='state'
                            value={shippingFormData.state}
                            onChange={handleShippingInputChange}
                            className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                              shippingFormErrors.state ? 'border-red-500' : ''
                            }`}
                            required
                            disabled={sameAsBilling}
                          />
                          {shippingFormErrors.state && (
                            <p className='mt-1 text-xs text-red-500'>
                              {shippingFormErrors.state}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                            ZIP/Postal code*
                          </label>
                          <input
                            type='text'
                            name='postalCode'
                            value={shippingFormData.postalCode}
                            onChange={handleShippingInputChange}
                            className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                              shippingFormErrors.postalCode
                                ? 'border-red-500'
                                : ''
                            }`}
                            required
                            disabled={sameAsBilling}
                          />
                          {shippingFormErrors.postalCode && (
                            <p className='mt-1 text-xs text-red-500'>
                              {shippingFormErrors.postalCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                          Country*
                        </label>
                        <input
                          type='text'
                          name='country'
                          value={shippingFormData.country}
                          onChange={handleShippingInputChange}
                          className={`block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300 ${
                            shippingFormErrors.country ? 'border-red-500' : ''
                          }`}
                          required
                          disabled={sameAsBilling}
                        />
                        {shippingFormErrors.country && (
                          <p className='mt-1 text-xs text-red-500'>
                            {shippingFormErrors.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </form>

                  <div className='pt-4 border-t border-gray-200'>
                    <h3 className='text-sm font-medium text-gray-900'>
                      Shipping Method
                    </h3>
                    <div className='mt-3 space-y-3'>
                      <div
                        className={`flex items-center justify-between p-3.5 rounded-lg border ${
                          shippingMethod === 'standard'
                            ? 'border-black'
                            : 'border-gray-200'
                        } hover:border-black transition-colors duration-300 cursor-pointer`}
                        onClick={() => setShippingMethod('standard')}
                      >
                        <div className='flex items-center'>
                          <input
                            type='radio'
                            id='standard-shipping'
                            name='shipping-method'
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className='h-4 w-4 text-black focus:ring-black'
                          />
                          <label
                            htmlFor='standard-shipping'
                            className='ml-2 block text-xs font-medium text-gray-700'
                          >
                            Standard Shipping (5-7 business days)
                          </label>
                        </div>
                        <span className='text-xs font-medium text-gray-900'>
                          $5.99
                        </span>
                      </div>
                      <div
                        className={`flex items-center justify-between p-3.5 rounded-lg border ${
                          shippingMethod === 'express'
                            ? 'border-black'
                            : 'border-gray-200'
                        } hover:border-black transition-colors duration-300 cursor-pointer`}
                        onClick={() => setShippingMethod('express')}
                      >
                        <div className='flex items-center'>
                          <input
                            type='radio'
                            id='express-shipping'
                            name='shipping-method'
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className='h-4 w-4 text-black focus:ring-black'
                          />
                          <label
                            htmlFor='express-shipping'
                            className='ml-2 block text-xs font-medium text-gray-700'
                          >
                            Express Shipping (2-3 business days)
                          </label>
                        </div>
                        <span className='text-xs font-medium text-gray-900'>
                          $12.99
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'Payment' && (
              <motion.div
                key='payment'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className='mb-6'>
                  <h2 className='text-xl font-bold text-gray-900 tracking-tight'>
                    Payment Method
                  </h2>
                  <p className='mt-1 text-xs text-gray-500'>
                    Complete your purchase with secure payment
                  </p>
                </div>

                <div className='space-y-4'>
                  <div className='space-y-3'>
                    <div className='relative p-5 rounded-xl bg-white border border-gray-200 hover:border-black transition-colors duration-300'>
                      <input
                        type='radio'
                        id='credit-card'
                        name='payment-method'
                        checked={paymentMethod === 'credit-card'}
                        onChange={() => setPaymentMethod('credit-card')}
                        className='absolute top-5 right-5 h-4 w-4 text-black focus:ring-black'
                      />
                      <label htmlFor='credit-card' className='block'>
                        <span className='block text-sm font-medium text-gray-900'>
                          Credit Card
                        </span>
                        <span className='block text-xs text-gray-500 mt-1'>
                          Pay with Visa, Mastercard, or Amex
                        </span>
                        <div className='mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2'>
                          <div>
                            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                              Card number
                            </label>
                            <input
                              type='text'
                              name='cardNumber'
                              value={paymentFormData.cardNumber}
                              onChange={handlePaymentInputChange}
                              className='block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300'
                              placeholder='0000 0000 0000 0000'
                            />
                          </div>
                          <div>
                            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                              Name on card
                            </label>
                            <input
                              type='text'
                              name='nameOnCard'
                              value={paymentFormData.nameOnCard}
                              onChange={handlePaymentInputChange}
                              className='block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300'
                              placeholder='John Smith'
                            />
                          </div>
                          <div>
                            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                              Expiration date
                            </label>
                            <input
                              type='text'
                              name='expiryDate'
                              value={paymentFormData.expiryDate}
                              onChange={handlePaymentInputChange}
                              className='block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300'
                              placeholder='MM/YY'
                            />
                          </div>
                          <div>
                            <label className='block text-xs font-medium text-gray-700 mb-1.5'>
                              CVV
                            </label>
                            <input
                              type='text'
                              name='cvc'
                              value={paymentFormData.cvc}
                              onChange={handlePaymentInputChange}
                              className='block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black text-sm px-3.5 py-2.5 transition-all duration-300'
                              placeholder='123'
                            />
                          </div>
                        </div>
                        <div className='mt-4 flex space-x-3'>
                          <Image
                            src='/images/checkout/visa.svg'
                            alt='Visa'
                            width={40}
                            height={25}
                            className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
                          />

                          <Image
                            src='/images/checkout/mastercard.svg'
                            alt='mastercard'
                            width={40}
                            height={25}
                            className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
                          />

                          <Image
                            src='/images/checkout/amex.svg'
                            alt='amex'
                            width={40}
                            height={25}
                            className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
                          />
                        </div>
                      </label>
                    </div>

                    <div className='relative p-5 rounded-xl bg-white border border-gray-200 hover:border-black transition-colors duration-300'>
                      <input
                        type='radio'
                        id='paypal'
                        name='payment-method'
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className='absolute top-5 right-5 h-4 w-4 text-black focus:ring-black'
                      />
                      <label
                        htmlFor='paypal'
                        className='flex items-center justify-between'
                      >
                        <div>
                          <span className='block text-sm font-medium text-gray-900'>
                            PayPal
                          </span>
                          <span className='block text-xs text-gray-500 mt-1'>
                            Pay securely with your PayPal account
                          </span>
                        </div>
                        <Image
                          src='/images/checkout/paypal.png'
                          alt='PayPal'
                          width={80}
                          height={20}
                          className='h-5 w-auto opacity-80 hover:opacity-100 transition-opacity'
                        />
                      </label>
                    </div>
                  </div>

                  <div className='rounded-xl bg-gray-50 p-4 border border-gray-200'>
                    <div className='flex items-start'>
                      <div className='flex-shrink-0 p-1.5 bg-gray-200 rounded-lg'>
                        <LockClosedIcon className='h-4 w-4 text-gray-700' />
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-xs font-medium text-gray-800'>
                          Secure payment
                        </h3>
                        <p className='mt-1 text-xs text-gray-600'>
                          Your payment information is processed securely. We do
                          not store credit card details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className='mt-8 flex justify-between items-center'>
            <button
              type='button'
              onClick={() => {
                if (currentStep === 'Payment') setCurrentStep('Shipping')
                else if (currentStep === 'Shipping') setCurrentStep('Billing')
              }}
              className={`flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 ${
                currentStep === 'Billing' ? 'invisible' : ''
              }`}
            >
              <ArrowLeftIcon className='w-4 h-4 mr-2' />
              Back
            </button>

            <button
              type='button'
              onClick={handleNextStep}
              disabled={isLoading}
              className='flex items-center bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === 'Payment' ? 'Place Order' : 'Continue'}
                  <ArrowRightIcon className='w-4 h-4 ml-2' />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
