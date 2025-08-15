import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function OnlineClassesPage() {
  const liveSchedule = [
    {
      day: 'Monday',
      time: '7:15 PM GMT',
      duration: '75 mins',
      style: 'Vinyasa Flow',
      level: 'All Levels',
      description: 'Start your week with flowing movement and breath connection.',
      zones: 'Perfect for UK & Europe evening practice'
    },
    {
      day: 'Tuesday',
      time: '2:45 PM GMT',
      duration: '60 mins',
      style: 'Afternoon Flow',
      level: 'Beginner to Intermediate',
      description: 'Midday energizer to refresh your body and mind.',
      zones: 'Great for UK lunch breaks, US morning practice'
    },
    {
      day: 'Thursday',
      time: '11:00 AM GMT',
      duration: '60 mins',
      style: 'Morning Energizer',
      level: 'All Levels',
      description: 'Mid-morning practice to boost energy and focus for the day ahead.',
      zones: 'Ideal for UK & Europe mornings'
    },
    {
      day: 'Friday',
      time: '6:30 PM GMT',
      duration: '75 mins',
      style: 'Week-End Flow',
      level: 'All Levels',
      description: 'Release the week\'s tension and transition into your weekend.',
      zones: 'Perfect for UK & Europe evening wind-down'
    }
  ];

  const techRequirements = [
    {
      category: 'Essential Setup',
      items: [
        'Stable internet connection (5+ Mbps recommended)',
        'Computer, tablet, or smartphone with camera',
        'Zoom app installed and updated',
        'Quiet space with room to move your arms'
      ]
    },
    {
      category: 'Equipment Needed',
      items: [
        'Yoga mat (towel works as backup)',
        'Water bottle within reach',
        'Blanket or towel for relaxation',
        'Optional: blocks, strap, or household substitutes'
      ]
    },
    {
      category: 'Space Setup',
      items: [
        '6x3 feet minimum floor space',
        'Position camera to see your full body',
        'Good lighting (natural light preferred)',
        'Remove distractions and inform housemates'
      ]
    }
  ];

  const onlineBenefits = [
    {
      title: 'Practice Anywhere',
      icon: '🌍',
      description: 'Join from home, office, hotel room, or anywhere with internet connection'
    },
    {
      title: 'Global Community',
      icon: '🤝',
      description: 'Connect with yogis from around the world in every session'
    },
    {
      title: 'Replay Access',
      icon: '📹',
      description: 'All live classes recorded for subscribers to practice anytime'
    },
    {
      title: 'Personal Attention',
      icon: '👁️',
      description: 'Small online groups ensure individual guidance and adjustments'
    },
    {
      title: 'Time Flexibility',
      icon: '⏰',
      description: 'Multiple time slots to fit different schedules and time zones'
    },
    {
      title: 'Cost Effective',
      icon: '💰',
      description: 'No travel costs or studio fees - premium instruction at home prices'
    }
  ];

  const pricingOptions = [
    {
      title: 'Drop-in Class',
      price: '£15',
      description: 'Try online yoga with no commitment',
      features: ['Single live class', 'Interactive session', '7-day replay access', 'Welcome pack PDF']
    },
    {
      title: 'Weekly Pass',
      price: '£35',
      originalPrice: '£60',
      description: 'Perfect for trying our rhythm',
      features: ['All classes for 1 week', 'Live interaction', 'Unlimited replays', 'Community WhatsApp access']
    },
    {
      title: 'Monthly Unlimited',
      price: '£65',
      originalPrice: '£240',
      description: 'Best value for regular practice',
      features: ['All live classes', 'Full replay library', 'Monthly workshops', 'Priority support']
    },
    {
      title: 'Annual Membership',
      price: '£650',
      originalPrice: '£780',
      description: 'Ultimate commitment to your practice',
      features: ['Everything included', '2 months free', 'Exclusive retreats access', 'Personal check-ins']
    }
  ];

  const onlineEtiquette = [
    'Join 5 minutes early for tech checks and settling in',
    'Mute yourself unless asking questions or need help',
    'Keep camera on so I can provide guidance and adjustments',
    'Find a quiet space and let others know you\'re in class',
    'Have water nearby but avoid eating during practice',
    'Wear comfortable, non-restrictive clothing',
    'It\'s okay to modify poses or take breaks as needed'
  ];

  const timeZoneHelp = [
    { region: 'UK & Ireland', time: 'GMT/BST (same as class times)' },
    { region: 'Central Europe', time: 'Add 1 hour (GMT+1)' },
    { region: 'Eastern Europe', time: 'Add 2 hours (GMT+2)' },
    { region: 'Dubai/Moscow', time: 'Add 3-4 hours (GMT+3/4)' },
    { region: 'India', time: 'Add 5.5 hours (GMT+5:30)' },
    { region: 'Singapore/Perth', time: 'Add 8 hours (GMT+8)' },
    { region: 'Sydney/Melbourne', time: 'Add 10-11 hours (GMT+10/11)' },
    { region: 'East Coast USA', time: 'Subtract 5 hours (GMT-5)' },
    { region: 'West Coast USA', time: 'Subtract 8 hours (GMT-8)' }
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
              Online Yoga Classes
            </HeroTitle>
            
            <HeroDescription size="lg" className="text-charcoal-700 font-lato max-w-3xl mx-auto">
              Bring the studio to your home. Live, interactive classes with personal attention, 
              global community, and the convenience of practicing anywhere.
            </HeroDescription>
            
            <HeroActions spacing="lg" justify="center">
              <Link href="#schedule">
                <Button size="xl" variant="primary" className="font-lato">
                  See Live Schedule
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="secondary" className="font-lato">
                  Join a Class
                </Button>
              </Link>
            </HeroActions>
          </div>
        </HeroContent>
      </Hero>

      {/* Why Online Yoga */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Yoga Without Boundaries
            </h2>
            <p className="text-lg text-charcoal-600 font-lato max-w-3xl mx-auto">
              Experience the full benefits of in-person instruction from wherever you are. 
              Our online classes maintain the personal connection and guidance of studio practice 
              with the flexibility of home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineBenefits.map((benefit, index) => (
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

      {/* Live Schedule */}
      <section id="schedule" className="py-16 bg-softblue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Live Class Schedule
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Interactive sessions designed for global participation - all times in GMT
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {liveSchedule.map((session, index) => (
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
                  
                  <div className="text-gray-700 font-lato text-lg font-semibold mb-1">
                    {session.time}
                  </div>
                  
                  <div className="text-gray-600 font-lato text-sm mb-3">
                    {session.duration} • {session.style}
                  </div>
                  
                  <p className="text-gray-700 font-lato text-sm mb-3">
                    {session.description}
                  </p>
                  
                  <div className="text-gray-600 font-lato text-xs flex items-center">
                    <span className="mr-1">🌍</span> {session.zones}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-charcoal-600 font-lato mb-4">
              <strong>Note:</strong> All classes are recorded for replay access. 
              Can&apos;t make it live? Practice later at your convenience.
            </p>
            <Button size="lg" variant="primary" className="font-lato">
              <Link href="/contact">
                Book Your First Online Class
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Time Zone Helper */}
      <section className="py-16 bg-softyellow-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Time Zone Converter
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Find your local time for our GMT-based schedule
            </p>
          </div>

          <Card variant="default" className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timeZoneHelp.map((zone, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-softblue-50 rounded-lg">
                  <span className="font-semibold text-charcoal-800 font-lato text-sm">
                    {zone.region}
                  </span>
                  <span className="text-charcoal-600 font-lato text-sm">
                    {zone.time}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <p className="text-charcoal-600 font-lato text-sm">
                Need help calculating your time? Email me with your location and I&apos;ll send you a personalized schedule.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Tech Requirements */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Getting Set Up
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Everything you need for a smooth online practice experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {techRequirements.map((category, index) => (
              <Card key={index} variant="default" className="p-6">
                <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-4">
                  {category.category}
                </h3>
                <ul className="space-y-3">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="text-charcoal-600 font-lato text-sm flex items-start">
                      <span className="mr-2 mt-0.5 text-softgreen-600">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-charcoal-600 font-lato mb-4">
              Don&apos;t have all the equipment? No problem! I&apos;ll show you household alternatives during class.
            </p>
          </div>
        </div>
      </section>

      {/* Online Etiquette */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Online Class Etiquette
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Simple guidelines to help everyone have the best experience
            </p>
          </div>

          <Card variant="default" className="p-8">
            <div className="space-y-4">
              {onlineEtiquette.map((rule, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-charcoal-700 font-lato flex-1">
                    {rule}
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
              Online Class Pricing
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Affordable options to fit your practice goals and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingOptions.map((option, index) => (
              <Card key={index} variant="default" className="p-6 relative">
                {option.originalPrice && (
                  <div className="absolute top-4 right-4 bg-softpink-300 text-charcoal-800 px-2 py-1 rounded-full text-xs font-lato font-semibold">
                    Best Value
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
                    <div className="text-sm text-charcoal-500 line-through font-lato">
                      was {option.originalPrice}
                    </div>
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
                    Start Here
                  </Link>
                </Button>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-charcoal-600 font-lato text-sm mb-4">
              All prices in GBP. Automatic currency conversion available at checkout.
            </p>
            <p className="text-charcoal-600 font-lato text-sm">
              <strong>First-time online students:</strong> Try your first class for just £10!
            </p>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 bg-softyellow-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-6">
            Ready to Practice Online?
          </h2>
          
          <p className="text-lg text-charcoal-600 font-lato mb-8 max-w-2xl mx-auto">
            Join our global community of online yogis. Whether you&apos;re a complete beginner 
            or experienced practitioner, you&apos;ll find your perfect practice online.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="xl" variant="primary" className="font-lato">
              <Link href="/contact">
                Book Your First Online Class
              </Link>
            </Button>
            <Button size="xl" variant="secondary" className="font-lato">
              <Link href="/classes">
                Compare All Options
              </Link>
            </Button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-lg font-playfair font-semibold text-charcoal-800 mb-3">
              Not sure if online yoga is for you?
            </h3>
            <p className="text-charcoal-600 font-lato text-sm">
              Book a free 15-minute consultation to discuss your goals, 
              test your tech setup, and get personalized recommendations.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
