"use client";

import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cancelClassInstance, restoreClassInstance } from '../../src/lib/actions/class.actions';

const localizer = momentLocalizer(moment);

interface ClassTemplate {
  id: string;
  title: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  price: number;
  difficulty: string;
  category: string;
  location: string;
  meetingUrl?: string;
  notes?: string;
  isActive: boolean;
  instructor: {
    id: string;
    name: string;
  };
  instances: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    instructor?: {
      name: string;
    };
  }>;
  exceptions: Array<{
    id: string;
    date: string;
    reason?: string;
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    type: 'instance' | 'template';
    templateId: string;
    instanceId?: string;
    instructor: string;
    capacity: number;
    price: number;
    difficulty: string;
    category: string;
    location: string;
    status?: string;
  };
}

function formatGBP(price: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price / 100);
}

export default function ClassCalendarView({ templates }: { templates: ClassTemplate[] }) {
  const router = useRouter();
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCancelled = selectedEvent?.resource.status === 'CANCELLED';

  // UI handlers to satisfy linter about arrow shorthand and promise-returning handlers
  const handleSetMonth = () => { setView(Views.MONTH); };
  const handleSetWeek = () => { setView(Views.WEEK); };
  const handleSetDay = () => { setView(Views.DAY); };
  const handleCancelClick = () => { handleCancelInstance().catch(() => {}); };
  const handleRestoreClick = () => { handleRestoreInstance().catch(() => {}); };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  // Handle clicking on a calendar event
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowCancelModal(true);
  };

  // Handle cancelling a class instance
  const handleCancelInstance = async () => {
    if (!selectedEvent) return;
    
    setIsDeleting(true);
    try {
      const result = await cancelClassInstance(
        selectedEvent.resource.templateId,
        moment(selectedEvent.start).format('YYYY-MM-DD'),
        'Cancelled by admin'
      );
      
      if (result.success) {
        setShowCancelModal(false);
        setSelectedEvent(null);
        // Refresh the page to show updated data
        router.refresh();
      } else {
        console.error('Failed to cancel class instance');
        alert('Failed to cancel class instance');
      }
    } catch (error) {
      console.error('Error cancelling class instance:', error);
      alert('Error cancelling class instance');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreInstance = async () => {
    if (!selectedEvent) return;
    setIsDeleting(true);
    try {
      const result = await restoreClassInstance(
        selectedEvent.resource.templateId,
        moment(selectedEvent.start).format('YYYY-MM-DD')
      );
      if (result.success) {
        setShowCancelModal(false);
        setSelectedEvent(null);
        router.refresh();
      } else {
        alert('Failed to restore class instance');
      }
    } catch (e) {
      console.error('Error restoring class instance:', e);
      alert('Error restoring class instance');
    } finally {
      setIsDeleting(false);
    }
  };

  // Convert class instances to calendar events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    templates.forEach(template => {
      // Get all exception dates for this template to filter out cancelled instances
      const exceptionDates = new Set(
        template.exceptions.map(exception => 
          new Date(exception.date).toISOString().split('T')[0]
        )
      );

      // Add instances (but skip if there's an exception for this date)
      template.instances.forEach(instance => {
        const instanceDateStr = new Date(instance.date).toISOString().split('T')[0];
        
        // Skip this instance if it has been cancelled (has an exception)
        if (exceptionDates.has(instanceDateStr)) {
          console.log('🚫 Skipping cancelled instance:', {
            templateTitle: template.title,
            instanceDate: instanceDateStr,
            hasException: true
          });
          return;
        }

        // Get the instance date and ensure it's treated as local time
        const instanceDate = new Date(instance.date);
        const year = instanceDate.getFullYear();
        const month = instanceDate.getMonth();
        const day = instanceDate.getDate();
        
        // Extract time from the full datetime strings that are stored in the instance
        const startDateTime = new Date(instance.startTime);
        const endDateTime = new Date(instance.endTime);
        
        // Create start and end times on the correct date, using local timezone
        const start = new Date(year, month, day, startDateTime.getHours(), startDateTime.getMinutes(), 0, 0);
        const end = new Date(year, month, day, endDateTime.getHours(), endDateTime.getMinutes(), 0, 0);

        // Debug logging for week/day view issues
        console.log('Creating event for instance:', {
          instanceDate: instance.date,
          instanceDateStr,
          year, month, day,
          startTime: instance.startTime,
          endTime: instance.endTime,
          extractedStartHour: startDateTime.getHours(),
          extractedStartMinute: startDateTime.getMinutes(),
          extractedEndHour: endDateTime.getHours(),
          extractedEndMinute: endDateTime.getMinutes(),
          finalStart: start,
          finalEnd: end,
          startISOString: start.toISOString(),
          endISOString: end.toISOString(),
          duration: (end.getTime() - start.getTime()) / (1000 * 60), // minutes
          isAllDay: start.getTime() === end.getTime(),
          view: view,
          template: template.title
        });

        events.push({
          id: instance.id,
          title: `${template.title} (${instance.instructor?.name || template.instructor.name})`,
          start,
          end,
          resource: {
            type: 'instance',
            templateId: template.id,
            instanceId: instance.id,
            instructor: instance.instructor?.name || template.instructor.name,
            capacity: template.capacity,
            price: template.price,
            difficulty: template.difficulty,
            category: template.category,
            location: template.location,
            status: instance.status,
          },
        });
      });

      // Add cancelled events (exceptions) - these show as cancelled classes that were removed
      template.exceptions.forEach(exception => {
        // Get the exception date and ensure it's treated as local time
        const exceptionDate = new Date(exception.date);
        const year = exceptionDate.getFullYear();
        const month = exceptionDate.getMonth();
        const day = exceptionDate.getDate();
        
        // Use template times for cancelled events
        const [startHour, startMinute] = template.startTime.split(':').map(Number);
        const [endHour, endMinute] = template.endTime.split(':').map(Number);
        
        // Create start and end times on the correct date, using local timezone
        const start = new Date(year, month, day, startHour, startMinute, 0, 0);
        const end = new Date(year, month, day, endHour, endMinute, 0, 0);

        console.log('Creating cancelled event:', {
          exceptionDate: exception.date,
          year, month, day,
          startHour, startMinute, endHour, endMinute,
          finalStart: start,
          finalEnd: end,
          template: template.title
        });

        events.push({
          id: `exception-${exception.id}`,
          title: `${template.title} (${template.instructor.name}) - CANCELLED`,
          start,
          end,
          resource: {
            type: 'instance',
            templateId: template.id,
            instanceId: exception.id,
            instructor: template.instructor.name,
            capacity: template.capacity,
            price: template.price,
            difficulty: template.difficulty,
            category: template.category,
            location: template.location,
            status: 'CANCELLED',
          },
        });
      });
    });

    console.log('Total events created:', events.length);
    console.log('Events by view:', view, events.map(e => ({
      title: e.title,
      start: e.start,
      end: e.end,
      status: e.resource.status
    })));

    return events;
  }, [templates, view]);

  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3174ad';
    
    // Color coding based on difficulty
    switch (event.resource.difficulty) {
      case 'BEGINNER':
        backgroundColor = '#22c55e'; // green
        break;
      case 'INTERMEDIATE':
        backgroundColor = '#f59e0b'; // yellow
        break;
      case 'ADVANCED':
        backgroundColor = '#ef4444'; // red
        break;
      case 'ALL_LEVELS':
        backgroundColor = '#3b82f6'; // blue
        break;
    }

    // Dim color if cancelled
    if (event.resource.status === 'CANCELLED') {
      backgroundColor = '#9ca3af'; // gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: event.resource.status === 'CANCELLED' ? 0.6 : 1,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '12px',
      },
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div className="p-1">
      <div className="font-semibold text-xs">{event.title}</div>
      <div className="text-xs opacity-90">
        {event.resource.location} • {formatGBP(event.resource.price)}
      </div>
      {event.resource.status === 'CANCELLED' && (
        <div className="text-xs opacity-90 font-medium">CANCELLED</div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Class Calendar</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleSetMonth}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === Views.MONTH
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Month
            </button>
            <button
              onClick={handleSetWeek}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === Views.WEEK
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Week
            </button>
            <button
              onClick={handleSetDay}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                view === Views.DAY
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Beginner</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Intermediate</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Advanced</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>All Levels</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Cancelled</span>
          </div>
        </div>

        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            className="h-full"
            view={view}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            onView={setView}
            date={date}
            onNavigate={handleNavigate}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            components={{
              event: EventComponent,
            }}
            popup
            popupOffset={30}
            step={15}
            timeslots={4}
            min={new Date(2025, 0, 1, 6, 0, 0)} // 6 AM
            max={new Date(2025, 0, 1, 22, 0, 0)} // 10 PM
            showMultiDayTimes
            dayLayoutAlgorithm="no-overlap"
          />
        </div>

        {/* Cancel/Restore Class Instance Modal */}
        {showCancelModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {isCancelled ? 'Restore Class Instance' : 'Cancel Class Instance'}
              </h3>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  <strong>Class:</strong> {selectedEvent.title}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Date:</strong> {moment(selectedEvent.start).format('MMMM DD, YYYY')}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Time:</strong> {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Location:</strong> {selectedEvent.resource.location}
                </p>
                {!isCancelled ? (
                  <p className="text-red-600 text-sm">
                    ⚠️ This will permanently cancel this specific class instance and cannot be undone.
                  </p>
                ) : (
                  <p className="text-gray-700 text-sm">This class was previously cancelled. You can restore it.</p>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={isDeleting}
                >
                  {isCancelled ? 'Go Back' : 'Keep Class'}
                </button>
                {isCancelled ? (
                  <button
                    onClick={handleRestoreClick}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-sage-600 text-white rounded-md hover:bg-sage-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Restoring...' : 'Restore Class'}
                  </button>
                ) : (
                  <button
                    onClick={handleCancelClick}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Cancelling...' : 'Cancel Class'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
