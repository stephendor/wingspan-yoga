'use client'

import { useState } from 'react'
import { Hero, HeroContent, HeroTitle, HeroDescription } from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // TODO: Implement contact form submission
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactMethods = [
    {
      title: 'Email',
      value: 'hello@wingspanyoga.com',
      icon: '✉️',
      description: 'Send me a message anytime'
    },
    {
      title: 'Phone',
      value: '+44 (0) 123 456 7890',
      icon: '📞',
      description: 'Call for immediate assistance'
    },
    {
      title: 'WhatsApp',
      value: '+44 (0) 123 456 7890',
      icon: '💬',
      description: 'Quick questions & booking'
    }
  ]

  const faqs = [
    {
      question: 'Do I need to bring my own yoga mat?',
      answer: 'For in-person classes, mats and props are provided. However, you&apos;re welcome to bring your own if you prefer. For online classes, you&apos;ll need your own mat and any props you&apos;d like to use.'
    },
    {
      question: 'What should I wear to class?',
      answer: 'Comfortable, stretchy clothing that allows you to move freely. Avoid anything too loose that might get in the way during poses. Yoga is practiced barefoot, so no special footwear is needed.'
    },
    {
      question: 'I&apos;m a complete beginner. Can I join any class?',
      answer: 'Absolutely! All classes offer modifications for different levels. I always encourage students to listen to their bodies and work at their own pace. Feel free to arrive a few minutes early to introduce yourself and discuss any concerns.'
    },
    {
      question: 'Do you offer refunds or class credits?',
      answer: 'Yes, I understand that life happens. Classes can be cancelled up to 12 hours in advance for a full refund or credit. For membership holders, missed classes can typically be made up within the same month.'
    },
    {
      question: 'Can I practice if I have injuries or physical limitations?',
      answer: 'Yoga can be adapted for almost any body and condition. Please inform me of any injuries or limitations before class so I can offer appropriate modifications. For serious conditions, I may recommend consulting with your healthcare provider first.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero
        variant="gradient"
        overlay="light"
        className="bg-gradient-to-b from-softyellow-300 to-softblue-300 min-h-[60vh]"
        minHeight="60vh"
        contentAlignment="center"
      >
        <HeroContent maxWidth="4xl">
          <div className="space-y-6 text-center">
            <HeroTitle size="xl" className="font-playfair font-bold text-charcoal-800">
              Get In Touch
            </HeroTitle>
            
            <HeroDescription size="lg" className="text-charcoal-700 font-lato max-w-3xl mx-auto">
              Have questions about classes, need guidance on your practice, or want to discuss private sessions? 
              I&apos;d love to hear from you.
            </HeroDescription>
          </div>
        </HeroContent>
      </Hero>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-playfair font-bold text-charcoal-800 mb-4">
              Ways to Reach Me
            </h2>
            <p className="text-lg text-charcoal-600 font-lato">
              Choose the method that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card key={index} variant="default" className="p-6 text-center">
                <div className="text-4xl mb-4">{method.icon}</div>
                <h3 className="text-xl font-playfair font-semibold text-charcoal-800 mb-2">
                  {method.title}
                </h3>
                <p className="text-lg font-lato text-charcoal-700 mb-2 font-semibold">
                  {method.value}
                </p>
                <p className="text-sm text-charcoal-600 font-lato">
                  {method.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-playfair font-bold text-charcoal-800 mb-6">
                Send a Message
              </h3>
              
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-softgreen-100 border border-softgreen-300 rounded-natural">
                  <p className="text-softgreen-800 font-lato">
                    Thank you for your message! I&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-natural">
                  <p className="text-red-800 font-lato">
                    Sorry, there was an error sending your message. Please try again or contact me directly.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-charcoal-700 font-lato mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-natural focus:ring-2 focus:ring-softblue-500 focus:border-softblue-500 font-lato"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-charcoal-700 font-lato mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-natural focus:ring-2 focus:ring-softblue-500 focus:border-softblue-500 font-lato"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-charcoal-700 font-lato mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-natural focus:ring-2 focus:ring-softblue-500 focus:border-softblue-500 font-lato"
                  >
                    <option value="">Select a topic...</option>
                    <option value="class-inquiry">Class Inquiry</option>
                    <option value="private-session">Private Session</option>
                    <option value="retreat-question">Retreat Question</option>
                    <option value="membership">Membership</option>
                    <option value="general">General Question</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-charcoal-700 font-lato mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-charcoal-300 rounded-natural focus:ring-2 focus:ring-softblue-500 focus:border-softblue-500 font-lato resize-vertical"
                    placeholder="Tell me how I can help you..."
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  variant="primary" 
                  className="w-full font-lato"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>

            {/* FAQ Section */}
            <div>
              <h3 className="text-2xl font-playfair font-bold text-charcoal-800 mb-6">
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card key={index} variant="default" className="p-6">
                    <h4 className="text-lg font-playfair font-semibold text-charcoal-800 mb-3">
                      {faq.question}
                    </h4>
                    <p className="text-charcoal-600 font-lato">
                      {faq.answer}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16 bg-softblue-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-playfair font-bold text-charcoal-800 mb-6">
            Ready to Start Your Practice?
          </h2>
          <p className="text-lg text-charcoal-600 font-lato mb-8">
            Don&apos;t wait - your yoga journey can begin today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="primary" className="font-lato">
              <Link href="/classes">
                Browse Classes
              </Link>
            </Button>
            <Button size="lg" variant="secondary" className="font-lato">
              <Link href="/membership">
                View Membership Options
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
