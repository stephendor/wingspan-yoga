import { Suspense } from 'react'
import InstructorDashboardClient from '@/components/instructor/InstructorDashboardClient'

export default function InstructorDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-sage-800 mb-4">
              Instructor Dashboard
            </h1>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Manage your classes, view student rosters, and track your teaching schedule.
            </p>
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            <InstructorDashboardClient 
              instructor={{
                id: 'temp',
                name: 'Instructor',
                email: 'instructor@example.com',
                role: 'INSTRUCTOR'
              }}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
