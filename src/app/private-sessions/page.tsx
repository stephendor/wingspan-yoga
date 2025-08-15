import { Hero, HeroContent, HeroTitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function PrivateSessionsPage() {
  const sessionTypes = [
    {
      title: 'Individual Sessions',
      duration: '60-90 minutes',
      price: 'From £40',
      description: 'One-on-one sessions completely tailored to your unique needs, goals, and body.',
      benefits: [
        'Personalized sequence design',
        'Detailed alignment instruction',
        'Injury-specific modifications',
        'Breathing & meditation guidance',
        'Take-home practice recommendations'
      ]
    },
    {
      title: 'Couples Sessions',
      duration: '75-90 minutes',
      price: 'From £60',
      description: 'Share your practice with a partner, friend, or family member in a supportive environment.',
      benefits: [
        'Partner yoga poses',
        'Shared relaxation experience',
        'Communication through movement',
        'Relationship building',
        'Cost-effective for two people'
      ]
    },
    {
      title: 'Small Group Sessions',
      duration: '60-75 minutes',
      price: 'From £25 per person',
      description: 'Gather 3-5 friends, family members, or colleagues for a personalized group experience.',
      benefits: [
        'Group dynamic energy',
        'Customized for group needs',
        'Team building opportunities',
        'Special occasion celebrations',
        'More affordable per person'
      ]
    }
  ];

  const specialties = [
    {
      title: 'Trauma-Informed Yoga',
      description: 'Specialized sessions focusing on safety, choice, and empowerment for those healing from trauma.',
      icon: '🤗'
    },
    {
      title: 'Prenatal & Postnatal',
      description: 'Safe, nurturing practice adapted for pregnancy and the postpartum journey.',
      icon: '🤱'
    },
    {
      title: 'Injury Recovery',
      description: 'Therapeutic sessions designed to support healing and prevent re-injury.',
      icon: '🩹'
    },
    {
      title: 'Stress & Anxiety Relief',
      description: 'Calming practices combining gentle movement, breathwork, and meditation.',
      icon: '🧘‍♀️'
    },
    {
      title: 'Beginner Foundations',
      description: 'Build confidence with step-by-step instruction in fundamental poses and principles.',
      icon: '🌱'
    },
    {
      title: 'Advanced Practice',
      description: 'Deepen your practice with challenging poses, advanced breathing, and philosophy.',
      icon: '🔥'
    }
  ];

  const locations = [
    {
      name: 'Your Home',
      description: 'I come to you with all necessary equipment for the ultimate convenience.',
      icon: '🏠'
    },
    {
      name: 'My Studio',
      description: 'Beautiful, peaceful space in North Wales with all amenities.',
      icon: '🧘'
    },
    {
      name: 'Online',
      description: 'Live, interactive sessions via video call with personalized attention.',
      icon: '💻'
    },
    {
      name: 'Outdoor Locations',
      description: 'Beach, forest, or garden sessions when weather permits (North Wales).',
      icon: '🌲'
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
              Private Yoga Sessions
            </HeroTitle>
            
            <HeroDescription size="lg" className="text-charcoal-700 font-lato max-w-3xl mx-auto">
              Experience yoga designed exclusively for you. Whether you&apos;re healing from injury, 
              new to practice, or seeking to deepen your journey - private sessions offer the personalized 
              attention and customization that group classes simply cannot provide.
            </HeroDescription>
            
            <HeroActions spacing="lg" justify="center">
              <Link href="/contact">
                <Button size="xl" variant="primary" className="font-lato">
                  Book Consultation
                </Button>
              </Link>
              <Link href="#session-types">
                <Button size="xl" variant="secondary" className="font-lato">
                  Explore Options
                </Button>
              </Link>
            </HeroActions>
          </div>
        </HeroContent>
      </Hero>

      {/* Why Choose Private Sessions */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Why Choose Private Sessions?
            </h2>
            <p className="text-lg text-charcoal-600 font-lato max-w-3xl mx-auto">
              Sometimes you need more than what a group class can offer. Private sessions provide 
              the space, attention, and customization to truly transform your practice.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Completely Personalized
              </h3>
              <p className="text-charcoal-600 font-lato">
                Every moment is designed around your specific needs, goals, and physical condition.
              </p>
            </Card>

            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Your Schedule
              </h3>
              <p className="text-charcoal-600 font-lato">
                Sessions at times that work for you, including evenings, weekends, and holidays.
              </p>
            </Card>

            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Safe Environment
              </h3>
              <p className="text-charcoal-600 font-lato">
                Practice without comparison or judgment, at your own pace and comfort level.
              </p>
            </Card>

            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Learn Faster
              </h3>
              <p className="text-charcoal-600 font-lato">
                Detailed instruction and immediate feedback accelerate your understanding and progress.
              </p>
            </Card>

            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">🩺</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Therapeutic Focus
              </h3>
              <p className="text-charcoal-600 font-lato">
                Address specific injuries, conditions, or limitations with appropriate modifications.
              </p>
            </Card>

            <Card variant="default" className="p-6 text-center">
              <div className="text-4xl mb-4">🏡</div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Convenient Location
              </h3>
              <p className="text-charcoal-600 font-lato">
                Practice in your home, my studio, online, or even outdoors in beautiful North Wales.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Session Types */}
      <section id="session-types" className="py-16 bg-softblue-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Session Options
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Choose the format that best suits your needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {sessionTypes.map((session, index) => (
              <Card key={index} variant="organic" className="p-0 overflow-hidden">
                <div className="p-8 bg-gradient-to-b from-softyellow-300 to-softblue-300">
                  <h3 className="text-2xl font-playfair font-semibold text-white mb-2">
                    {session.title}
                  </h3>
                  
                  <div className="flex justify-between items-center text-white/90 text-sm font-lato mb-4">
                    <span>⏱️ {session.duration}</span>
                    <span className="text-lg font-semibold">💰 {session.price}</span>
                  </div>

                  <p className="text-white/90 font-lato mb-6">
                    {session.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <h4 className="text-white font-semibold font-lato text-sm mb-2">Includes:</h4>
                    {session.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start text-white/90 text-sm font-lato">
                        <span className="mr-2 mt-0.5">✓</span>
                        {benefit}
                      </div>
                    ))}
                  </div>

                  <Button variant="primary" className="w-full font-lato">
                    <Link href="/contact">
                      Book This Session
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Areas of Specialty
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Specialized sessions for specific needs and populations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((specialty, index) => (
              <Card key={index} variant="default" className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{specialty.icon}</div>
                  <div>
                    <h3 className="text-lg font-playfair font-semibold text-charcoal-800 mb-2">
                      {specialty.title}
                    </h3>
                    <p className="text-charcoal-600 font-lato text-sm">
                      {specialty.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              Where We Can Meet
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Choose the setting that feels most comfortable for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {locations.map((location, index) => (
              <Card key={index} variant="default" className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-4xl">{location.icon}</div>
                  <div>
                    <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-2">
                      {location.name}
                    </h3>
                    <p className="text-charcoal-600 font-lato">
                      {location.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Process */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-playfair font-bold text-charcoal-800 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Simple steps to start your personalized yoga journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-b from-softyellow-300 to-softblue-300 rounded-full flex items-center justify-center text-white font-bold text-xl font-lato mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Free Consultation
              </h3>
              <p className="text-charcoal-600 font-lato">
                15-minute call to discuss your goals, experience, and any specific needs or concerns.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-b from-softyellow-300 to-softblue-300 rounded-full flex items-center justify-center text-white font-bold text-xl font-lato mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Custom Plan
              </h3>
              <p className="text-charcoal-600 font-lato">
                I design a personalized approach based on our conversation and your unique requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-b from-softyellow-300 to-softblue-300 rounded-full flex items-center justify-center text-white font-bold text-xl font-lato mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-3">
                Begin Practice
              </h3>
              <p className="text-charcoal-600 font-lato">
                Start your sessions with confidence, knowing everything is tailored specifically for you.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="xl" variant="primary" className="font-lato">
              <Link href="/contact">
                Schedule Free Consultation
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
