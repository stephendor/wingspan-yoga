import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function NorthWalesClassesPage() {
  const weeklySchedule = [
    {
      day: 'Thursday',
      time: 'Evening Class',
      style: 'Gentle Yoga',
      level: 'All Levels',
      location: 'North Wales Venue',
      description: 'Gentle practice focusing on mindful movement and breath awareness. Perfect for unwinding after the week.',
      pricing: '£10 per class - your fifth class is always free! Or pay for 5 classes in advance for £40'
    }
  ];

  const locations = [
    {
      name: 'Betws-y-Coed Community Centre',
      address: 'Royal Oak Stables, Betws-y-Coed, LL24 0AY',
      description: 'Warm, welcoming community space in the heart of Snowdonia National Park.',
      amenities: ['Free parking', 'Changing facilities', 'All equipment provided', 'Accessible entrance'],
      directions: 'Just off the A5, 5 minutes walk from Betws-y-Coed train station.'
    },
    {
      name: 'Outdoor Locations',
      address: 'Various scenic spots around Betws-y-Coed',
      description: 'Weather-dependent outdoor sessions in stunning natural settings.',
      amenities: ['Mats provided', 'Blankets available', 'Spectacular views', 'Fresh mountain air'],
      directions: 'Exact location shared via WhatsApp group 24 hours before class.'
    }
  ];

  const pricingOptions = [
    {
      title: 'Drop-in Class',
      price: '£18',
      description: 'Perfect for trying out classes or irregular attendance',
      features: ['Single class entry', 'No commitment', 'Book anytime', 'Full refund if cancelled 12hrs ahead']
    },
    {
      title: '4-Class Package',
      price: '£65',
      originalPrice: '£72',
      description: 'Great value for regular practice',
      features: ['Use within 6 weeks', '£7 saving vs drop-in', 'Transferable to friends/family', 'Pause for holidays']
    },
    {
      title: '8-Class Package',
      price: '£120',
      originalPrice: '£144',
      description: 'Best value for committed practitioners',
      features: ['Use within 10 weeks', '£24 saving vs drop-in', 'Includes workshop discounts', 'Priority booking']
    },
    {
      title: 'Monthly Unlimited',
      price: '£85',
      description: 'Unlimited classes for dedicated students',
      features: ['All North Wales classes', 'Guest pass included', 'Workshop discounts', 'Community events access']
    }
  ];

  const whatToBring = [
    { item: 'Yoga Mat', note: 'Please bring your own yoga mat for all classes' },
    { item: 'Blanket', note: 'Bring a blanket if possible for relaxation poses' },
    { item: 'Yoga Strap/Belt', note: 'If you have your own, please bring it' },
    { item: 'Comfortable Clothing', note: 'Wear clothing you can move in easily' },
    { item: 'Layers for Warmth', note: 'North Wales weather can change quickly' }
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
              North Wales Yoga Classes
            </HeroTitle>
            
            <HeroDescription size="lg" className="text-charcoal-700 font-lato max-w-3xl mx-auto">
              Practice yoga surrounded by the breathtaking beauty of Snowdonia National Park. 
              Small, intimate classes where mountain energy meets mindful movement.
            </HeroDescription>
            
            <HeroActions spacing="lg" justify="center">
              <Link href="#schedule">
                <Button size="xl" variant="primary" className="font-lato">
                  View Schedule
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="xl" variant="secondary" className="font-lato">
                  Book Your Spot
                </Button>
              </Link>
            </HeroActions>
          </div>
        </HeroContent>
      </Hero>

      {/* Why North Wales */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Yoga in the Heart of Snowdonia
            </h2>
            <p className="text-lg text-charcoal-600 font-lato max-w-3xl mx-auto">
              There&apos;s something magical about practicing yoga surrounded by ancient mountains, 
              flowing rivers, and the pure air of North Wales. Our classes combine the groundedness 
              of the landscape with the elevation of spirit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">🏔️</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Mountain Energy
              </h3>
              <p className="text-charcoal-600 font-lato">
                Practice with the stability and strength of ancient mountains as your foundation.
              </p>
            </Card>

            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">🌲</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Forest Tranquility
              </h3>
              <p className="text-charcoal-600 font-lato">
                Breathe the cleanest air and connect with the natural rhythms of the Welsh woodlands.
              </p>
            </Card>

            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">🏘️</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Community Spirit
              </h3>
              <p className="text-charcoal-600 font-lato">
                Join a warm, welcoming community of locals and visitors united by love of practice.
              </p>
            </Card>
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
              Regular classes throughout the week to fit your rhythm
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {weeklySchedule.map((session, index) => (
              <Card key={index} variant="organic" className="p-0 overflow-hidden">
                <div className="p-6 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-playfair font-semibold text-gray-900">
                      {session.day}
                    </h3>
                    <span className="text-gray-600 font-lato text-sm">
                      {session.level}
                    </span>
                  </div>
                  
                  <div className="text-gray-700 font-lato text-lg font-semibold mb-2">
                    {session.time}
                  </div>
                  
                  <div className="text-gray-900 font-lato font-semibold mb-2">
                    {session.style}
                  </div>
                  
                  <div className="text-gray-600 font-lato text-sm mb-3">
                    📍 {session.location}
                  </div>
                  
                  <p className="text-gray-700 font-lato text-sm mb-3">
                    {session.description}
                  </p>

                  <div className="bg-gray-100 rounded-lg p-3 mb-3">
                    <p className="text-gray-900 font-lato text-sm font-semibold">
                      💰 {session.pricing}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-playfair font-semibold text-charcoal-800 mb-3">
                How to Book
              </h3>
              <p className="text-charcoal-600 font-lato mb-4">
                You can pay in cash on the day, but please drop me a line to let me know 
                you are coming for the first time.
              </p>
              <Button size="lg" variant="primary" className="font-lato">
                <Link href="/contact">
                  Contact Anna to Book
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Class Locations
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Beautiful spaces that enhance your practice
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <Card key={index} variant="default" className="p-6">
                <h3 className="text-2xl font-playfair font-semibold text-charcoal-800 mb-2">
                  {location.name}
                </h3>
                <p className="text-charcoal-600 font-lato text-sm mb-3">
                  📍 {location.address}
                </p>
                <p className="text-charcoal-600 font-lato mb-4">
                  {location.description}
                </p>
                
                <div className="mb-4">
                  <h4 className="font-semibold text-charcoal-800 font-lato mb-2">Amenities:</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.amenities.map((amenity, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 bg-softblue-100 text-charcoal-700 rounded-full text-xs font-lato"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-charcoal-600 font-lato text-sm">
                  <strong>Directions:</strong> {location.directions}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Flexible Pricing Options
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Choose what works best for your schedule and budget
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
                    Select This Option
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What to Bring */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              What to Bring
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Everything you need for a comfortable practice
            </p>
          </div>

          <Card variant="default" className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {whatToBring.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-softpink-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-charcoal-800 font-lato">
                      {item.item}
                    </h4>
                    <p className="text-charcoal-600 text-sm font-lato">
                      {item.note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="text-center mt-8">
            <p className="text-charcoal-600 font-lato mb-6">
              New to yoga? Don&apos;t worry about having everything perfect. 
              Just bring yourself and I&apos;ll help with the rest.
            </p>
            <Button size="lg" variant="primary" className="font-lato">
              <Link href="/contact">
                Ask a Question
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
