/**
 * Image Configuration for Wingspan Yoga
 * 
 * This file centralizes all image definitions for the website, including
 * placeholder images that reflect the nature-inspired, spacious, and open
 * aesthetic described in the Website Design Brief.
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio: string;
  priority?: boolean;
  sizes?: string;
}

// Using Unsplash as a placeholder service with nature-inspired, spacious images
// All images selected to reflect the "nature, sky, open, spacious" theme from the design brief

export const heroImages = {
  homepage: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Serene mountain landscape with lake reflection - placeholder for Wingspan Yoga hero image',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
  aboutAnna: {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Peaceful forest clearing with soft morning light - placeholder for About Anna hero',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
  northWales: {
    src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Dramatic Snowdonia mountain peaks with open sky - placeholder for North Wales classes',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
  london: {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Bright, airy yoga studio with large windows and natural light - placeholder for London classes',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
  online: {
    src: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Peaceful home yoga space with plants and soft natural lighting - placeholder for online classes',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
  privateSessions: {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Intimate, quiet yoga space surrounded by nature - placeholder for private sessions',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
  retreats: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Expansive lake and mountain vista perfect for retreat setting - placeholder for retreats',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
  contact: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Welcoming North Wales landscape with open sky - placeholder for contact page',
    width: 1920,
    height: 1080,
    aspectRatio: '16/9',
    priority: true,
    sizes: '100vw',
  },
} as const;

export const offeringImages = {
  northWalesClasses: {
    src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=600&fit=crop&crop=center',
    alt: 'Snowdonia mountain peaks representing North Wales yoga classes',
    width: 600,
    height: 600,
    aspectRatio: '1/1',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  londonClasses: {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop&crop=center',
    alt: 'Bright urban yoga studio representing London classes',
    width: 600,
    height: 600,
    aspectRatio: '1/1',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  onlineClasses: {
    src: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=600&fit=crop&crop=center',
    alt: 'Serene home yoga space representing online classes',
    width: 600,
    height: 600,
    aspectRatio: '1/1',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  privateSessions: {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop&crop=center',
    alt: 'Peaceful forest setting representing private yoga sessions',
    width: 600,
    height: 600,
    aspectRatio: '1/1',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
  retreats: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop&crop=center',
    alt: 'Mountain lake vista representing yoga retreats',
    width: 600,
    height: 600,
    aspectRatio: '1/1',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  },
} as const;

export const retreatImages = {
  snowdonia: {
    src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=450&fit=crop&crop=center',
    alt: 'Majestic Snowdonia mountains with clear sky - placeholder for Snowdonia retreat',
    width: 800,
    height: 450,
    aspectRatio: '16/9',
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
  worcestershire: {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop&crop=center',
    alt: 'Rolling countryside and ancient trees of Worcestershire - placeholder for Worcestershire retreat',
    width: 800,
    height: 450,
    aspectRatio: '16/9',
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
} as const;

export const portraitImages = {
  anna: {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face',
    alt: 'Portrait of Anna Dorman, yoga instructor - placeholder image',
    width: 400,
    height: 400,
    aspectRatio: '1/1',
    sizes: '(max-width: 768px) 50vw, 25vw',
  },
  annaTeaching: {
    src: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=400&fit=crop&crop=center',
    alt: 'Anna teaching in natural setting - placeholder image',
    width: 600,
    height: 400,
    aspectRatio: '3/2',
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
} as const;

// Blog and content images
export const contentImages = {
  blogHero: {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=600&fit=crop&crop=center',
    alt: 'Peaceful nature scene representing mindful practice - placeholder for blog',
    width: 1200,
    height: 600,
    aspectRatio: '2/1',
    sizes: '(max-width: 768px) 100vw, 75vw',
  },
  placeholder: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop&crop=center',
    alt: 'Nature landscape - placeholder image',
    width: 600,
    height: 400,
    aspectRatio: '3/2',
    sizes: '(max-width: 768px) 100vw, 50vw',
  },
} as const;

// Helper function to get image config by category and key
export function getImageConfig(category: keyof typeof imageConfig, key: string): ImageConfig | undefined {
  const categoryImages = imageConfig[category];
  return (categoryImages as Record<string, ImageConfig>)?.[key];
}

// Combined image configuration export
export const imageConfig = {
  heroes: heroImages,
  offerings: offeringImages,
  retreats: retreatImages,
  portraits: portraitImages,
  content: contentImages,
} as const;
