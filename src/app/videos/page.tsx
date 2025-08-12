import { Suspense } from 'react'
import { Metadata } from 'next'
import { VideoLibraryClient } from './VideoLibraryClient'

export const metadata: Metadata = {
  title: 'Video Library | Wingspan Yoga',
  description: 'Access our comprehensive collection of yoga videos. Practice at your own pace with expert instruction from certified instructors.',
  keywords: ['yoga videos', 'online yoga', 'video library', 'yoga practice', 'meditation', 'wellness'],
}

export const dynamic = 'force-dynamic' // Ensure fresh data
export const revalidate = 300 // Revalidate every 5 minutes

function VideoLibrarySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
          </div>

          {/* Search & Filters Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="lg:col-span-1 flex flex-col sm:flex-row lg:flex-col gap-4">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Video Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-soft overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VideoLibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-sage-800 mb-4">
              Video Library
            </h1>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Discover our comprehensive collection of yoga videos. Practice at your own pace 
              with expert guidance from our certified instructors.
            </p>
          </div>

          <Suspense fallback={<VideoLibrarySkeleton />}>
            <VideoLibraryClient />
          </Suspense>
        </div>
      </div>
    </div>
  )
}