import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function LondonClassesPage() {
  const weeklySchedule = [
    {
      day: 'Monday',
      time: '7:00 PM - 8:15 PM',
      style: 'Vinyasa Flow',
      level: 'Beginner to Intermediate',
      location: 'Clapham Studio',
      description: 'Start your week with dynamic flow to release weekend stagnation and prepare for the week ahead.'
    },
    {
      day: 'Wednesday',
      time: '6:30 AM - 7:30 AM',
      style: 'Energizing Hatha',
      level: 'All Levels',
      location: 'Canary Wharf Studio',
      description: 'Early morning practice to energize your body and mind before the workday begins.'
    },
    {
      day: 'Wednesday',
      time: '7:30 PM - 8:45 PM',
      style: 'Restorative Yoga',
      level: 'All Levels',
      location: 'Clapham Studio',
      description: 'Mid-week restoration to counter urban stress and digital overwhelm.'
    },
    {
      day: 'Friday',
      time: '6:30 PM - 7:45 PM',
      style: 'Power Flow',
      level: 'Intermediate to Advanced',
      location: 'Canary Wharf Studio',
      description: 'End your work week with strength-building sequences and energizing breathwork.'
    },
    {
      day: 'Saturday',
      time: '10:00 AM - 11:30 AM',
      style: 'Slow Flow & Meditation',
      level: 'All Levels',
      location: 'Clapham Studio',
      description: 'Weekend morning practice combining gentle movement with extended meditation.'
    },
    {
      day: 'Sunday',
      time: '4:00 PM - 5:15 PM',
      style: 'Yin Yoga',
      level: 'All Levels',
      location: 'Clapham Studio',
      description: 'Sunday afternoon deep release to prepare for the week ahead with calm presence.'
    }
  ];

  const studios = [
    {
      name: 'Clapham Studio',
      address: 'The Yoga Studio, 142 Clapham High Street, SW4 7UH',
      description: 'Beautiful Victorian conversion with high ceilings, natural light, and peaceful atmosphere.',
      amenities: ['Underground heating', 'Changing rooms', 'Mat storage', 'Props provided', 'Shower facilities'],
      transport: ['Clapham High Street (Overground)', 'Clapham Common (Northern Line)', 'Multiple bus routes'],
      parking: 'Street parking available after 6:30pm and weekends'
    },
    {
      name: 'Canary Wharf Studio',
      address: 'Mindful Movement, Level 3, Canada Place, E14 5AH',
      description: 'Modern studio in the heart of London\'s financial district with panoramic city views.',
      amenities: ['Air conditioning', 'Premium sound system', 'Lockers', 'Equipment provided', 'Water station'],
      transport: ['Canary Wharf (Elizabeth Line/DLR)', 'Canada Water (Jubilee Line)', 'Thames Clipper (Canary Wharf Pier)'],
      parking: 'Paid parking available in Canada Place multi-storey'
    }
  ];

  const pricingOptions = [
    {
      title: 'Drop-in Class',
      price: '£22',
      description: 'Flexibility for busy London schedules',
      features: ['Single class entry', 'Book up to 2 hours before', 'Cancel up to 6 hours ahead', 'No membership required']
    },
    {
      title: '5-Class Package',
      price: '£95',
      originalPrice: '£110',
      description: 'Perfect for regular practice',
      features: ['Use within 8 weeks', '£15 saving vs drop-in', 'Shareable with family/friends', 'Priority booking']
    },
    {
      title: '10-Class Package',
      price: '£180',
      originalPrice: '£220',
      description: 'Best value for committed practitioners',
      features: ['Use within 12 weeks', '£40 saving vs drop-in', 'Workshop discounts', 'Free guest pass']
    },
    {
      title: 'Monthly Unlimited',
      price: '£120',
      description: 'For dedicated London yogis',
      features: ['All London classes', 'Home studio access', 'Special events included', '10% retail discount']
    }
  ];

  const urbanBenefits = [
    {
      title: 'Stress Relief',
      icon: '🧘‍♀️',
      description: 'Counter the intensity of city life with mindful movement and breathwork'
    },
    {
      title: 'Community Connection',
      icon: '🤝',
      description: 'Meet like-minded people and build genuine connections in the urban jungle'
    },
    {
      title: 'Physical Balance',
      icon: '⚖️',
      description: 'Counteract desk work, commuting, and urban posture challenges'
    },
    {
      title: 'Mental Clarity',
      icon: '🧠',
      description: 'Find focus and calm amidst London\'s fast-paced environment'
    }
  ];

  const commutingTips = [
    'Keep a yoga mat at the studio to avoid carrying on public transport',
    'Book morning classes the night before to secure your spot',
    'Use Citymapper app for real-time transport updates',
    'Both studios are within 5 minutes walk of major transport hubs',
    'Evening classes: arrive 10 minutes early to decompress from your day'
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
              London Yoga Classes
            </HeroTitle>
            
            <HeroDescription size="lg" className="text-charcoal-700 font-lato max-w-3xl mx-auto">
              Find your sanctuary in the city. Accessible studios, convenient schedules, 
              and a community that understands the rhythms of London life.
            </HeroDescription>
            
            <HeroActions spacing="lg" justify="center">
              <Link href="#schedule">
                <Button size="xl" variant="primary" className="font-lato">
                  View Schedule
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="secondary" className="font-lato">
                  Book a Class
                </Button>
              </Link>
            </HeroActions>
          </div>
        </HeroContent>
      </Hero>

      {/* Why Yoga in London */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Your Urban Sanctuary
            </h2>
            <p className="text-lg text-charcoal-600 font-lato max-w-3xl mx-auto">
              London&apos;s energy is infectious, but it can also be overwhelming. Our classes are designed 
              specifically for city dwellers who need to restore, recharge, and reconnect amidst the hustle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {urbanBenefits.map((benefit, index) => (
              <Card key={index} variant="default" className="p-6 text-center">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-charcoal-600 font-lato text-sm">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section id="schedule" className="py-16 bg-softblue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Weekly Schedule
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Classes designed around London life - early mornings, post-work, and restorative weekends
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {weeklySchedule.map((session, index) => (
              <Card key={index} variant="organic" className="p-0 overflow-hidden">
                <div className="p-6 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-playfair font-semibold text-gray-900">
                      {session.day}
                    </h3>
                    <span className="text-gray-600 font-lato text-xs bg-gray-100 px-2 py-1 rounded-full">
                      {session.level}
                    </span>
                  </div>
                  
                  <div className="text-gray-700 font-lato text-lg font-semibold mb-2">
                    {session.time}
                  </div>
                  
                  <div className="text-gray-900 font-lato font-semibold mb-2">
                    {session.style}
                  </div>
                  
                  <div className="text-gray-600 font-lato text-sm mb-3 flex items-center">
                    <span className="mr-1">🚇</span> {session.location}
                  </div>
                  
                  <p className="text-gray-700 font-lato text-sm">
                    {session.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-charcoal-600 font-lato mb-4">
              <strong>Booking:</strong> Reserve your spot online or via our app. 
              Late arrivals may not be admitted to maintain class flow.
            </p>
            <Button size="lg" variant="primary" className="font-lato">
              <Link href="/contact">
                Reserve Your Spot
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Special Workshops */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Special Workshops & Events
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Deepen your practice with seasonal workshops and special events in the heart of London
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 max-w-4xl mx-auto">
            {/* Autumn Equinox Workshop */}
            <Card variant="elevated" className="p-0 overflow-hidden">
              <div className="p-8 bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="lg:flex-1">
                    <h3 className="text-2xl font-playfair font-bold text-charcoal-800 mb-2">
                      Autumn Equinox Workshop
                    </h3>
                    <div className="text-charcoal-700 font-lato text-lg font-semibold mb-2">
                      Saturday 21st September 2025
                    </div>
                    <div className="text-charcoal-600 font-lato mb-3">
                      🕐 2:00 PM - 4:30 PM (2.5 hours)
                    </div>
                    <div className="text-charcoal-600 font-lato mb-4">
                      📍 North London Buddhist Centre, Alexandra Palace Road, N10 2DH
                    </div>
                  </div>
                  <div className="lg:text-right">
                    <div className="text-2xl font-playfair font-bold text-charcoal-800 mb-1">
                      £30 / £35
                    </div>
                    <div className="text-sm text-charcoal-600 font-lato">
                      advance / on the day
                    </div>
                    <div className="mt-2 inline-block px-3 py-1 bg-softgreen-200 text-charcoal-700 rounded-full text-xs font-lato font-semibold">
                      All levels welcome
                    </div>
                  </div>
                </div>

                <p className="text-charcoal-700 font-lato mb-6 leading-relaxed">
                  Join us for a special Autumn Equinox workshop as we transition into the new season. 
                  A perfect blend of mindful movement, breathwork, and meditation to help you find 
                  balance as day and night become equal.
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold text-charcoal-800 font-lato mb-3 flex items-center">
                    <span className="mr-2">✨</span> Workshop Includes:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="text-charcoal-600 font-lato text-sm flex items-start">
                      <span className="mr-2 mt-1 text-softgreen-600">•</span>
                      2.5 hours of guided yoga practice
                    </div>
                    <div className="text-charcoal-600 font-lato text-sm flex items-start">
                      <span className="mr-2 mt-1 text-softgreen-600">•</span>
                      Seasonal meditation and breathwork
                    </div>
                    <div className="text-charcoal-600 font-lato text-sm flex items-start">
                      <span className="mr-2 mt-1 text-softgreen-600">•</span>
                      Herbal tea and light refreshments
                    </div>
                    <div className="text-charcoal-600 font-lato text-sm flex items-start">
                      <span className="mr-2 mt-1 text-softgreen-600">•</span>
                      Take-home resource materials
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button size="lg" variant="primary" className="font-lato flex-1">
                    <Link href="/contact">
                      Book Workshop (£30)
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary" className="font-lato">
                    <Link href="/contact">
                      More Information
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-charcoal-600 font-lato text-sm mb-4">
              <strong>Note:</strong> Advanced booking recommended. Limited spaces available.
            </p>
            <p className="text-charcoal-600 font-lato text-sm">
              Travel: 5 minutes walk from Alexandra Palace Station (National Rail) 
              or bus routes W3, 144, 184 to Alexandra Palace Road
            </p>
          </div>
        </div>
      </section>

      {/* Studio Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Studio Locations
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Two beautiful studios strategically located for easy access across London
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {studios.map((studio, index) => (
              <Card key={index} variant="default" className="p-6">
                <h3 className="text-2xl font-playfair font-semibold text-charcoal-800 mb-2">
                  {studio.name}
                </h3>
                <p className="text-charcoal-600 font-lato text-sm mb-3 flex items-start">
                  <span className="mr-2 mt-0.5">📍</span> {studio.address}
                </p>
                <p className="text-charcoal-600 font-lato mb-4">
                  {studio.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-charcoal-800 font-lato mb-2 flex items-center">
                    <span className="mr-2">✨</span> Studio Features:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {studio.amenities.map((amenity, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-softblue-100 text-charcoal-700 rounded-full text-xs font-lato"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-charcoal-800 font-lato mb-2 flex items-center">
                    <span className="mr-2">🚇</span> Transport Links:
                  </h4>
                  <ul className="text-charcoal-600 font-lato text-sm space-y-1">
                    {studio.transport.map((option, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2 mt-0.5 text-softgreen-600">•</span>
                        {option}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <p className="text-charcoal-600 font-lato text-sm">
                  <strong>🚗 Parking:</strong> {studio.parking}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Commuting Tips */}
      <section className="py-16 bg-softyellow-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              London Commuter Tips
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Make yoga part of your London routine with these insider tips
            </p>
          </div>

          <Card variant="default" className="p-8">
            <div className="space-y-4">
              {commutingTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-charcoal-700 font-lato flex-1">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              London Pricing
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Premium London studios with fair, transparent pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingOptions.map((option, index) => (
              <Card key={index} variant="default" className="p-6 relative">
                {option.originalPrice && (
                  <div className="absolute top-4 right-4 bg-softpink-300 text-charcoal-800 px-2 py-1 rounded-full text-xs font-lato font-semibold">
                    Save £{parseInt(option.originalPrice.replace('£', '')) - parseInt(option.price.replace('£', ''))}
                  </div>
                )}
                
                <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-2">
                  {option.title}
                </h3>
                
                <div className="mb-3">
                  <span className="text-3xl font-playfair font-bold text-charcoal-800">
                    {option.price}
                  </span>
                  {option.originalPrice && (
                    <span className="text-lg text-charcoal-500 line-through ml-2 font-lato">
                      {option.originalPrice}
                    </span>
                  )}
                </div>
                
                <p className="text-charcoal-600 font-lato text-sm mb-4">
                  {option.description}
                </p>
                
                <ul className="space-y-1 mb-6">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="text-charcoal-600 text-sm font-lato flex items-start">
                      <span className="mr-2 mt-0.5 text-softgreen-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button variant="primary" className="w-full font-lato">
                  <Link href="/contact">
                    Choose This Plan
                  </Link>
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-charcoal-600 font-lato text-sm">
              All prices include VAT. First class for new students: £15
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-6">
            Ready to Start Your London Yoga Journey?
          </h2>
          
          <p className="text-lg text-charcoal-600 font-lato mb-8 max-w-2xl mx-auto">
            Whether you&apos;re a complete beginner or experienced practitioner, 
            our London community welcomes you. Book your first class and discover 
            your urban sanctuary.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="primary" className="font-lato">
              <Link href="/contact">
                Book Your First Class
              </Link>
            </Button>
            <Button size="xl" variant="secondary" className="font-lato">
              <Link href="/classes">
                Explore All Locations
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
