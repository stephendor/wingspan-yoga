import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function ClassesPage() {
  const classTypes = [
    {
      title: 'North Wales Classes',
      description: 'Experience yoga in the breathtaking landscapes of North Wales. Perfect harmony between movement and nature.',
      location: 'Betws-y-Coed & Surrounding Areas',
      schedule: 'Tuesdays & Thursdays, 10:00 AM',
      price: 'From £18 per class',
      href: '/classes/north-wales',
      image: '/images/north-wales-placeholder.jpg',
      highlights: ['Mountain Views', 'Small Groups', 'All Levels Welcome']
    },
    {
      title: 'London Classes',
      description: 'Urban sanctuary in the heart of London. Find peace and strength amidst the city energy.',
      location: 'Central London Studios',
      schedule: 'Weekday Evenings & Weekend Mornings',
      price: 'From £25 per class',
      href: '/classes/london',
      image: '/images/london-placeholder.jpg',
      highlights: ['City Centre', 'After Work Sessions', 'Weekend Options']
    },
    {
      title: 'Online Classes',
      description: 'Join from anywhere in the world. Bring the studio experience to your home practice.',
      location: 'Live Online Sessions',
      schedule: 'Multiple times daily',
      price: 'From £15 per class',
      href: '/classes/online',
      image: '/images/online-placeholder.jpg',
      highlights: ['Join From Anywhere', 'Replay Available', 'Interactive Experience']
    }
  ];

  const classStyles = [
    {
      name: 'Hatha Yoga',
      description: 'Gentle, slower-paced practice focusing on alignment and breath awareness.',
      duration: '75 minutes',
      level: 'All Levels'
    },
    {
      name: 'Vinyasa Flow',
      description: 'Dynamic, flowing sequences that connect breath with movement.',
      duration: '60 minutes',
      level: 'Beginner to Intermediate'
    },
    {
      name: 'Restorative Yoga',
      description: 'Deep relaxation using props to support the body in restful poses.',
      duration: '90 minutes',
      level: 'All Levels'
    },
    {
      name: 'Trauma-Informed Yoga',
      description: 'Safe, inclusive practice with emphasis on choice and body autonomy.',
      duration: '60-75 minutes',
      level: 'All Levels'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        variant="gradient"
        overlay="light"
        className="bg-gradient-to-b from-softyellow-300 to-softblue-300 min-h-[70vh]"
        minHeight="70vh"
        contentAlignment="center"
      >
        <HeroContent maxWidth="4xl">
          <div className="space-y-8 text-center">
            <HeroTitle size="xl" className="font-playfair font-bold text-charcoal-800">
              Yoga Classes
            </HeroTitle>
            
            <HeroDescription size="lg" className="text-charcoal-700 font-lato max-w-3xl mx-auto">
              Discover your perfect practice. From peaceful North Wales landscapes to vibrant London studios, 
              or the comfort of your own home - find the class that speaks to your soul.
            </HeroDescription>
            
            <HeroActions spacing="lg" justify="center">
              <Link href="#class-types">
                <Button size="xl" variant="primary" className="font-lato">
                  Explore Classes
                </Button>
              </Link>
              <Link href="/membership">
                <Button size="xl" variant="secondary" className="font-lato">
                  View Membership
                </Button>
              </Link>
            </HeroActions>
          </div>
        </HeroContent>
      </Hero>

      {/* Class Types Section */}
      <section id="class-types" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Choose Your Practice
            </h2>
            <p className="text-lg text-charcoal-600 font-lato max-w-3xl mx-auto">
              Whether you prefer the tranquility of nature, the energy of the city, or the convenience of home practice, 
              we have the perfect setting for your yoga journey.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {classTypes.map((classType, index) => (
              <Card key={index} variant="organic" className="p-0 overflow-hidden">
                <div className="p-8 bg-gradient-to-b from-softyellow-300 to-softblue-300">
                  {/* Image Placeholder */}
                  <div className="aspect-video bg-white/20 rounded-natural mb-6 flex items-center justify-center">
                    <span className="text-white font-lato text-sm">
                      {classType.title} Image
                    </span>
                  </div>

                  <h3 className="text-2xl font-playfair font-semibold text-white mb-3">
                    {classType.title}
                  </h3>
                  
                  <p className="text-white/90 font-lato mb-4">
                    {classType.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-white/90 font-lato text-sm">
                      <span className="font-semibold mr-2">📍</span>
                      {classType.location}
                    </div>
                    <div className="flex items-center text-white/90 font-lato text-sm">
                      <span className="font-semibold mr-2">⏰</span>
                      {classType.schedule}
                    </div>
                    <div className="flex items-center text-white/90 font-lato text-sm">
                      <span className="font-semibold mr-2">💰</span>
                      {classType.price}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {classType.highlights.map((highlight, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-white/20 rounded-full text-white text-xs font-lato"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <Button variant="primary" className="w-full font-lato">
                    <Link href={classType.href}>
                      Learn More & Book
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Class Styles Section */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Yoga Styles Offered
            </h2>
            <p className="text-lg text-charcoal-600 font-lato max-w-3xl mx-auto">
              Each class is thoughtfully designed to meet you where you are in your practice, 
              with modifications and variations offered for every body and ability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classStyles.map((style, index) => (
              <Card key={index} variant="default" className="p-6">
                <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-2">
                  {style.name}
                </h3>
                <p className="text-charcoal-600 font-lato mb-4">
                  {style.description}
                </p>
                <div className="flex justify-between text-sm text-charcoal-500 font-lato">
                  <span><strong>Duration:</strong> {style.duration}</span>
                  <span><strong>Level:</strong> {style.level}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Private Sessions CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-6">
            Need Something More Personal?
          </h2>
          <p className="text-lg text-charcoal-600 font-lato mb-8">
            One-on-one sessions tailored specifically to your needs, goals, and body. 
            Work with Anna to develop a practice that&apos;s uniquely yours.
          </p>
          <Button size="xl" variant="primary" className="font-lato">
            <Link href="/private-sessions">
              Book Private Session
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
