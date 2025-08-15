import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generalAPIRateLimit, applyRateLimit } from '@/lib/ratelimit';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.string().optional(),
  preferences: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    topics: z.array(z.string()).optional(),
  }).optional(),
});

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, generalAPIRateLimit);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.error || 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, name, source, preferences } = subscribeSchema.parse(body);

    // Check if email already exists
    const existingSubscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return NextResponse.json(
          { error: 'Email is already subscribed to the newsletter' },
          { status: 400 }
        );
      } else {
        // Reactivate if previously unsubscribed
        const updatedSubscription = await prisma.newsletterSubscription.update({
          where: { email },
          data: {
            isActive: true,
            unsubscribedAt: null,
            name: name || existingSubscription.name,
            source: source || existingSubscription.source,
            preferences: preferences || (existingSubscription.preferences as Record<string, unknown>),
          },
        });

        return NextResponse.json({
          message: 'Successfully resubscribed to newsletter',
          subscription: {
            id: updatedSubscription.id,
            email: updatedSubscription.email,
            name: updatedSubscription.name,
          },
        });
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletterSubscription.create({
      data: {
        email,
        name,
        source: source || 'blog',
        preferences,
      },
    });

    return NextResponse.json({
      message: 'Successfully subscribed to newsletter',
      subscription: {
        id: subscription.id,
        email: subscription.email,
        name: subscription.name,
      },
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = unsubscribeSchema.parse(body);

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Email not found in newsletter subscriptions' },
        { status: 404 }
      );
    }

    if (!subscription.isActive) {
      return NextResponse.json(
        { error: 'Email is already unsubscribed' },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscription.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Successfully unsubscribed from newsletter',
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
