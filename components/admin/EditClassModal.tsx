"use client";
import React, { useState, useEffect } from 'react';
import ClassForm from './ClassForm';

interface Instructor {
  id: string;
  name: string;
}

interface EditClassModalProps {
  template: {
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
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditClassModal({ template, isOpen, onClose, onUpdated }: EditClassModalProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/admin/instructors');
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.instructors || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInstructors();
    }
  }, [isOpen]);

  const handleSuccess = () => {
    onUpdated();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Edit Recurring Class</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Modify the recurring class template. Changes will apply to future class instances.
          </p>
          
          <EditableClassForm
            template={template}
            instructors={instructors}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

// Create a version of ClassForm that supports editing
function EditableClassForm({ 
  template, 
  instructors, 
  onSuccess, 
  onCancel 
}: { 
  template: EditClassModalProps['template']; 
  instructors: Instructor[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  // Define the allowed enum types
  type CategoryType = 'VINYASA' | 'HATHA' | 'YIN' | 'RESTORATIVE' | 'MEDITATION' | 'BREATHWORK' | 'POWER' | 'GENTLE' | 'WORKSHOP' | 'RETREAT' | 'BEGINNER_COURSE' | 'PRENATAL' | 'SENIORS';
  type LocationType = 'STUDIO' | 'ONLINE' | 'HYBRID';
  type DifficultyType = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';

  // Prepare default values from the template
  const defaultValues = {
    title: template.title,
    description: template.description || '',
    category: template.category as CategoryType,
    location: template.location as LocationType,
    dayOfWeek: template.dayOfWeek,
    startTime: template.startTime,
    endTime: template.endTime,
    capacity: template.capacity,
    price: template.price / 100, // Convert from pence to pounds for display
    difficulty: template.difficulty as DifficultyType,
    instructorId: template.instructor.id,
    meetingUrl: template.meetingUrl || '',
    notes: template.notes || '',
  };

  return (
    <ClassForm
      onSuccess={onSuccess}
      onCancel={onCancel}
      instructors={instructors}
      defaultValues={defaultValues}
      isEditMode={true}
      templateId={template.id}
    />
  );
}
