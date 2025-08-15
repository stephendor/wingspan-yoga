'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const heroVariants = cva(
  "relative flex items-center justify-center min-h-screen overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-sage-50 via-warm-50 to-blush-50",
        gradient: "bg-gradient-to-br from-sage-500 via-ocean-500 to-terracotta-500",
        dark: "bg-charcoal-900",
        transparent: "bg-transparent",
      },
      contentAlignment: {
        center: "text-center",
        left: "text-left",
        right: "text-right",
      },
      overlay: {
        none: "",
        light: "before:absolute before:inset-0 before:bg-black/20 before:z-10",
        medium: "before:absolute before:inset-0 before:bg-black/40 before:z-10",
        dark: "before:absolute before:inset-0 before:bg-black/60 before:z-10",
        gradient: "before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/30 before:via-black/20 before:to-black/50 before:z-10",
      },
    },
    defaultVariants: {
      variant: "default",
      contentAlignment: "center",
      overlay: "none",
    },
  }
)

export interface HeroProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof heroVariants> {
  backgroundImage?: string
  backgroundVideo?: string
  videoOptions?: {
    muted?: boolean
    autoPlay?: boolean
    loop?: boolean
    playsInline?: boolean
  }
  minHeight?: string
  maxHeight?: string
}

const Hero = React.forwardRef<HTMLElement, HeroProps>(
  ({ 
    className, 
    variant, 
    contentAlignment,
    overlay, 
    children, 
    backgroundImage, 
    backgroundVideo,
    videoOptions = {
      muted: true,
      autoPlay: true,
      loop: true,
      playsInline: true,
    },
    minHeight = "100vh",
    maxHeight,
    style,
    ...props 
  }, ref) => {
    const videoRef = React.useRef<HTMLVideoElement>(null)
    const [videoLoaded, setVideoLoaded] = React.useState(false)
    const [videoError, setVideoError] = React.useState(false)

    React.useEffect(() => {
      const video = videoRef.current
      if (!video || !backgroundVideo) return

      const handleLoadedData = () => setVideoLoaded(true)
      const handleError = () => setVideoError(true)

      video.addEventListener('loadeddata', handleLoadedData)
      video.addEventListener('error', handleError)

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData)
        video.removeEventListener('error', handleError)
      }
    }, [backgroundVideo])

    const heroStyle = {
      minHeight,
      ...(maxHeight && { maxHeight }),
      ...style,
    }

    return (
      <section
        ref={ref}
        className={clsx(heroVariants({ variant, contentAlignment, overlay, className }))}
        style={heroStyle}
        {...props}
      >
        {/* Background Media */}
        {backgroundVideo && (
          <video
            ref={videoRef}
            className={clsx(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
              videoLoaded && !videoError ? "opacity-100" : "opacity-0"
            )}
            muted={videoOptions.muted}
            autoPlay={videoOptions.autoPlay}
            loop={videoOptions.loop}
            playsInline={videoOptions.playsInline}
            preload="metadata"
            aria-hidden="true"
          >
            <source src={backgroundVideo} type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
          </video>
        )}
        
        {backgroundImage && (
          <div
            className={clsx(
              "absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat",
              backgroundVideo && !videoError ? "opacity-0" : "opacity-100"
            )}
            style={{ backgroundImage: `url(${backgroundImage})` }}
            role="img"
            aria-hidden="true"
          />
        )}

        {/* Content Container */}
        <div className="relative z-20 w-full">
          {children}
        </div>
      </section>
    )
  }
)
Hero.displayName = "Hero"

const HeroContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    container?: boolean
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full'
  }
>(({ className, container = true, maxWidth = '4xl', children, ...props }, ref) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div
      ref={ref}
      className={clsx(
        container && "container mx-auto px-4",
        maxWidthClasses[maxWidth],
        container && "mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
HeroContent.displayName = "HeroContent"

const HeroTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
    gradient?: boolean
    gradientFrom?: string
    gradientTo?: string
  }
>(({ 
  className, 
  size = 'xl', 
  gradient = false,
  gradientFrom = 'from-sage-600',
  gradientTo = 'to-ocean-600',
  children, 
  ...props 
}, ref) => {
  const sizeClasses = {
    sm: 'text-3xl md:text-4xl',
    md: 'text-4xl md:text-5xl',
    lg: 'text-5xl md:text-6xl',
    xl: 'text-6xl md:text-7xl',
    '2xl': 'text-7xl md:text-8xl',
    '3xl': 'text-8xl md:text-9xl',
  }

  return (
    <h1
      ref={ref}
      className={clsx(
        "font-heading font-bold leading-tight",
        sizeClasses[size],
        gradient 
          ? `bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`
          : "text-white",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
})
HeroTitle.displayName = "HeroTitle"

const HeroSubtitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }
>(({ className, size = 'lg', children, ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl',
    xl: 'text-3xl md:text-4xl',
  }

  return (
    <p
      ref={ref}
      className={clsx(
        "font-medium text-white/90",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
})
HeroSubtitle.displayName = "HeroSubtitle"

const HeroDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: 'sm' | 'md' | 'lg'
  }
>(({ className, size = 'md', children, ...props }, ref) => {
  const sizeClasses = {
    sm: 'text-base md:text-lg',
    md: 'text-lg md:text-xl',
    lg: 'text-xl md:text-2xl',
  }

  return (
    <p
      ref={ref}
      className={clsx(
        "leading-relaxed text-white/80",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
})
HeroDescription.displayName = "HeroDescription"

const HeroActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    orientation?: 'horizontal' | 'vertical'
    spacing?: 'sm' | 'md' | 'lg'
    justify?: 'start' | 'center' | 'end'
  }
>(({ 
  className, 
  orientation = 'horizontal', 
  spacing = 'md',
  justify = 'center',
  children, 
  ...props 
}, ref) => {
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  }

  return (
    <div
      ref={ref}
      className={clsx(
        "flex",
        orientation === 'horizontal' ? "flex-col sm:flex-row" : "flex-col",
        spacingClasses[spacing],
        justifyClasses[justify],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
HeroActions.displayName = "HeroActions"

export {
  Hero,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  HeroDescription,
  HeroActions,
}