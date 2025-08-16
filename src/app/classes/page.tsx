import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { offeringImages } from '@/lib/images'
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
      imageKey: 'northWalesClasses',
      highlights: ['Mountain Views', 'Small Groups', 'All Levels Welcome']
    },
    {
      title: 'London Classes',
      description: 'Urban sanctuary in the heart of London. Find peace and strength amidst the city energy.',
      location: 'Central London Studios',
      schedule: 'Weekday Evenings & Weekend Mornings',
      price: 'From £25 per class',
      href: '/classes/london',
      imageKey: 'londonClasses',
      highlights: ['City Centre', 'After Work Sessions', 'Weekend Options']
    },
    {
      title: 'Online Classes',
      description: 'Join from anywhere in the world. Bring the studio experience to your home practice.',
      location: 'Live Online Sessions',
      schedule: 'Multiple times daily',
      price: 'From £15 per class',
      href: '/classes/online',
      imageKey: 'onlineClasses',
      highlights: ['Join From Anywhere', 'Replay Available', 'Interactive Experience']
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
                <div className="p-8 bg-white">
                  {/* Class Image */}
                  <div className="aspect-video rounded-natural mb-6 overflow-hidden">
                    <OptimizedImage
                      config={offeringImages[classType.imageKey as keyof typeof offeringImages]}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-2xl font-playfair font-semibold text-gray-900 mb-3">
                    {classType.title}
                  </h3>
                  
                  <p className="text-gray-700 font-lato mb-4">
                    {classType.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-700 font-lato text-sm">
                      <span className="font-semibold mr-2">📍</span>
                      {classType.location}
                    </div>
                    <div className="flex items-center text-gray-700 font-lato text-sm">
                      <span className="font-semibold mr-2">⏰</span>
                      {classType.schedule}
                    </div>
                    <div className="flex items-center text-gray-700 font-lato text-sm">
                      <span className="font-semibold mr-2">💰</span>
                      {classType.price}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {classType.highlights.map((highlight, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-gray-100 rounded-full text-gray-700 text-xs font-lato"
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

      {/* What to Expect Section */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              What to Expect in a Class
            </h2>
          </div>
          
          <div className="bg-white p-8 rounded-natural shadow-soft mb-12">
            <blockquote className="text-lg md:text-xl font-lato italic text-gray-600 leading-relaxed text-center">
              &ldquo;Take a moment where you are right now. Can you feel your feet on the ground? Can you feel the breath moving in your belly or rib cage? Can you feel the natural curves of your spine and the gentle reach of the crown of your head skywards? The principles of surrendering to gravity and connecting to the breath are key in the style of yoga that I practice and teach. We work gently, softly, slowly and tend to our bodies with utmost care, compassion and respect.&rdquo;
            </blockquote>
          </div>

          <div className="prose prose-lg mx-auto text-charcoal-700 font-lato">
            <p className="text-center mb-6">
              I am most inspired by the pioneering work of female post-lineage yogis such as Vanda Scaravelli, Angela Farmer, Donna Fahri and Donna Martin (Psoma Yoga Therapy). The 2 year teacher training I undertook was led by a faculty of diverse, highly experienced practitioners: Chloe Freemantle, Anne-Marie Zulkahari, Giovanni Felicioni, Pete Blackaby (Intelligent Yoga) & Lisa Mcrory. With respect and gratitude to all of the above.
            </p>
            <p className="text-center mb-6">
              In a class you will be encouraged to work at your own pace and to cultivate a friendly curiosity towards the body as you explore different movements and poses.
            </p>
            <p className="text-center">
              As Donna Fahri says, &ldquo;The teacher&apos;s role is to be the agent for guiding the student to their own perception, thoughts, feelings, kinesthesia and insights.&rdquo; My aim is for the class to offer you a space where you feel free to be yourself and to meet yourself exactly where you are.
            </p>
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
