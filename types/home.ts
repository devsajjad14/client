// types/home.ts
export interface CarouselItem {
  title: string
  url: string
  image: string
  buttonCaption: string
}

export interface MiniBanner {
  title: string
  imgSrc: string
  url: string
  placeholder?: string
}

export interface Brand {
  id: string
  name: string
  logo: string
  slug: string
}
