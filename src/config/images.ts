export interface ImageConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const imageConfig = {
  // Hero Images
  hero: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&crop=center',
    alt: 'Serene forest landscape with misty mountains, embodying the peaceful essence of nature-inspired yoga',
    width: 1920,
    height: 1080,
  },

  // Featured Offerings
  featuredOffering1: {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=center',
    alt: 'Peaceful sunrise yoga practice by a tranquil lake with mountains in the background',
    width: 800,
    height: 600,
  },
  featuredOffering2: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    alt: 'Serene forest yoga session with dappled sunlight filtering through trees',
    width: 800,
    height: 600,
  },
  featuredOffering3: {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
    alt: 'Open meadow yoga practice with rolling hills and expansive sky',
    width: 800,
    height: 600,
  },

  // Classes
  northWalesClasses: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    alt: 'Majestic North Wales landscape with mountains and valleys, perfect for outdoor yoga',
    width: 800,
    height: 600,
  },
  londonClasses: {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
    alt: 'Peaceful urban yoga studio with natural light and plants',
    width: 800,
    height: 600,
  },
  onlineClasses: {
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&crop=center',
    alt: 'Calm home yoga space with soft lighting and minimal setup',
    width: 800,
    height: 600,
  },

  // Blog
  blogHero: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop&crop=center',
    alt: 'Inspiring natural landscape representing mindful living and yoga philosophy',
    width: 1200,
    height: 600,
  },
  defaultBlogImage: {
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
    alt: 'Peaceful yoga and mindfulness setting',
    width: 800,
    height: 600,
  },

  // Retreat Sections  
  retreat1: {
    src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=600&fit=crop&crop=center',
    alt: 'Tranquil mountain lake reflecting peaceful skies, perfect for yoga retreats',
    width: 600,
    height: 600,
  },
  retreat2: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop&crop=center',
    alt: 'Serene countryside setting with rolling green hills and open spaces',
    width: 600,
    height: 600,
  },
} as const;

export type ImageConfigKey = keyof typeof imageConfig;
