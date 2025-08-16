import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { offeringImages, retreatImages } from '@/lib/images'
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
      <Hero
        variant="gradient"
        overlay="light"
        className="bg-gradient-to-b from-softyellow-300 to-softblue-300 min-h-screen"
        minHeight="100vh"
        contentAlignment="center"
      >
        <HeroContent maxWidth="4xl">
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <HeroTitle size="xl" className="font-playfair font-bold text-charcoal-800">
                Flow, Breathe, Belong
              </HeroTitle>
            </div>
            
            <HeroDescription size="lg" className="text-charcoal-700 font-lato max-w-3xl mx-auto">
              Yoga inspired by nature&apos;s rhythm, for body, mind, and spirit.
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
          <h2 className="text-4xl font-playfair font-bold text-center text-charcoal-800 mb-12">
            Featured Offerings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {featuredOfferings.map((offering) => (
              <Card key={offering.title} variant="organic" className="group hover:shadow-organic transition-shadow overflow-hidden">
                <div className="bg-white">
                  <Link href={offering.href} className="block">
                    <div className="aspect-square overflow-hidden">
                      <OptimizedImage 
                        config={offering.imageConfig}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-playfair font-semibold text-gray-900 mb-2">
                        {offering.title}
                      </h3>
                      <p className="text-gray-700 text-sm font-lato leading-relaxed">
                        {offering.description}
                      </p>
                    </CardContent>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Quote Pull-out */}
      <section className="py-16 bg-softyellow-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-2xl font-lato italic text-charcoal-700 leading-relaxed">
            &ldquo;Take a moment where you are right now. Can you feel your feet on the ground? 
            Can you soften your jaw, your shoulders, your belly? Can you allow your breath to deepen 
            and slow down? This is where yoga begins – not in a perfect pose, but in the simple 
            act of returning to yourself.&rdquo;
          </blockquote>
          <cite className="block mt-6 text-charcoal-600 font-playfair">
            — Anna Dorman, on What to Expect in a Class
          </cite>
        </div>
      </section>

      {/* Upcoming Events Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-playfair font-bold text-center text-charcoal-800 mb-12">
            Upcoming Retreats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card variant="organic" className="p-0 overflow-hidden">
              <div className="p-8 bg-white">
                <div className="aspect-video overflow-hidden rounded-natural mb-6">
                  <OptimizedImage 
                    config={retreatImages.snowdonia}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-gray-900 mb-4">
                  Snowdonia Retreat
                </h3>
                <p className="text-gray-700 font-lato mb-6">
                  A weekend of yoga and mindfulness nestled in the heart of Snowdonia National Park.
                </p>
                <Button variant="primary" className="font-lato">
                  <Link href="/retreats">Learn More</Link>
                </Button>
              </div>
            </Card>

            <Card variant="organic" className="p-0 overflow-hidden">
              <div className="p-8 bg-white">
                <div className="aspect-video overflow-hidden rounded-natural mb-6">
                  <OptimizedImage 
                    config={retreatImages.worcestershire}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-playfair font-semibold text-gray-900 mb-4">
                  Worcestershire Escape
                </h3>
                <p className="text-gray-700 font-lato mb-6">
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
          <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-6">
            Stay Connected
          </h2>
          <p className="text-lg text-charcoal-600 mb-8 font-lato">
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
