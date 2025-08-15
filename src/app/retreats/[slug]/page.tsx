import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { API_ROUTES } from '@/constants'
import { Retreat, ApiResponse } from '@/types'
import RetreatDetailClient from './RetreatDetailClient'

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
    title: `${retreat.title} | Wingspan Yoga`,
    description: retreat.description,
  }
}

export default async function RetreatDetailPage({ params }: PageProps) {
  const retreat = await getRetreat(params.slug)

  if (!retreat) {
    notFound()
  }

  return <RetreatDetailClient retreat={retreat} />
}