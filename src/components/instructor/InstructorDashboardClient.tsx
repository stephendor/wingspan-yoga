'use client'

import { useState } from 'react';
import InstructorSchedule from '@/components/instructor/InstructorSchedule';

interface DashboardStats {
  totalClasses: number;
  totalBookings: number;
  totalCapacity: number;
  averageBookingRate: number;
  upcomingClasses: number;
}

interface InstructorDashboardClientProps {
  instructor: {
    id: string;
    name: string;
    email: string;
    role: string;
    membershipType?: string;
  };
}

export default function InstructorDashboardClient({ instructor }: InstructorDashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalClasses: 0,
    totalBookings: 0,
    totalCapacity: 0,
    averageBookingRate: 0,
    upcomingClasses: 0,
  });

  const handleStatsUpdate = (newStats: DashboardStats) => {
    setStats(newStats);
  };

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Upcoming Classes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.upcomingClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-yellow-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Booking Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.averageBookingRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Class
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                View Schedule
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Manage Students
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="h-2 w-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Schedule loaded successfully</span>
              <span className="ml-auto text-gray-400">now</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-2 w-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-gray-600">{stats.totalClasses} total classes found</span>
              <span className="ml-auto text-gray-400">now</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="h-2 w-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-600">{stats.totalBookings} students enrolled</span>
              <span className="ml-auto text-gray-400">now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Instructor Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">My Schedule</h3>
        <InstructorSchedule onStatsUpdate={handleStatsUpdate} />
      </div>

      {/* RBAC Test Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          🔒 Role-Based Access Control Test
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          This page confirms that the RBAC system is working correctly. Only users with INSTRUCTOR role can access this dashboard.
        </p>
        <div className="bg-white rounded p-4 text-sm font-mono">
          <div><strong>Session Data:</strong></div>
          <div>User ID: {instructor.id}</div>
          <div>Email: {instructor.email}</div>
          <div>Name: {instructor.name}</div>
          <div>Role: {instructor.role}</div>
          <div>Membership: {instructor.membershipType}</div>
        </div>
      </div>
    </div>
  );
}
