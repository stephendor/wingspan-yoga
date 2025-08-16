import Image from 'next/image';
import { ImageConfig } from '@/lib/images';

interface OptimizedImageProps extends Omit<React.ComponentProps<typeof Image>, 'src' | 'alt' | 'width' | 'height' | 'sizes'> {
  config: ImageConfig;
  className?: string;
}

/**
 * Optimized Image component that wraps Next.js Image with our configuration
 * Automatically applies appropriate settings for responsive images
 */
export function OptimizedImage({ config, className = '', ...props }: OptimizedImageProps) {
  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={config.width}
      height={config.height}
      sizes={config.sizes}
      priority={config.priority}
      className={className}
      {...props}
    />
  );
}

/**
 * Background Image component for hero sections
 * Applies the image as a background with proper overlay support
 */
interface BackgroundImageProps {
  config: ImageConfig;
  children: React.ReactNode;
  overlay?: 'light' | 'medium' | 'dark';
  className?: string;
}

export function BackgroundImage({ 
  config, 
  children, 
  overlay = 'medium',
  className = '' 
}: BackgroundImageProps) {
  const overlayClasses = {
    light: 'bg-black/20',
    medium: 'bg-black/40',
    dark: 'bg-black/60',
  };

  return (
    <div 
      className={`relative bg-cover bg-center bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url(${config.src})`,
      }}
    >
      <div className={`absolute inset-0 ${overlayClasses[overlay]}`} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
