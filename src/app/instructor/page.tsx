import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export default function InstructorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-softyellow-50 via-white to-softblue-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="relative w-48 h-48 mx-auto md:mx-0 mb-6">
                  <Image
                    src="/uploads/anna-portrait-placeholder.jpg"
                    alt="Anna Dorman in a peaceful natural setting"
                    fill
                    className="rounded-full object-cover shadow-lg"
                  />
                </div>
              </div>
              
              <div>
                <h1 className="text-5xl font-playfair font-bold text-gray-900 mb-4">
                  Meet{' '}
                  <span className="bg-gradient-to-r from-softyellow-600 to-softblue-600 bg-clip-text text-transparent">
                    Anna Dorman
                  </span>
                </h1>
                <p className="text-2xl text-softgreen-700 mb-6 font-medium font-lato">
                  Yoga Teacher & Guide
                </p>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed font-lato">
                  Welcome to my world of yoga, where we explore the beautiful practice of connecting 
                  body, mind and spirit through movement, breath and presence.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-4 py-2 text-sm rounded-full bg-softgreen-100 text-softgreen-700 font-lato">BWY Accredited</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-softgreen-100 text-softgreen-700 font-lato">Scaravelli Inspired</span>
                  <span className="px-4 py-2 text-sm rounded-full bg-softgreen-100 text-softgreen-700 font-lato">30+ Years Practice</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Anna's Story Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-6">Hello, I&apos;m Anna!</h2>
              <div className="text-gray-600 font-lato space-y-6 text-lg leading-relaxed">
                <p>
                  I attended my first yoga class in Osmington, Dorset in 1993 and instantly fell in love with the practice of connecting body, mind and spirit through movement, breath and asana. Ever since then yoga has been a central feature in my life. In my late teens and early adulthood becoming a yoga teacher was my dream and after more than a decade of dedicated practice I found the teacher training course I had been waiting for: the Scaravelli Inspired AIYP London Teacher Training Course (BWY accredited) which gave me a solid grounding in the principles of Vanda Scaravelli&apos;s approach and also inspired me to keep on learning and to develop my own unique style of teaching. I qualified in 2011 and have been on a wonderful journey of teaching groups and individuals since then.
                </p>
                
                <p>
                  I am ever humbled by the way in which my own yoga and meditation practice helps me to navigate the changing seas and seasons of life. The holistic path of yoga has quite simply been my rock from teenage years to midlife; it has carried me with grace through challenging times. Sharing this beautiful practice with others gives me great joy and I feel incredibly lucky to be able to do what I love each day.
                </p>
                
                <p>
                  I met my husband Stephen in 2017 and together we moved to North Wales in 2020. The beautiful natural landscape here is a constant inspiration and I love both wild swimming and exploring on land, drawing inspiration from Embodied Presence practices.
                </p>
                
                <p>
                  Stephen introduced me to Zen meditation and also to the beautiful Mevlevi Order of Sufism. These are now two of the finest threads in the weave of my personal spiritual path, filling me with gratitude, wonder and awe, along with the understanding that I am always a beginner.
                </p>
                
                <p>
                  Stephen sometimes joins me leading meditation in workshops, retreats and classes, lending his wisdom and many years of experience to our sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vanda Scaravelli Teaching Influences */}
      <section className="py-16 bg-softgreen-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-8 text-center">Vanda Scaravelli</h2>
            
            <div className="prose prose-lg max-w-none font-lato">
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                I often wonder what it would have been like to meet and work with Vanda personally. Her approach informed my teacher training and my practice and teaching style to this day. What characterises this practice?
              </p>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                Vanda believed in the natural wisdom of the body and in the unraveling release that we can find through careful practice. Three practice &apos;friends&apos; - Gravity, The Spine & The Breath, make everything possible.
              </p>
              
              <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                The lower half of the body learns to root down into the ground and to become anchored and strong. The upper half of the body meanwhile becomes more fluid and free.
              </p>
              
              <div className="bg-white p-8 rounded-lg shadow-sm border-l-4 border-softpink-400">
                <blockquote className="text-xl font-lato italic text-gray-500 leading-relaxed">
                  &ldquo;The pull of gravity under our feet makes it possible for us to extend the upper part of the spine, and this extension allows us to release tension between the vertebrae. Gravity is like a magnet attracting us to the earth, but this attraction is not limited to pulling us down, it also allows us to stretch in the opposite direction towards the sky.&rdquo;
                </blockquote>
                <cite className="text-sm text-gray-400 mt-4 block">— Vanda Scaravelli, Awakening The Spine, 1991</cite>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect in a Class */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-8 text-center">What to Expect in a Class</h2>
            
            <div className="bg-softblue-50 p-8 rounded-lg mb-8">
              <blockquote className="text-xl font-lato italic text-gray-500 leading-relaxed mb-6">
                &ldquo;Take a moment where you are right now. Can you feel your feet on the ground? Can you feel the breath moving in your belly or rib cage? Can you feel the natural curves of your spine and the gentle reach of the crown of your head skywards?&rdquo;
              </blockquote>
            </div>
            
            <div className="prose prose-lg max-w-none font-lato">
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                The principles of surrendering to gravity and connecting to the breath are key in the style of yoga that I practice and teach. We work gently, softly, slowly and tend to our bodies with utmost care, compassion and respect.
              </p>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                I am most inspired by the pioneering work of female post-lineage yogis such as Vanda Scaravelli, Angela Farmer, Donna Fahri and Donna Martin (Psoma Yoga Therapy). The 2 year teacher training I undertook was led by a faculty of diverse, highly experienced practitioners: Chloe Freemantle, Anne-Marie Zulkahari, Giovanni Felicioni, Pete Blackaby (Intelligent Yoga) & Lisa Mcrory. With respect and gratitude to all of the above.
              </p>
              
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                In a class you will be encouraged to work at your own pace and to cultivate a friendly curiosity towards the body as you explore different movements and poses.
              </p>
              
              <div className="bg-softyellow-50 p-6 rounded-lg">
                <p className="text-gray-600 text-lg leading-relaxed italic">
                  As Donna Fahri says, &ldquo;The teacher&apos;s role is to be the agent for guiding the student to their own perception, thoughts, feelings, kinesthesia and insights.&rdquo; My aim is for the class to offer you a space where you feel free to be yourself and to meet yourself exactly where you are.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-softyellow-500 to-softblue-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-playfair font-bold mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto font-lato">
            Join me for classes in North Wales, London, or online. Experience the gentle, 
            mindful approach of Scaravelli-inspired yoga in a space where you can truly be yourself.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/classes">
              <Button size="xl" variant="primary" className="bg-white text-softpink-600 hover:bg-gray-50 font-lato">
                Explore Classes
              </Button>
            </Link>
            <Link href="/retreats">
              <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10 font-lato">
                View Retreats
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}