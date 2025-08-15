import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'
import { API_ROUTES } from '@/constants'
import { Retreat, ApiResponse } from '@/types'
import RetreatBookingClient from './RetreatBookingClient'

interface PageProps {
  params: {
    slug: string
  }
}

async function getRetreat(slug: string): Promise<Retreat | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${API_ROUTES.retreats.single(slug)}`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch retreat')
    }

    const result: ApiResponse<Retreat> = await response.json()
    return result.data || null
  } catch (error) {
    console.error('Error fetching retreat:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const retreat = await getRetreat(params.slug)

  if (!retreat) {
    return {
      title: 'Retreat Not Found | Wingspan Yoga',
    }
  }

  return {
    title: `Book ${retreat.title} | Wingspan Yoga`,
    description: `Book your spot for ${retreat.title} retreat.`,
  }
}

export default async function RetreatBookingPage({ params }: PageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=' + encodeURIComponent(`/retreats/${params.slug}/book`))
  }

  const retreat = await getRetreat(params.slug)

  if (!retreat) {
    notFound()
  }

  if (retreat.isFull) {
    redirect(`/retreats/${params.slug}?error=fully-booked`)
  }

  return <RetreatBookingClient retreat={retreat} />
}