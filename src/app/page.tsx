import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { OptimizedImage, BackgroundImage } from '@/components/ui/optimized-image'
import { heroImages, offeringImages, retreatImages } from '@/lib/images'
import Link from 'next/link'

export default function HomePage() {
  const featuredOfferings = [
    {
      title: 'North Wales Classes',
      description: 'In-person yoga classes in the beautiful landscapes of North Wales.',
      href: '/classes/north-wales',
      imageConfig: offeringImages.northWalesClasses,
    },
    {
      title: 'London Classes',
      description: 'Urban yoga sessions in the heart of London.',
      href: '/classes/london',
      imageConfig: offeringImages.londonClasses,
    },
    {
      title: 'Online Classes',
      description: 'Join from anywhere with our live online yoga sessions.',
      href: '/classes/online',
      imageConfig: offeringImages.onlineClasses,
    },
    {
      title: 'Private Sessions',
      description: 'Personalized one-on-one yoga sessions tailored to your needs.',
      href: '/private-sessions',
      imageConfig: offeringImages.privateSessions,
    },
    {
      title: 'Retreats',
      description: 'Immersive yoga retreats in stunning natural locations.',
      href: '/retreats',
      imageConfig: offeringImages.retreats,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Figma Design */}
      <BackgroundImage
        config={heroImages.homepage}
        overlay="light"
        className="min-h-screen bg-gradient-to-br from-softpink-300/80 to-softblue-300/80"
      >
        <Hero
          variant="gradient"
          overlay="none"
          className="min-h-screen"
          minHeight="100vh"
          contentAlignment="center"
        >
          <HeroContent maxWidth="4xl" className="relative z-10">
            <div className="space-y-8 text-center">
              <div className="space-y-4">
                <HeroTitle size="xl" className="text-heading1 font-playfair text-white drop-shadow-lg">
                  Flow, Breathe, Belong
                </HeroTitle>
              </div>
              
              <HeroDescription size="lg" className="text-body font-lato text-white/95 max-w-3xl mx-auto drop-shadow-md">
                Yoga inspired by nature&apos;s rhythm
              </HeroDescription>
            
            <HeroActions spacing="lg" justify="center">
              <Link href="/classes">
                <Button size="xl" variant="primary" className="font-lato">
                  Book a Class
                </Button>
              </Link>
              <Link href="/retreats">
                <Button size="xl" variant="secondary" className="font-lato">
                  Explore Retreats
                </Button>
              </Link>
            </HeroActions>
          </div>
        </HeroContent>
        </Hero>
      </BackgroundImage>

      {/* Welcome Message */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg text-charcoal-600 leading-relaxed font-lato">
            Welcome to Wingspan Yoga, where movement meets mindfulness in harmony with nature&apos;s wisdom. 
            Anna Dorman brings over 15 years of experience in trauma-informed, alignment-focused yoga, 
            creating a safe and inclusive space for practitioners of all levels to explore their practice.
          </p>
        </div>
      </section>

      {/* Featured Offerings - 5 Cards Layout */}
      <section className="py-16 bg-softgreen-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-heading2 text-center text-charcoal-800 mb-12">
            Featured Offerings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {featuredOfferings.map((offering) => (
              <Card key={offering.title} variant="organic" className="group hover:shadow-lg hover:shadow-softgreen-200/50 transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
                <Link href={offering.href} className="block h-full">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <OptimizedImage 
                      config={offering.imageConfig}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3 group-hover:text-softgreen-700 transition-colors">
                      {offering.title}
                    </h3>
                    <p className="text-body text-charcoal-600 leading-relaxed">
                      {offering.description}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Quote Pull-out */}
      <section className="py-16 bg-softgreen-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="quote-pullout text-center shadow-sm">
            <blockquote className="text-quote mb-6">
              &ldquo;Take a moment where you are right now. Can you feel your feet on the ground? 
              Can you soften your jaw, your shoulders, your belly? Can you allow your breath to deepen 
              and slow down? This is where yoga begins – not in a perfect pose, but in the simple 
              act of returning to yourself.&rdquo;
            </blockquote>
            <cite className="block text-lg font-playfair font-medium text-charcoal-700">
              — Anna Dorman, on What to Expect in a Class
            </cite>
          </div>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-heading2 text-center text-charcoal-800 mb-12">
            Upcoming Retreats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="organic" className="p-0 overflow-hidden group hover:shadow-lg hover:shadow-softgreen-200/50 transition-all duration-300">
              <div className="p-8 bg-white">
                <div className="aspect-video overflow-hidden rounded-natural mb-6">
                  <OptimizedImage 
                    config={retreatImages.snowdonia}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-charcoal-800 mb-4 group-hover:text-softgreen-700 transition-colors">
                  Snowdonia Retreat
                </h3>
                <p className="text-body text-charcoal-600 mb-6">
                  A weekend of yoga and mindfulness nestled in the heart of Snowdonia National Park.
                </p>
                <Button variant="primary" className="font-lato">
                  <Link href="/retreats">Learn More</Link>
                </Button>
              </div>
            </Card>

            <Card variant="organic" className="p-0 overflow-hidden group hover:shadow-lg hover:shadow-softgreen-200/50 transition-all duration-300">
              <div className="p-8 bg-white">
                <div className="aspect-video overflow-hidden rounded-natural mb-6">
                  <OptimizedImage 
                    config={retreatImages.worcestershire}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-charcoal-800 mb-4 group-hover:text-softgreen-700 transition-colors">
                  Worcestershire Escape
                </h3>
                <p className="text-body text-charcoal-600 mb-6">
                  Reconnect with nature and yourself in the peaceful countryside of Worcestershire.
                </p>
                <Button variant="primary" className="font-lato">
                  <Link href="/retreats">Learn More</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-heading2 text-charcoal-800 mb-6">
            Stay Connected
          </h2>
          <p className="text-body text-charcoal-600 mb-8">
            Join our community for updates on classes, retreats, and mindful living insights.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-softgreen-300 focus:outline-none focus:ring-2 focus:ring-softgreen-500 font-lato"
              />
              <Button variant="primary" className="font-lato">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
