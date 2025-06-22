declare module 'react-image-magnifiers' {
  import { ComponentType, ReactNode } from 'react'

  export interface SideBySideMagnifierProps {
    imageSrc: string
    imageAlt: string
    largeImageSrc?: string
    className?: string
    style?: React.CSSProperties
    alwaysInPlace?: boolean
    overlayOpacity?: number
    switchSides?: boolean
    zoomPosition?: 'right' | 'left'
    inPlaceMinBreakpoint?: number
    fillAvailableSpace?: boolean
    fillAlignTop?: boolean
    fillGapTop?: number
    fillGapRight?: number
    fillGapBottom?: number
    fillGapLeft?: number
    zoomContainerBorder?: string
    zoomContainerBoxShadow?: string
    onImageLoad?: () => void
    onImageError?: () => void
    children?: ReactNode
  }

  export class SideBySideMagnifier extends React.Component<SideBySideMagnifierProps> {}
} 