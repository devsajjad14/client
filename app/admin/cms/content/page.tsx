'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  FiEdit3, 
  FiSave, 
  FiEye, 
  FiEyeOff,
  FiPlus,
  FiTrash2,
  FiCopy,
  FiMove,
  FiSettings,
  FiLayers,
  FiType,
  FiImage,
  FiVideo,
  FiGrid,
  FiColumns,
  FiBox,
  FiSquare,
  FiHash,
  FiFileText,
  FiLink,
  FiCode,
  FiDroplet,
  FiZap,
  FiMaximize2,
  FiMinimize2,
  FiRotateCcw,
  FiDownload,
  FiUpload,
  FiSearch,
  FiFilter,
  FiLayout,
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiGlobe,
  FiTrendingUp,
  FiUsers,
  FiBarChart,
  FiAward,
  FiPocket,
  FiShield,
  FiClock,
  FiStar,
  FiCheckCircle,
  FiPlay,
  FiPause,
  FiSkipForward,
  FiSkipBack
} from 'react-icons/fi'

interface Component {
  id: string
  type: string
  name: string
  icon: any
  category: string
  props?: any
}

interface CanvasElement {
  id: string
  type: string
  name: string
  icon: any
  props: any
  children?: CanvasElement[]
}

export default function CMSPage() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([])
  const [previewMode, setPreviewMode] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'components' | 'templates' | 'assets' | 'analytics'>('components')
  const [showBuilderOverlay] = useState(true)

  const componentLibrary: Component[] = [
    // Layout Components
    { id: 'container', type: 'container', name: 'Container', icon: FiBox, category: 'Layout' },
    { id: 'grid', type: 'grid', name: 'Grid', icon: FiGrid, category: 'Layout' },
    { id: 'columns', type: 'columns', name: 'Columns', icon: FiColumns, category: 'Layout' },
    { id: 'section', type: 'section', name: 'Section', icon: FiLayout, category: 'Layout' },
    
    // Content Components
    { id: 'heading', type: 'heading', name: 'Heading', icon: FiHash, category: 'Content' },
    { id: 'text', type: 'text', name: 'Text Block', icon: FiFileText, category: 'Content' },
    { id: 'button', type: 'button', name: 'Button', icon: FiSquare, category: 'Content' },
    { id: 'link', type: 'link', name: 'Link', icon: FiLink, category: 'Content' },
    
    // Media Components
    { id: 'image', type: 'image', name: 'Image', icon: FiImage, category: 'Media' },
    { id: 'video', type: 'video', name: 'Video', icon: FiVideo, category: 'Media' },
    { id: 'gallery', type: 'gallery', name: 'Gallery', icon: FiLayers, category: 'Media' },
    
    // Interactive Components
    { id: 'form', type: 'form', name: 'Form', icon: FiType, category: 'Interactive' },
    { id: 'carousel', type: 'carousel', name: 'Carousel', icon: FiGrid, category: 'Interactive' },
    { id: 'tabs', type: 'tabs', name: 'Tabs', icon: FiLayout, category: 'Interactive' },
    
    // Custom Components
    { id: 'hero', type: 'hero', name: 'Hero Section', icon: FiZap, category: 'Custom' },
    { id: 'testimonial', type: 'testimonial', name: 'Testimonial', icon: FiType, category: 'Custom' },
    { id: 'pricing', type: 'pricing', name: 'Pricing', icon: FiGrid, category: 'Custom' },
  ]

  const filteredComponents = componentLibrary.filter(component =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    component.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragStart = (component: Component) => {
    // This would handle drag start in a real implementation
  }

  const handleDrop = (component: Component) => {
    const newElement: CanvasElement = {
      id: `${component.type}-${Date.now()}`,
      type: component.type,
      name: component.name,
      icon: component.icon,
      props: { ...component.props }
    }
    setCanvasElements(prev => [...prev, newElement])
  }

  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId)
  }

  const handleElementDelete = (elementId: string) => {
    setCanvasElements(prev => prev.filter(el => el.id !== elementId))
    setSelectedElement(null)
  }

  const handleElementDuplicate = (elementId: string) => {
    const element = canvasElements.find(el => el.id === elementId)
    if (element) {
      const newElement: CanvasElement = {
        ...element,
        id: `${element.type}-${Date.now()}`
      }
      setCanvasElements(prev => [...prev, newElement])
    }
  }

  return (
    <>
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative">
        {/* Main Content (dimmed/blurred if overlay is active) */}
        <div className={showBuilderOverlay ? 'pointer-events-none' : ''}>
          {/* Premium Header with Impact */}
          <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 h-20 flex items-center justify-between px-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl">
                  <FiGlobe className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Visual Content Builder
                  </h1>
                  <p className="text-blue-200 text-sm font-medium">
                    Enterprise-Grade Drag & Drop CMS
                  </p>
                </div>
              </div>
              
              {/* Impact Stats */}
              <div className="hidden lg:flex items-center gap-6 ml-8">
                <div className="flex items-center gap-2 text-blue-200">
                  <FiTrendingUp className="w-5 h-5" />
                  <span className="text-sm font-semibold">10M+ Pages Built</span>
                </div>
                <div className="flex items-center gap-2 text-green-200">
                  <FiUsers className="w-5 h-5" />
                  <span className="text-sm font-semibold">50K+ Users</span>
                </div>
                <div className="flex items-center gap-2 text-purple-200">
                  <FiAward className="w-5 h-5" />
                  <span className="text-sm font-semibold">Industry Leader</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Premium Controls */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <FiPocket className="w-4 h-4" />
                  Publish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
                >
                  <FiSave className="w-4 h-4" />
                  Save
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-8.5rem)]">
            {/* Premium Sidebar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 380 }}
              className="bg-white/10 backdrop-blur-xl border-r border-white/20 flex flex-col"
            >
              {/* Tab Navigation */}
              <div className="p-4 border-b border-white/20">
                <div className="flex space-x-1 bg-white/10 rounded-xl p-1">
                  {[
                    { id: 'components', label: 'Components', icon: FiLayers },
                    { id: 'templates', label: 'Templates', icon: FiLayout },
                    { id: 'assets', label: 'Assets', icon: FiImage },
                    { id: 'analytics', label: 'Analytics', icon: FiBarChart }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-blue-200 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-sm">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Search and Filters */}
              <div className="p-4 border-b border-white/20">
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-200" />
                  <input
                    type="text"
                    placeholder="Search components, templates, assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <AnimatePresence mode="wait">
                  {activeTab === 'components' && (
                    <motion.div
                      key="components"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6"
                    >
                      {['Layout', 'Content', 'Media', 'Interactive', 'Custom'].map((category) => {
                        const categoryComponents = filteredComponents.filter(comp => comp.category === category)
                        if (categoryComponents.length === 0) return null

                        return (
                          <div key={category}>
                            <h3 className="text-sm font-bold text-blue-200 mb-4 uppercase tracking-wider flex items-center gap-2">
                              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                              {category}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                              {categoryComponents.map((component) => (
                                <motion.div
                                  key={component.id}
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onDragStart={() => handleDragStart(component)}
                                  onDragEnd={() => handleDrop(component)}
                                  draggable
                                  className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 cursor-move hover:border-blue-400 hover:bg-white/20 transition-all duration-300 group"
                                >
                                  <div className="flex flex-col items-center gap-3">
                                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300 shadow-lg">
                                      <component.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white text-center">
                                      {component.name}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}

                  {activeTab === 'templates' && (
                    <motion.div
                      key="templates"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="text-center py-8">
                        <FiLayout className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Premium Templates</h3>
                        <p className="text-blue-200">Ready-to-use templates for every industry</p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'assets' && (
                    <motion.div
                      key="assets"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="text-center py-8">
                        <FiImage className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Asset Library</h3>
                        <p className="text-blue-200">High-quality images, icons, and media</p>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'analytics' && (
                    <motion.div
                      key="analytics"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-4"
                    >
                      <div className="text-center py-8">
                        <FiBarChart className="w-16 h-16 text-blue-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Performance Analytics</h3>
                        <p className="text-blue-200">Track engagement and optimize content</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Premium Canvas */}
            <div className="flex-1 flex flex-col relative">
              {/* Canvas Toolbar */}
              <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">Canvas</span>
                      <div className="px-3 py-1 bg-white/20 rounded-full">
                        <span className="text-blue-200 text-sm font-medium">
                          {canvasElements.length} elements
                        </span>
                      </div>
                    </div>
                    
                    {/* Device Preview */}
                    <div className="flex bg-white/10 rounded-xl p-1">
                      {[
                        { mode: 'desktop', icon: FiMonitor, label: 'Desktop' },
                        { mode: 'tablet', icon: FiTablet, label: 'Tablet' },
                        { mode: 'mobile', icon: FiSmartphone, label: 'Mobile' }
                      ].map((device) => (
                        <motion.button
                          key={device.mode}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDeviceMode(device.mode as any)}
                          className={`p-2 rounded-lg transition-colors ${
                            deviceMode === device.mode 
                              ? 'bg-white/20 text-white shadow-lg' 
                              : 'text-blue-200 hover:text-white hover:bg-white/10'
                          }`}
                          title={device.label}
                        >
                          <device.icon className="w-4 h-4" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPreviewMode(!previewMode)}
                      className={`p-3 rounded-xl transition-all duration-200 ${
                        previewMode 
                          ? 'bg-green-500 text-white shadow-lg' 
                          : 'bg-white/10 text-blue-200 hover:bg-white/20'
                      }`}
                      title={previewMode ? 'Exit Preview' : 'Preview Mode'}
                    >
                      {previewMode ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-white/10 text-blue-200 hover:bg-white/20 rounded-xl transition-all duration-200"
                      title="Undo"
                    >
                      <FiRotateCcw className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Canvas Area with Builder.io Overlay */}
              <div className="flex-1 relative overflow-hidden p-6">
                <div className={`h-full bg-white/5 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl transition-all duration-500 ${
                  deviceMode === 'tablet' ? 'max-w-2xl mx-auto' : 
                  deviceMode === 'mobile' ? 'max-w-sm mx-auto' : ''
                }`}>
                  {/* Drop Zone */}
                  <div className="h-full p-8 overflow-y-auto">
                    {canvasElements.length === 0 ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            <FiPlus className="w-12 h-12 text-white" />
                          </div>
                          <h3 className="text-2xl font-bold text-white mb-3">
                            Start Building Your Vision
                          </h3>
                          <p className="text-blue-200 text-lg mb-6 max-w-md">
                            Drag components from the library to create stunning, professional content that converts
                          </p>
                          <div className="flex items-center justify-center gap-4 text-blue-200">
                            <div className="flex items-center gap-2">
                              <FiStar className="w-5 h-5" />
                              <span className="text-sm">Industry Leading</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiShield className="w-5 h-5" />
                              <span className="text-sm">Enterprise Ready</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiClock className="w-5 h-5" />
                              <span className="text-sm">Lightning Fast</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Reorder.Group
                        axis="y"
                        values={canvasElements}
                        onReorder={setCanvasElements}
                        className="space-y-4"
                      >
                        {canvasElements.map((element) => (
                          <Reorder.Item
                            key={element.id}
                            value={element}
                            whileDrag={{ scale: 1.02, rotate: 1 }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.01 }}
                              className={`p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                                selectedElement === element.id
                                  ? 'border-blue-400 bg-blue-500/20 shadow-2xl'
                                  : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                              }`}
                              onClick={() => handleElementSelect(element.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`p-3 rounded-xl shadow-lg ${
                                    selectedElement === element.id
                                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                                      : 'bg-white/20'
                                  }`}>
                                    <element.icon className={`w-5 h-5 ${
                                      selectedElement === element.id ? 'text-white' : 'text-blue-200'
                                    }`} />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-white text-lg">
                                      {element.name}
                                    </h4>
                                    <p className="text-blue-200">
                                      {element.type} component
                                    </p>
                                  </div>
                                </div>
                                
                                {selectedElement === element.id && (
                                  <div className="flex items-center gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => { e.stopPropagation(); handleElementDuplicate(element.id); }}
                                      className="p-2 bg-white/20 hover:bg-white/30 text-blue-200 rounded-lg transition-colors"
                                      title="Duplicate"
                                    >
                                      <FiCopy className="w-4 h-4" />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => { e.stopPropagation(); handleElementDelete(element.id); }}
                                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <FiTrash2 className="w-4 h-4" />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          </Reorder.Item>
                        ))}
                      </Reorder.Group>
                    )}
                  </div>
                </div>

                {/* Builder.io Coming Soon Overlay - Only over Canvas */}
                {showBuilderOverlay && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl">
                    <div className="text-center px-8 bg-white/40 dark:bg-gray-800/40 py-12 rounded-2xl backdrop-blur-sm max-w-2xl mx-4 border border-white/30 dark:border-gray-600/30">
                      <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-r from-blue-100/80 to-purple-100/80 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center mx-auto">
                        <FiGlobe className="w-10 h-10 text-blue-600/80 dark:text-blue-400/80" />
                      </div>
                      <h4 className="text-2xl font-semibold text-gray-900/80 dark:text-white/80 mb-3">
                        Builder.io Integration
                      </h4>
                      <div className="px-4 py-1 bg-gradient-to-r from-green-500/80 to-emerald-500/80 text-white/90 rounded-full text-sm font-bold animate-pulse mb-4 inline-block">
                        COMING SOON
                      </div>
                      <p className="text-gray-600/80 dark:text-gray-300/80 max-w-lg mx-auto mb-6 text-base">
                        A revolutionary, AI-powered, enterprise-grade visual development platform is on its way. Get ready for the future of content management and digital experience!
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500/80 dark:text-gray-400/80 justify-center mb-6">
                        <FiClock className="w-4 h-4" />
                        <span>Feature in development</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/90 hover:to-purple-700/90 text-white/90 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                      >
                        <FiZap className="w-4 h-4" />
                        Get Early Access
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Premium Properties Panel */}
            <AnimatePresence>
              {selectedElement && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: 380 }}
                  exit={{ width: 0 }}
                  className="bg-white/10 backdrop-blur-xl border-l border-white/20"
                >
                  <div className="p-6 border-b border-white/20">
                    <h2 className="text-xl font-bold text-white mb-2">
                      Element Properties
                    </h2>
                    <p className="text-blue-200">
                      Configure and customize your content
                    </p>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Element Info */}
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <FiSettings className="w-5 h-5 text-blue-200" />
                        Element Settings
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-2">
                            Element Type
                          </label>
                          <input
                            type="text"
                            value={canvasElements.find(el => el.id === selectedElement)?.type || ''}
                            readOnly
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-2">
                            Element ID
                          </label>
                          <input
                            type="text"
                            value={selectedElement}
                            readOnly
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Styling Options */}
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <FiDroplet className="w-5 h-5 text-blue-200" />
                        Visual Styling
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-2">
                            Background Color
                          </label>
                          <input
                            type="color"
                            className="w-full h-12 rounded-xl border border-white/20"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-200 mb-2">
                            Padding & Spacing
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="50"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <FiCode className="w-5 h-5 text-blue-200" />
                        Advanced Options
                      </h3>
                      <div className="space-y-3">
                        <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                          <FiCode className="w-4 h-4" />
                          Edit Custom Code
                        </button>
                        <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2">
                          <FiSettings className="w-4 h-4" />
                          Advanced Settings
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  )
} 