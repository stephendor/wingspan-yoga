'use client'

import React, { useState } from 'react'
import { 
  Button, 
  Input, 
  TextArea, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  ModalClose,
  Navigation
} from '@/components/ui'
import { Heart, Calendar, Users } from 'lucide-react'
import { handleLogout } from '@/lib/auth/logout'

export default function ComponentShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [textareaValue, setTextareaValue] = useState('')
  const [showError, setShowError] = useState(false)

  const navItems = [
    { label: 'Classes', href: '/classes', icon: <Calendar className="h-4 w-4" /> },
    { label: 'About', href: '/about', icon: <Users className="h-4 w-4" /> },
    { label: 'Contact', href: '/contact', icon: <Heart className="h-4 w-4" /> },
  ]

  const user = {
    name: 'Jane Doe',
    email: 'jane@example.com'
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <Navigation
        items={navItems}
        user={user}
        onLogout={() => handleLogout({ callbackUrl: '/' })}
      />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-heading font-bold text-charcoal-900">
            Wingspan Yoga Design System
          </h1>
          <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
            A showcase of our natural, organic-inspired component library with sage green, ocean blue, and terracotta accents.
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>
              Various button styles with natural colors and subtle animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-charcoal-700">Primary</h4>
                <div className="space-y-2">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-charcoal-700">Secondary</h4>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm">Small</Button>
                  <Button variant="secondary" size="md">Medium</Button>
                  <Button variant="secondary" size="lg">Large</Button>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-charcoal-700">Outline</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Small</Button>
                  <Button variant="outline" size="md">Medium</Button>
                  <Button variant="outline" size="lg">Large</Button>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-charcoal-700">Terracotta</h4>
                <div className="space-y-2">
                  <Button variant="terracotta" size="sm">Small</Button>
                  <Button variant="terracotta" size="md">Medium</Button>
                  <Button variant="terracotta" size="lg">Large</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Components */}
        <Card>
          <CardHeader>
            <CardTitle>Form Components</CardTitle>
            <CardDescription>
              Input fields with validation states and animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Enter your email"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  helpText="We'll never share your email address"
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  errorMessage={showError ? "Password must be at least 8 characters" : undefined}
                />
                <Button
                  variant="outline"
                  onClick={() => setShowError(!showError)}
                >
                  Toggle Error State
                </Button>
              </div>
              <div className="space-y-4">
                <TextArea
                  label="Message"
                  placeholder="Tell us about your yoga journey..."
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  helpText="Share your thoughts, questions, or feedback"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Basic card with soft shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-600">
                This is a default card with standard styling and gentle shadows.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with natural shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-600">
                This card has more pronounced shadows for hierarchy.
              </p>
            </CardContent>
          </Card>

          <Card variant="organic">
            <CardHeader>
              <CardTitle>Organic Card</CardTitle>
              <CardDescription>Card with organic shadow styling</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-charcoal-600">
                This card uses organic shadow patterns for a natural feel.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">Learn More</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Modal Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Modal Component</CardTitle>
            <CardDescription>
              Accessible modal with focus management and animations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </CardContent>
        </Card>

        <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ModalHeader>
            <ModalTitle>Welcome to Wingspan Yoga</ModalTitle>
            <ModalClose onClose={() => setIsModalOpen(false)} />
          </ModalHeader>
          <ModalContent>
            <p className="text-charcoal-600 mb-4">
              This is a demo modal showcasing our design system. The modal includes
              focus trapping, escape key handling, and smooth animations.
            </p>
            <div className="space-y-3">
              <Input
                label="Name"
                placeholder="Enter your name"
              />
              <TextArea
                label="Comment"
                placeholder="Share your thoughts..."
                rows={3}
              />
            </div>
          </ModalContent>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Submit
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  )
}
