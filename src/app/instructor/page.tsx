import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function InstructorPage() {
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
                  Anna Dorman
                </h1>
                <p className="text-2xl text-sage-600 mb-6 font-medium">
                  Founder & Lead Instructor
                </p>
                <p className="text-lg text-charcoal-600 mb-8 leading-relaxed">
                  With over 15 years of experience, Anna combines traditional Hatha yoga with 
                  modern alignment principles, creating a safe and inclusive space for practitioners 
                  of all levels to explore their yoga journey.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">RYT-500</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">Trauma-Informed Certified</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">Anatomy Specialist</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bio Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-heading font-bold text-charcoal-900 mb-6">My Story</h2>
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

      {/* Teaching Approach */}
      <section className="py-16 bg-sage-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-charcoal-900 mb-8 text-center">Teaching Approach</h2>
            
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
                    Growth-Oriented
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600">
                    Whether you&apos;re a complete beginner or advanced practitioner, I meet you where you are 
                    and provide opportunities for growth that feel challenging yet achievable.
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

      {/* Classes I Teach */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-heading font-bold text-charcoal-900 mb-8 text-center">Classes I Teach</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-sage-500 pl-6">
                <h3 className="text-xl font-semibold text-charcoal-900 mb-2">Gentle Hatha Yoga</h3>
                <p className="text-charcoal-600">
                  Perfect for beginners and those seeking a slower-paced practice. We hold poses 
                  longer to build strength and flexibility while focusing on proper alignment.
                </p>
              </div>
              
              <div className="border-l-4 border-sage-500 pl-6">
                <h3 className="text-xl font-semibold text-charcoal-900 mb-2">Alignment-Based Vinyasa</h3>
                <p className="text-charcoal-600">
                  Flowing sequences with detailed alignment cues. These classes combine the 
                  meditative quality of careful attention with the joy of mindful movement.
                </p>
              </div>
              
              <div className="border-l-4 border-sage-500 pl-6">
                <h3 className="text-xl font-semibold text-charcoal-900 mb-2">Restorative Yoga</h3>
                <p className="text-charcoal-600">
                  Deeply nourishing classes where poses are held for longer periods with full prop 
                  support. Perfect for stress relief and nervous system healing.
                </p>
              </div>
              
              <div className="border-l-4 border-sage-500 pl-6">
                <h3 className="text-xl font-semibold text-charcoal-900 mb-2">Yoga for Healing</h3>
                <p className="text-charcoal-600">
                  Specialized classes designed for those recovering from injury or trauma. 
                  Emphasis on choice, gentleness, and reconnecting with the body in a safe way.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Touch */}
      <section className="py-16 bg-sage-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold text-charcoal-900 mb-6">Beyond the Mat</h2>
            <p className="text-lg text-charcoal-600 mb-8">
              When I&apos;m not teaching or practicing yoga, you can find me hiking in the mountains, 
              reading philosophy, or spending time with my rescue dog, Buddha. I believe that 
              yoga is not just what we do on the mat, but how we show up in the world with 
              kindness, presence, and authenticity.
            </p>
            <blockquote className="text-xl italic text-charcoal-700 border-l-4 border-sage-500 pl-6 mb-8">
              &ldquo;Yoga is not about touching your toes. It is about what you learn on the way down.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-sage-500 to-ocean-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-heading font-bold mb-4">
            Practice With Anna
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join me on the mat for a practice that honors your body, calms your mind, 
            and opens your heart. I&apos;d love to support you on your yoga journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schedule">
              <Button size="xl" variant="primary" className="bg-white text-sage-600 hover:bg-charcoal-50">
                View My Classes
              </Button>
            </Link>
            <Link href="/about">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn More About Me
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}