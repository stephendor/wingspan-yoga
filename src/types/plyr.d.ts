declare module 'plyr' {
  interface PlyrOptions {
    controls?: string[]
    settings?: string[]
    quality?: {
      default: string | number
      options: (string | number)[]
    }
    speed?: {
      selected: number
      options: number[]
    }
    seekTime?: number
    keyboard?: {
      focused: boolean
      global: boolean
    }
    tooltips?: {
      controls: boolean
      seek: boolean
    }
    captions?: {
      active: boolean
      update: boolean
    }
    poster?: string
    preload?: string
    ratio?: string
    storage?: {
      enabled: boolean
      key: string
    }
  }

  interface PlyrSource {
    type: string
    title?: string
    sources: Array<{
      src: string
      type: string
      headers?: Record<string, string>
    }>
    poster?: string
  }

  class Plyr {
    constructor(element: HTMLVideoElement, options?: PlyrOptions)
    
    // Properties
    currentTime: number
    duration: number
    source: PlyrSource
    
    // Methods
    destroy(): void
  on(event: string, callback: (event?: unknown) => void): void
    
    // Events
    static readonly events: {
      readonly ready: string
      readonly loadedmetadata: string
      readonly timeupdate: string
      readonly ended: string
      readonly error: string
      readonly canplaythrough: string
    }
  }

  export = Plyr
}