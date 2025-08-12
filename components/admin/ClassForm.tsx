"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ClassTemplateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dayOfWeek: z.string().min(1, 'Day of week is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  price: z.string().min(1, 'Price is required'),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS']),
  category: z.enum(['VINYASA', 'HATHA', 'YIN', 'RESTORATIVE', 'MEDITATION', 'BREATHWORK', 'POWER', 'GENTLE', 'BEGINNER_COURSE', 'PRENATAL', 'SENIORS']),
  location: z.enum(['STUDIO', 'ONLINE']),
  meetingUrl: z.string().optional(),
  notes: z.string().optional(),
  instructorId: z.string().min(1, 'Instructor is required'),
});

export type ClassTemplateFormValues = z.infer<typeof ClassTemplateSchema>;

interface Instructor {
  id: string;
  name: string;
}

interface ClassFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  instructors?: Instructor[];
  defaultValues?: Partial<ClassTemplateFormValues>;
  isEditMode?: boolean;
  templateId?: string;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

const CLASS_CATEGORIES = [
  { value: 'VINYASA', label: 'Vinyasa Flow' },
  { value: 'HATHA', label: 'Hatha Yoga' },
  { value: 'YIN', label: 'Yin Yoga' },
  { value: 'RESTORATIVE', label: 'Restorative' },
  { value: 'MEDITATION', label: 'Meditation' },
  { value: 'BREATHWORK', label: 'Breathwork' },
  { value: 'POWER', label: 'Power Yoga' },
  { value: 'GENTLE', label: 'Gentle Yoga' },
  { value: 'BEGINNER_COURSE', label: 'Beginner Course' },
  { value: 'PRENATAL', label: 'Prenatal Yoga' },
  { value: 'SENIORS', label: 'Seniors Yoga' },
];

const DIFFICULTY_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'ALL_LEVELS', label: 'All Levels' },
];

const LOCATIONS = [
  { value: 'STUDIO', label: 'In Studio' },
  { value: 'ONLINE', label: 'Online' },
];

export default function ClassForm({ onSuccess, onCancel, instructors = [], defaultValues, isEditMode = false, templateId }: ClassFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ClassTemplateFormValues>({
    resolver: zodResolver(ClassTemplateSchema),
    defaultValues: {
      dayOfWeek: "1",
      difficulty: 'ALL_LEVELS',
      location: 'STUDIO',
      category: 'VINYASA',
      capacity: "15",
      price: "18",
      ...((typeof instructors !== 'undefined' && instructors.length > 0) ? { instructorId: instructors[0].id } : {}),
      ...(defaultValues || {}),
    },
  });

  const watchLocation = watch('location');

  const onSubmit = async (data: ClassTemplateFormValues) => {
    setIsLoading(true);
    try {
      // Convert price from pounds to pence
      const dataInPence = {
        ...data,
        price: Math.round(parseFloat(data.price) * 100), // Convert £ to pence
      };

      const url = isEditMode && templateId 
        ? `/api/admin/class-templates/${templateId}`
        : '/api/admin/class-templates';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataInPence),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        alert(result.error || `Failed to ${isEditMode ? 'update' : 'create'} class template`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} class template:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} class template`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Recurring Class</h3>
          <p className="text-gray-600">Set up a class that repeats weekly on the same day and time</p>
        </div>

        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class Title *</label>
              <input
                {...register('title')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Morning Vinyasa Flow"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CLASS_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the class..."
            />
          </div>
        </div>

  {/* Schedule */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Schedule</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week *</label>
              <select
                {...register('dayOfWeek', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DAYS_OF_WEEK.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
              {errors.dayOfWeek && <p className="text-red-500 text-xs mt-1">{errors.dayOfWeek.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                type="time"
                {...register('startTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                type="time"
                {...register('endTime')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Class Details</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <select
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {LOCATIONS.map(loc => (
                  <option key={loc.value} value={loc.value}>{loc.label}</option>
                ))}
              </select>
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label>
              <select
                {...register('difficulty')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DIFFICULTY_LEVELS.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
              {errors.difficulty && <p className="text-red-500 text-xs mt-1">{errors.difficulty.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instructor *</label>
              <select
                {...register('instructorId')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an instructor</option>
                {instructors.map(instructor => (
                  <option key={instructor.id} value={instructor.id}>{instructor.name}</option>
                ))}
              </select>
              {errors.instructorId && <p className="text-red-500 text-xs mt-1">{errors.instructorId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
              <input
                type="number"
                {...register('capacity', { valueAsNumber: true })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (£) *</label>
              <input
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="18.00"
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
            </div>
          </div>

          {watchLocation === 'ONLINE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meeting URL</label>
              <input
                type="url"
                {...register('meetingUrl')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://zoom.us/j/..."
              />
              {errors.meetingUrl && <p className="text-red-500 text-xs mt-1">{errors.meetingUrl.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special instructions or requirements..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Recurring Class'}
          </button>
        </div>
      </form>
    </div>
  );
}
