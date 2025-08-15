import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Hero, HeroContent, HeroTitle, HeroSubtitle, HeroDescription, HeroActions } from '@/components/ui/hero'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        variant="gradient"
        overlay="gradient"
        backgroundImage="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2520&q=80"
        minHeight="100vh"
        contentAlignment="center"
      >
        <HeroContent maxWidth="4xl">
          <div className="space-y-8">
            <div className="space-y-4">
              <HeroTitle size="xl" gradient={false}>
                Welcome to{' '}
                <span className="bg-gradient-to-r from-sage-200 to-ocean-200 bg-clip-text text-transparent">
                  Wingspan Yoga
                </span>
              </HeroTitle>
              <HeroSubtitle size="md" className="text-sage-200">
                with Anna Dorman
              </HeroSubtitle>
            </div>
            
            <HeroDescription size="lg" className="max-w-3xl mx-auto">
              Transform your practice with personalized yoga instruction that honors your body, 
              calms your mind, and opens your heart. Join Anna for classes that blend traditional 
              wisdom with modern alignment principles in a safe, inclusive environment.
            </HeroDescription>
            
            <HeroActions spacing="lg" justify="center">
              <Link href="/schedule">
                <Button size="xl" variant="primary" className="bg-sage-500 hover:bg-sage-600 text-white shadow-lg">
                  Book Your First Class
                </Button>
              </Link>
              <Link href="/about">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 backdrop-blur-sm">
                  Meet Anna
                </Button>
              </Link>
            </HeroActions>
          </div>
        </HeroContent>
      </Hero>

      {/* Featured Offerings */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-charcoal-900 text-center mb-12">
              Your Yoga Journey Starts Here
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card variant="zen">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-3xl mr-3">🧘‍♀️</span>
                    Gentle Hatha
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600 mb-4">
                    Perfect for beginners and those seeking a slower-paced practice. 
                    Build strength and flexibility with mindful attention to alignment.
                  </p>
                  <Link href="/schedule">
                    <Button variant="outline" size="sm">View Classes</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card variant="zen">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-3xl mr-3">🌊</span>
                    Alignment Vinyasa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600 mb-4">
                    Flowing sequences with detailed alignment cues. Experience the 
                    meditative quality of careful attention with mindful movement.
                  </p>
                  <Link href="/schedule">
                    <Button variant="outline" size="sm">View Classes</Button>
                  </Link>
                </CardContent>
              </Card>
              
              <Card variant="zen">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="text-3xl mr-3">🌸</span>
                    Restorative Yoga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-charcoal-600 mb-4">
                    Deeply nourishing practice with full prop support. 
                    Perfect for stress relief and nervous system healing.
                  </p>
                  <Link href="/schedule">
                    <Button variant="outline" size="sm">View Classes</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About Anna Preview */}
      <section className="py-16 bg-sage-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-64 h-64 bg-sage-200 rounded-full mx-auto md:mx-0 mb-6 flex items-center justify-center">
                  <span className="text-9xl">🧘‍♀️</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-4xl font-heading font-bold text-charcoal-900 mb-6">
                  Meet Anna Dorman
                </h2>
                <p className="text-lg text-charcoal-600 mb-6 leading-relaxed">
                  With over 15 years of experience and RYT-500 certification, Anna brings 
                  a unique blend of traditional Hatha yoga and trauma-informed teaching 
                  to create a safe, inclusive space for all practitioners.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">RYT-500 Certified</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">Trauma-Informed</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-sage-100 text-sage-700">15+ Years Experience</span>
                </div>
                <Link href="/instructor">
                  <Button variant="outline">
                    Learn About Anna&apos;s Approach
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-heading font-bold text-charcoal-900 mb-12">
              What Students Say
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card variant="organic">
                <CardContent className="p-8">
                  <blockquote className="text-lg italic text-charcoal-700 mb-4">
                    &ldquo;Anna&apos;s classes are exactly what I needed. Her trauma-informed approach 
                    helped me reconnect with my body in a way I never thought possible.&rdquo;
                  </blockquote>
                  <p className="text-sm font-medium text-sage-600">— Sarah M.</p>
                </CardContent>
              </Card>
              
              <Card variant="organic">
                <CardContent className="p-8">
                  <blockquote className="text-lg italic text-charcoal-700 mb-4">
                    &ldquo;The alignment focus has completely transformed my practice. 
                    I finally understand how to move safely and mindfully.&rdquo;
                  </blockquote>
                  <p className="text-sm font-medium text-sage-600">— Michael R.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-charcoal-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Stay Connected
            </h2>
            <p className="text-charcoal-200 mb-8">
              Receive yoga tips, class updates, and mindfulness practices delivered to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white border-charcoal-300"
              />
              <Button variant="primary">
                Subscribe
              </Button>
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
            Join Anna for a practice that honors your body, calms your mind, and opens your heart. 
            Your journey toward greater strength, flexibility, and inner peace starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/schedule">
              <Button size="xl" variant="primary" className="bg-white text-sage-600 hover:bg-charcoal-50">
                Book Your First Class
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
