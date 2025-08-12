'use client'

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalClose } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

// Types based on our API response
interface StudentBooking {
  bookingId: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  bookingDate: string;
  status: string;
}

interface ClassData {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  difficulty: string;
  category: string;
  price: number;
  status: string;
  meetingUrl?: string;
  notes?: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  bookings: {
    total: number;
    capacity: number;
    availableSpots: number;
    students: StudentBooking[];
  };
}

interface ScheduleData {
  instructor: {
    id: string;
    name: string;
    email: string;
    user: {
      id: string;
    };
  };
  summary: {
    totalClasses: number;
    totalBookings: number;
    totalCapacity: number;
    averageBookingRate: number;
    upcomingClasses: number;
  };
  classes: ClassData[];
}

interface InstructorScheduleProps {
  onStatsUpdate?: (stats: ScheduleData['summary']) => void;
}

export default function InstructorSchedule({ onStatsUpdate }: InstructorScheduleProps) {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state for student roster
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);

  // Function to open the student roster modal
  const openRosterModal = (classData: ClassData) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await fetch('/api/instructor/schedule');
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required');
          } else if (response.status === 403) {
            throw new Error('Access denied - instructor role required');
          } else {
            throw new Error(`Failed to fetch schedule: ${response.status}`);
          }
        }

        const data: ScheduleData = await response.json();
        setScheduleData(data);
        
        // Pass stats to parent component for dashboard summary
        if (onStatsUpdate) {
          onStatsUpdate(data.summary);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching instructor schedule:', err);
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [onStatsUpdate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) >= new Date();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="outlined" className="border-red-200 bg-red-50">
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-2">
            <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-red-800 mb-1">Error Loading Schedule</h3>
          <p className="text-xs text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!scheduleData) {
    return null;
  }

  const { classes, summary } = scheduleData;
  const upcomingClasses = classes.filter(cls => isUpcoming(cls.startTime));
  const pastClasses = classes.filter(cls => !isUpcoming(cls.startTime));

  return (
    <div className="space-y-6">
      {/* Schedule Summary */}
      <Card variant="zen">
        <CardHeader>
          <CardTitle>Schedule Overview</CardTitle>
          <CardDescription>
            {summary.totalClasses} total classes • {summary.totalBookings} students enrolled • {summary.averageBookingRate}% average booking rate
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Upcoming Classes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Classes ({upcomingClasses.length})
        </h2>
        {upcomingClasses.length === 0 ? (
          <Card variant="outlined">
            <CardContent className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No upcoming classes scheduled</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <Card key={classItem.id} variant="elevated">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{classItem.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(classItem.startTime)} • {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(classItem.difficulty)}`}>
                      {classItem.difficulty}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Location</p>
                      <p className="text-sm text-gray-900">{classItem.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Capacity</p>
                      <p className="text-sm text-gray-900">
                        {classItem.bookings.total} / {classItem.capacity} students
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Available Spots</p>
                      <p className="text-sm text-gray-900">{classItem.bookings.availableSpots} remaining</p>
                    </div>
                  </div>
                  
                  {classItem.description && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">{classItem.description}</p>
                    </div>
                  )}

                  {classItem.bookings.students.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        Enrolled Students ({classItem.bookings.students.length})
                      </p>
                      <div className="space-y-1">
                        {classItem.bookings.students.slice(0, 3).map((booking) => (
                          <div key={booking.bookingId} className="text-xs text-gray-600">
                            • {booking.student.name}
                          </div>
                        ))}
                        {classItem.bookings.students.length > 3 && (
                          <div className="text-xs text-gray-500">
                            + {classItem.bookings.students.length - 3} more students
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openRosterModal(classItem)}
                    >
                      View Roster ({classItem.bookings.students.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Classes */}
      {pastClasses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Past Classes ({pastClasses.length})
          </h2>
          <div className="space-y-4">
            {pastClasses.slice(0, 5).map((classItem) => (
              <Card key={classItem.id} variant="outlined" className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base text-gray-700">{classItem.title}</CardTitle>
                      <CardDescription>
                        {formatDate(classItem.startTime)} • {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                      </CardDescription>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                      Completed
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {classItem.bookings.total} students attended • {classItem.location}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openRosterModal(classItem)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View Roster ({classItem.bookings.students.length})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pastClasses.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                + {pastClasses.length - 5} more past classes
              </p>
            )}
          </div>
        </div>
      )}

      {/* Student Roster Modal */}
      <Modal open={isModalOpen} onOpenChange={closeModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {selectedClass ? `Student Roster - ${selectedClass.title}` : 'Student Roster'}
            </ModalTitle>
            <ModalClose onClose={closeModal} />
          </ModalHeader>
          
          {selectedClass && (
            <div className="space-y-4">
              {/* Class Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Date & Time:</span>
                    <p className="text-gray-900">
                      {formatDate(selectedClass.startTime)} • {formatTime(selectedClass.startTime)} - {formatTime(selectedClass.endTime)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-900">{selectedClass.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Capacity:</span>
                    <p className="text-gray-900">
                      {selectedClass.bookings.students.length} / {selectedClass.capacity} students
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Available Spots:</span>
                    <p className="text-gray-900">{selectedClass.bookings.availableSpots} remaining</p>
                  </div>
                </div>
              </div>

              {/* Student List */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Enrolled Students ({selectedClass.bookings.students.length})
                </h3>
                
                {selectedClass.bookings.students.length > 0 ? (
                  <div className="space-y-2">
                    {selectedClass.bookings.students.map((booking) => (
                      <div 
                        key={booking.bookingId} 
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {booking.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{booking.student.name}</p>
                            <p className="text-sm text-gray-500">{booking.student.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            Booked: {new Date(booking.bookingDate).toLocaleDateString()}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No students enrolled yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Students can still book this class if spots are available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
