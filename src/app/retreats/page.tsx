import { Metadata } from 'next'
import { API_ROUTES } from '@/constants'
import { Retreat, ApiResponse } from '@/types'
import RetreatListClient from './RetreatListClient'

export const metadata: Metadata = {
  title: 'Yoga Retreats | Wingspan Yoga',
  description: 'Join us for transformative yoga retreats in beautiful locations around the world.',
}

async function getRetreats(): Promise<Retreat[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${API_ROUTES.retreats.list}`, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!response.ok) {
      throw new Error('Failed to fetch retreats')
    }

    const result: ApiResponse<Retreat[]> = await response.json()
    return result.data || []
  } catch (error) {
    console.error('Error fetching retreats:', error)
    return []
  }
}

export default async function RetreatsPage() {
  const retreats = await getRetreats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Yoga Retreats
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-gray-500">
              Escape to beautiful destinations and deepen your practice with our transformative yoga retreats. 
              Join like-minded souls for an unforgettable journey of self-discovery and renewal.
            </p>
          </div>
        </div>
      </div>

      <RetreatListClient retreats={retreats} />
    </div>
  )
}