import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-warm-50 to-blush-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-48 h-48 bg-sage-200 rounded-full mx-auto md:mx-0 mb-6 flex items-center justify-center">
                  <span className="text-8xl">🧘‍♀️</span>
                </div>
              </div>
              
              <div>
                <h1 className="text-5xl font-heading font-bold text-charcoal-900 mb-4">
                  Meet{' '}
                  <span className="bg-gradient-to-r from-sage-600 to-ocean-600 bg-clip-text text-transparent">
                    Anna Dorman
                  </span>
                </h1>
                <p className="text-2xl text-sage-600 mb-6 font-medium">
                  Founder & Lead Instructor
                </p>
                <p className="text-lg text-charcoal-600 mb-8 leading-relaxed">
                  Welcome to Wingspan Yoga! I&apos;m Anna, and I&apos;m passionate about creating a space where 
                  yoga becomes accessible, healing, and transformative for everyone who steps onto the mat.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">RYT-500</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">Trauma-Informed Certified</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">15+ Years Experience</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* My Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-heading font-bold text-charcoal-900 mb-6">My Journey</h2>
              <p className="text-charcoal-600 mb-6">
                My yoga journey began fifteen years ago during a particularly stressful period in my corporate career. 
                What started as a way to manage stress quickly became a transformative practice that reshaped my 
                entire understanding of what it means to be present in my body and connected to my breath.
              </p>
              
              <p className="text-charcoal-600 mb-6">
                After years of personal practice, I felt called to share the profound benefits of yoga with others. 
                I completed my first 200-hour teacher training in 2014, followed by my 500-hour certification, 
                and have since specialized in trauma-informed teaching and anatomical alignment.
              </p>
              
              <p className="text-charcoal-600 mb-8">
                In 2019, I founded Wingspan Yoga with a vision of creating a studio that truly embodies the 
                inclusive, healing nature of yoga. The name reflects my belief that yoga gives us the space 
                to spread our wings—to expand our capacity for strength, flexibility, and compassion.
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* Teaching Approach Section */}
      <section className="py-16 bg-sage-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-charcoal-900 mb-8 text-center">My Teaching Philosophy</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card variant="zen">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">🎯</span>
                    Alignment-Focused
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600">
                    I believe that proper alignment is the foundation of a safe and sustainable practice. 
                    My classes emphasize anatomical awareness and intelligent movement patterns that 
                    honor your body&apos;s unique structure.
                  </p>
                </CardContent>
              </Card>
              
              <Card variant="zen">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">💚</span>
                    Trauma-Informed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600">
                    Creating a safe container for practice is paramount. I offer choices, modifications, 
                    and invitations rather than commands, ensuring every student feels empowered to 
                    honor their body&apos;s needs.
                  </p>
                </CardContent>
              </Card>
              
              <Card variant="zen">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">🌱</span>
                    Inclusive & Accessible
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600">
                    Every body is a yoga body. I believe yoga should be accessible to all, regardless 
                    of age, ability, or experience level. My classes offer modifications for every pose.
                  </p>
                </CardContent>
              </Card>
              
              <Card variant="zen">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-2xl mr-3">🧠</span>
                    Mind-Body Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600">
                    My classes integrate breathwork, mindfulness, and movement to help you develop 
                    a deeper relationship with your inner wisdom and intuitive body intelligence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Our Space Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-charcoal-900 mb-6">
              Our Beautiful Space
            </h2>
            <p className="text-lg text-charcoal-600 mb-12">
              Step into our serene studio, designed to inspire and support your practice
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-sage-50 rounded-natural p-8">
                <h3 className="text-xl font-semibold text-charcoal-900 mb-4">Physical Studio</h3>
                <p className="text-charcoal-600">
                  Our light-filled studio features natural materials, plants, and calming colors 
                  that create a peaceful environment for your practice. Premium props and equipment 
                  are provided for all students.
                </p>
              </div>
              
              <div className="bg-ocean-50 rounded-natural p-8">
                <h3 className="text-xl font-semibold text-charcoal-900 mb-4">Virtual Experience</h3>
                <p className="text-charcoal-600">
                  Join us from anywhere with our high-quality live streaming setup and extensive 
                  on-demand video library. Experience the same quality instruction and community 
                  connection from the comfort of your home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-sage-500 to-ocean-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Ready to Spread Your Wings?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join our community and discover the transformative power of yoga. 
            Your journey toward greater strength, flexibility, and inner peace starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schedule">
              <Button size="xl" variant="primary" className="bg-white text-sage-600 hover:bg-charcoal-50">
                Book a Class with Anna
              </Button>
            </Link>
            <Link href="/membership">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                Explore Memberships
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}