import { Suspense } from 'react'
import { Metadata } from 'next'
import { VideoPlayerClient } from './VideoPlayerClient'

export const metadata: Metadata = {
  title: 'Video Player | Wingspan Yoga',
  description: 'Watch yoga videos with expert instruction and guidance.',
}

export const dynamic = 'force-dynamic' // Ensure fresh data for video access checks
export const revalidate = 0 // No caching for video player pages

function VideoPlayerSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>

          {/* Video Player Skeleton */}
          <div className="aspect-video bg-gray-200 rounded-lg animate-pulse"></div>

          {/* Video Info Skeleton */}
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Related Videos Skeleton */}
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-soft overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface VideoPlayerPageProps {
  params: Promise<{ videoId: string }>
}

export default async function VideoPlayerPage({ params }: VideoPlayerPageProps) {
  const { videoId } = await params

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<VideoPlayerSkeleton />}>
            <VideoPlayerClient videoId={videoId} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}