"use client";
import CreateClassModal from '../../../../components/admin/CreateClassModal';
import EditClassModal from '../../../../components/admin/EditClassModal';
import ClassCalendarView from '../../../../components/admin/ClassCalendarView';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose } from '../../../components/ui/modal';
import { deleteClassTemplate } from '../../../lib/actions/class.actions';
import { useCallback, useEffect, useState } from 'react';

function formatGBP(price: number) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price / 100);
}

function formatTime(timeString: string) {
  return timeString;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric', 
    month: 'short'
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

export default function AdminClassesClient({ classes }: { classes: ClassTemplate[] }) {
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'templates' | 'instances' | 'calendar'>('templates');
  const [editingTemplate, setEditingTemplate] = useState<ClassTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ClassTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View handlers
  const handleViewTemplates = () => { setView('templates'); };
  const handleViewInstances = () => { setView('instances'); };
  const handleViewCalendar = () => { setView('calendar'); };

  // Template handlers
  const handleEditTemplate = (template: ClassTemplate) => () => { setEditingTemplate(template); };
  const handleGenerateInstancesClick = (templateId: string) => () => { generateInstances(templateId).catch(() => {}); };
  const handleAskDeleteTemplate = (template: ClassTemplate) => () => { setDeletingTemplate(template); };
  const handleCloseEditModal = () => { setEditingTemplate(null); };
  const handleCloseDeleteModal = () => { setDeletingTemplate(null); };
  const handleDeleteConfirmClick = () => { handleDeleteTemplate().catch(() => {}); };
  const handleDeleteOpenChange = (open: boolean) => { if (!open) setDeletingTemplate(null); };

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/class-templates');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTemplates(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const handleCreated = useCallback(() => {
    void fetchTemplates();
  }, [fetchTemplates]);

  const generateInstances = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/class-templates/${templateId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeks: 12 }),
      });
      
      if (response.ok) {
        void fetchTemplates();
        alert('Successfully generated instances for the next 12 weeks!');
      } else {
        alert('Failed to generate instances');
      }
    } catch (error) {
      console.error('Error generating instances:', error);
      alert('Failed to generate instances');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteClassTemplate(deletingTemplate.id);
      
      if (result.success) {
        // Refresh the templates list
        void fetchTemplates();
        setDeletingTemplate(null);
        alert('Class template deleted successfully');
      } else {
        alert(result.error || 'Failed to delete class template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete class template');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
              <p className="text-gray-600 mt-1">Manage recurring classes and their instances</p>
            </div>
            <CreateClassModal onCreated={handleCreated} />
          </div>

          {/* View Toggle */}
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
            <button
              onClick={handleViewTemplates}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'templates'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Recurring Classes ({templates.length})
            </button>
            <button
              onClick={handleViewInstances}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'instances'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Upcoming Instances
            </button>
            <button
              onClick={handleViewCalendar}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'calendar'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>

        {/* Content */}
        {view === 'templates' ? (
          <div className="space-y-6">
            {templates.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="text-gray-400 text-5xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring classes yet</h3>
                <p className="text-gray-600 mb-6">Create your first recurring class to get started</p>
                <CreateClassModal onCreated={handleCreated} />
              </div>
            ) : (
              templates.map(template => (
                <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{template.title}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {template.category.replace('_', ' ')}
                          </span>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            {template.difficulty}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Schedule:</span><br />
                            {DAYS_OF_WEEK[template.dayOfWeek]}s at {formatTime(template.startTime)} - {formatTime(template.endTime)}
                          </div>
                          <div>
                            <span className="font-medium">Instructor:</span><br />
                            {template.instructor.name}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span><br />
                            {template.location}
                          </div>
                          <div>
                            <span className="font-medium">Capacity:</span><br />
                            {template.capacity} students
                          </div>
                        </div>

                        {template.description && (
                          <p className="text-gray-600 mt-3">{template.description}</p>
                        )}
                      </div>
                      
                      <div className="text-right ml-6">
                        <div className="text-2xl font-bold text-green-600 mb-3">
                          {formatGBP(template.price)}
                        </div>
                        <div className="space-y-2">
                          <button
                            onClick={handleEditTemplate(template)}
                            className="block w-full px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                          >
                            Edit Template
                          </button>
                          <button
                            onClick={handleGenerateInstancesClick(template.id)}
                            className="block w-full px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Generate 12 weeks
                          </button>
                          <button
                            onClick={handleAskDeleteTemplate(template)}
                            className="block w-full px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete Template
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Upcoming Instances */}
                    {template.instances.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Next 5 classes:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          {template.instances.map(instance => (
                            <div key={instance.id} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{formatDate(instance.date)}</div>
                              <div className="text-gray-600">{instance.status}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Exceptions */}
                    {template.exceptions.length > 0 && (
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-medium text-red-600 mb-2">Cancelled/Modified:</h4>
                        <div className="space-y-1">
                          {template.exceptions.map(exception => (
                            <div key={exception.id} className="text-sm text-red-600">
                              {formatDate(exception.date)} - {exception.reason || 'Cancelled'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : view === 'instances' ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">All Upcoming Class Instances</h2>
              <div className="space-y-2">
                {templates.flatMap(template => template.instances).length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No upcoming instances. Generate some from your recurring classes!</p>
                ) : (
                  templates
                    .flatMap(template => 
                      template.instances.map(instance => ({ instance, template }))
                    )
                    .sort((a, b) => new Date(a.instance.startTime).getTime() - new Date(b.instance.startTime).getTime())
                    .map(({ instance, template }) => (
                      <div key={instance.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{template.title}</span>
                          <span className="text-gray-600 ml-2">- {formatDateTime(instance.startTime)}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{template.instructor.name}</div>
                          <div className="text-sm font-medium">{instance.status}</div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <ClassCalendarView templates={templates} />
        )}

        {/* Legacy Classes Section */}
        {classes.length > 0 && (
          <div className="mt-12 bg-yellow-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-800 mb-4">Legacy Classes (To be migrated)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white rounded-lg p-4 border border-yellow-200">
                  <div className="font-semibold text-yellow-900">{cls.title}</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    {new Date(cls.startTime).toLocaleString('en-GB')}
                  </div>
                  <div className="text-sm text-yellow-600 mt-1">
                    {cls.instructor.name} • {formatGBP(cls.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Template Modal */}
      {editingTemplate && (
        <EditClassModal
          template={editingTemplate}
          isOpen={true}
          onClose={handleCloseEditModal}
          onUpdated={() => {
            handleCloseEditModal();
            fetchTemplates().catch(() => {});
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingTemplate && (
        <Modal 
          open={true} 
          onOpenChange={handleDeleteOpenChange}
        >
          <ModalHeader>
            <ModalTitle>Delete Class Template</ModalTitle>
            <ModalClose onClose={handleCloseDeleteModal} />
          </ModalHeader>
          <ModalContent>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the class template &ldquo;{deletingTemplate.title}&rdquo;?
            </p>
            <p className="text-sm text-red-600 mb-4">
              This action cannot be undone and will also delete all future instances of this class.
            </p>
          </ModalContent>
          <ModalFooter>
            <button
              onClick={handleCloseDeleteModal}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirmClick}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}
