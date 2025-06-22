'use client'

import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FiLayout, FiGrid, FiStar, FiPlus, FiMinus } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { getSettings, updateMultipleSettings } from '@/lib/actions/settings'
import { toast, Toaster } from 'sonner'

export default function ThemeSettings() {
  const defaultSettings = {
    mainBanners: 3,
    miniBanners: 3,
    featuredProducts: 8,
    brandLogos: 6,
    productsPerPage: 12,
    relatedProducts: 4,
    showCompanySection: false,
    showUpsellProducts: true,
    showSocialSharing: true,
    showReviews: true,
    showStockStatus: true,
    defaultViewMode: 'grid',
    enableFilters: true
  }

  const [settings, setSettings] = useState<Record<string, string | number | boolean>>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const themeSettings = await getSettings('theme')
        // Merge default settings with loaded settings, ensuring all values are properly typed
        const mergedSettings = {
          ...defaultSettings,
          ...themeSettings,
          // Ensure numeric values are properly converted
          mainBanners: Number(themeSettings.mainBanners || defaultSettings.mainBanners),
          miniBanners: Number(themeSettings.miniBanners || defaultSettings.miniBanners),
          featuredProducts: Number(themeSettings.featuredProducts || defaultSettings.featuredProducts),
          brandLogos: Number(themeSettings.brandLogos || defaultSettings.brandLogos),
          productsPerPage: Number(themeSettings.productsPerPage || defaultSettings.productsPerPage),
          relatedProducts: Number(themeSettings.relatedProducts || defaultSettings.relatedProducts),
          // Ensure boolean values are properly converted
          showCompanySection: Boolean(themeSettings.showCompanySection ?? defaultSettings.showCompanySection),
          showUpsellProducts: Boolean(themeSettings.showUpsellProducts ?? defaultSettings.showUpsellProducts),
          showSocialSharing: Boolean(themeSettings.showSocialSharing ?? defaultSettings.showSocialSharing),
          showReviews: Boolean(themeSettings.showReviews ?? defaultSettings.showReviews),
          showStockStatus: Boolean(themeSettings.showStockStatus ?? defaultSettings.showStockStatus),
          enableFilters: Boolean(themeSettings.enableFilters ?? defaultSettings.enableFilters),
          // Ensure string values are properly set
          defaultViewMode: themeSettings.defaultViewMode || defaultSettings.defaultViewMode
        }
        setSettings(mergedSettings)
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
        // If loading fails, use default settings
        setSettings(defaultSettings)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (key: string, value: string | number | boolean) => {
    // Ensure numeric values are properly handled
    if (typeof value === 'number') {
      setSettings(prev => ({ ...prev, [key]: value }))
    } else {
      setSettings(prev => ({ ...prev, [key]: value }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Convert all values to their proper types before saving
      const settingsToSave = {
        ...settings,
        mainBanners: Number(settings.mainBanners),
        miniBanners: Number(settings.miniBanners),
        featuredProducts: Number(settings.featuredProducts),
        brandLogos: Number(settings.brandLogos),
        productsPerPage: Number(settings.productsPerPage),
        relatedProducts: Number(settings.relatedProducts),
        showCompanySection: Boolean(settings.showCompanySection),
        showUpsellProducts: Boolean(settings.showUpsellProducts),
        showSocialSharing: Boolean(settings.showSocialSharing),
        showReviews: Boolean(settings.showReviews),
        showStockStatus: Boolean(settings.showStockStatus),
        enableFilters: Boolean(settings.enableFilters),
        defaultViewMode: String(settings.defaultViewMode)
      }

      const result = await updateMultipleSettings(settingsToSave)
      if (result.success) {
        toast.success('Settings saved successfully', {
          description: 'Your changes have been saved and will be reflected immediately.',
          duration: 3000,
          position: 'top-right',
          style: {
            background: '#10B981',
            color: 'white',
            border: 'none',
          },
        })
        
        // Reload settings after successful save
        const themeSettings = await getSettings('theme')
        console.log('Reloaded theme settings:', themeSettings)
        
        // Merge with default settings to ensure all values are present
        const mergedSettings = {
          ...defaultSettings,
          ...themeSettings,
          // Ensure numeric values are properly converted
          mainBanners: Number(themeSettings.mainBanners || defaultSettings.mainBanners),
          miniBanners: Number(themeSettings.miniBanners || defaultSettings.miniBanners),
          featuredProducts: Number(themeSettings.featuredProducts || defaultSettings.featuredProducts),
          brandLogos: Number(themeSettings.brandLogos || defaultSettings.brandLogos),
          productsPerPage: Number(themeSettings.productsPerPage || defaultSettings.productsPerPage),
          relatedProducts: Number(themeSettings.relatedProducts || defaultSettings.relatedProducts),
          // Ensure boolean values are properly converted
          showCompanySection: Boolean(themeSettings.showCompanySection ?? defaultSettings.showCompanySection),
          showUpsellProducts: Boolean(themeSettings.showUpsellProducts ?? defaultSettings.showUpsellProducts),
          showSocialSharing: Boolean(themeSettings.showSocialSharing ?? defaultSettings.showSocialSharing),
          showReviews: Boolean(themeSettings.showReviews ?? defaultSettings.showReviews),
          showStockStatus: Boolean(themeSettings.showStockStatus ?? defaultSettings.showStockStatus),
          enableFilters: Boolean(themeSettings.enableFilters ?? defaultSettings.enableFilters),
          // Ensure string values are properly set
          defaultViewMode: themeSettings.defaultViewMode || defaultSettings.defaultViewMode
        }
        
        console.log('Merged settings after save:', mergedSettings)
        setSettings(mergedSettings)
      } else {
        toast.error('Failed to save settings', {
          description: result.error || 'There was an error saving your changes. Please try again.',
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#EF4444',
            color: 'white',
            border: 'none',
          },
        })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings', {
        description: 'An unexpected error occurred. Please try again later.',
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#EF4444',
          color: 'white',
          border: 'none',
        },
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className='space-y-8 p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen'>
      <Toaster position="top-right" richColors />
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'>
            Theme Settings
          </h1>
          <p className='text-gray-500 dark:text-gray-400 mt-2 text-lg'>
            Customize your store's appearance and behavior
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </div>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>

      {/* Homepage Layout Section */}
      <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30'>
            <FiLayout className='w-6 h-6 text-blue-600 dark:text-blue-400' />
          </div>
          <h2 className='text-2xl font-semibold'>Homepage Layout</h2>
        </div>
        <div className='space-y-6'>
          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Main Banners</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Number of main banner slides to display
              </p>
            </div>
            <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('mainBanners', Math.max(1, Number(settings.mainBanners) - 1))}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiMinus className='h-4 w-4' />
              </Button>
              <span className='w-12 text-center font-medium'>
                {settings.mainBanners}
              </span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('mainBanners', Number(settings.mainBanners) + 1)}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiPlus className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Mini Banners</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Number of mini promotional banners
              </p>
            </div>
            <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('miniBanners', Math.max(1, Number(settings.miniBanners) - 1))}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiMinus className='h-4 w-4' />
              </Button>
              <span className='w-12 text-center font-medium'>
                {settings.miniBanners}
              </span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('miniBanners', Number(settings.miniBanners) + 1)}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiPlus className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Our Company Section</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Display company information section
              </p>
            </div>
            <Switch 
              checked={!!settings.showCompanySection}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showCompanySection', e.target.checked)}
            />
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Featured Products</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Number of featured products to display
              </p>
            </div>
            <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('featuredProducts', Math.max(1, Number(settings.featuredProducts) - 1))}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiMinus className='h-4 w-4' />
              </Button>
              <span className='w-12 text-center font-medium'>
                {settings.featuredProducts}
              </span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('featuredProducts', Number(settings.featuredProducts) + 1)}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiPlus className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Brand Logos</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Number of brand logos to display
              </p>
            </div>
            <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('brandLogos', Math.max(1, Number(settings.brandLogos) - 1))}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiMinus className='h-4 w-4' />
              </Button>
              <span className='w-12 text-center font-medium'>
                {settings.brandLogos}
              </span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('brandLogos', Number(settings.brandLogos) + 1)}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiPlus className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Category Page Settings */}
      <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30'>
            <FiGrid className='w-6 h-6 text-purple-600 dark:text-purple-400' />
          </div>
          <h2 className='text-2xl font-semibold'>Category Page Settings</h2>
        </div>
        <div className='space-y-6'>
          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Products Per Page</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Number of products to display per page
              </p>
            </div>
            <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('productsPerPage', Math.max(1, Number(settings.productsPerPage) - 1))}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiMinus className='h-4 w-4' />
              </Button>
              <span className='w-12 text-center font-medium'>
                {settings.productsPerPage}
              </span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('productsPerPage', Number(settings.productsPerPage) + 1)}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiPlus className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Default Sort Order</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Default sorting method for products
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <Label className='text-gray-600 dark:text-gray-300'>Grid</Label>
              <Switch 
                checked={settings.defaultViewMode === 'grid'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('defaultViewMode', e.target.checked ? 'grid' : 'list')}
              />
              <Label className='text-gray-600 dark:text-gray-300'>List</Label>
            </div>
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Filter Settings</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Enable product filtering options
              </p>
            </div>
            <Switch 
              checked={!!settings.enableFilters}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('enableFilters', e.target.checked)}
            />
          </div>
        </div>
      </Card>

      {/* Product Page Settings */}
      <Card className='p-8 border-none shadow-xl bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm'>
        <div className='flex items-center gap-3 mb-8'>
          <div className='p-3 rounded-xl bg-green-100 dark:bg-green-900/30'>
            <FiStar className='w-6 h-6 text-green-600 dark:text-green-400' />
          </div>
          <h2 className='text-2xl font-semibold'>Product Page Settings</h2>
        </div>
        <div className='space-y-6'>
          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Related Products</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Number of related products to display
              </p>
            </div>
            <div className='flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 border-2 border-gray-200 dark:border-gray-700'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('relatedProducts', Math.max(1, Number(settings.relatedProducts) - 1))}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiMinus className='h-4 w-4' />
              </Button>
              <span className='w-12 text-center font-medium'>
                {settings.relatedProducts}
              </span>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => handleChange('relatedProducts', Number(settings.relatedProducts) + 1)}
                className='h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700'
              >
                <FiPlus className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Upsell/Cross-sell Products</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Display related product suggestions
              </p>
            </div>
            <Switch 
              checked={!!settings.showUpsellProducts}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showUpsellProducts', e.target.checked)}
            />
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Social Sharing Buttons</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Enable social media sharing options
              </p>
            </div>
            <Switch 
              checked={!!settings.showSocialSharing}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showSocialSharing', e.target.checked)}
            />
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Review System</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Allow customers to leave product reviews
              </p>
            </div>
            <Switch 
              checked={!!settings.showReviews}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showReviews', e.target.checked)}
            />
          </div>

          <div className='flex items-center justify-between p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50'>
            <div className='space-y-1'>
              <Label className='text-lg'>Stock Visibility</Label>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Show product stock status to customers
              </p>
            </div>
            <Switch 
              checked={!!settings.showStockStatus}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('showStockStatus', e.target.checked)}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
