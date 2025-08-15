'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  source?: string;
  className?: string;
  compact?: boolean;
}

export function NewsletterSignup({ 
  title = "Stay Connected",
  description = "Get the latest blog posts and yoga insights delivered to your inbox.",
  source = "blog",
  className = "",
  compact = false
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          source,
          preferences: {
            frequency: 'weekly',
            topics: ['yoga', 'wellness', 'meditation']
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to subscribe to newsletter');
        return;
      }

      setIsSubscribed(true);
      setEmail('');
      setName('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <Card className={`${className} border-green-200 bg-green-50`}>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Welcome to our newsletter!
            </h3>
            <p className="text-green-700">
              Check your email for a confirmation message.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div className={`${className} p-4 bg-gray-50 rounded-lg border`}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-2">{title}</h4>
            <p className="text-xs text-gray-600 mb-3">{description}</p>
          </div>
          {error && (
            <div className="text-red-600 text-xs">{error}</div>
          )}
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 text-sm"
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              disabled={isSubmitting || !email.trim()}
              size="sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                'Subscribe'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="newsletter-name" className="text-sm font-medium">
              Name (optional)
            </label>
            <Input
              id="newsletter-name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="newsletter-email" className="text-sm font-medium">
              Email address *
            </label>
            <Input
              id="newsletter-email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe to Newsletter'
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center">
            You can unsubscribe at any time. We respect your privacy.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
