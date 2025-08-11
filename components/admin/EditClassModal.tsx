"use client";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../src/components/ui/dialog';
import ClassForm from './ClassForm';

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
    instructorId: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditClassModal({ template, isOpen, onClose, onUpdated }: EditClassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/class-templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onUpdated();
        onClose();
      } else {
        console.error('Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
    
    setIsSubmitting(false);
  };

  // Convert template data to form format
  const defaultValues = {
    title: template.title,
    description: template.description || '',
    dayOfWeek: template.dayOfWeek.toString(),
    startTime: template.startTime,
    endTime: template.endTime,
    capacity: template.capacity,
    price: template.price / 100, // Convert from pence to pounds for display
    difficulty: template.difficulty,
    category: template.category,
    location: template.location,
    meetingUrl: template.meetingUrl || '',
    notes: template.notes || '',
    isActive: template.isActive,
    instructorId: template.instructorId,
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isSubmitting && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Recurring Class</DialogTitle>
          <DialogDescription>
            Modify the recurring class template. Changes will apply to future class instances.
          </DialogDescription>
        </DialogHeader>
        
        <ClassForm 
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          isSubmitting={isSubmitting}
          submitButtonText="Update Class Template"
        />
      </DialogContent>
    </Dialog>
  );
}
