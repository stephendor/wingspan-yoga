"use server";

import { revalidatePath } from 'next/cache';
import { prisma } from '../prisma';

// Define types directly since they might not be exported yet
type ClassCategory = 'VINYASA' | 'HATHA' | 'YIN' | 'RESTORATIVE' | 'MEDITATION' | 'BREATHWORK' | 'POWER' | 'GENTLE' | 'WORKSHOP' | 'RETREAT' | 'BEGINNER_COURSE' | 'PRENATAL' | 'SENIORS';
type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'ALL_LEVELS';
type ClassLocation = 'STUDIO' | 'ONLINE' | 'HYBRID';

// Types for form data
export interface CreateClassTemplateData {
  title: string;
  description?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "HH:MM" format
  endTime: string; // "HH:MM" format
  capacity: number;
  price: number; // Price in pence (GBP)
  difficulty: DifficultyLevel;
  category: ClassCategory;
  location: ClassLocation;
  meetingUrl?: string;
  notes?: string;
  instructorId: string;
}

export interface CreateClassInstanceData {
  templateId: string;
  date: string; // ISO date string
  capacity?: number; // Override template capacity
  price?: number; // Override template price
  notes?: string;
  instructorId?: string; // Override template instructor
}

// Create a recurring class template
export async function createClassTemplate(data: CreateClassTemplateData) {
  try {
    const template = await prisma.classTemplate.create({
      data: {
        title: data.title,
        description: data.description,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
        price: data.price,
        difficulty: data.difficulty,
        category: data.category,
        location: data.location,
        meetingUrl: data.meetingUrl,
        notes: data.notes,
        instructorId: data.instructorId,
      },
      include: {
        instructor: true,
      },
    });

    revalidatePath('/admin/classes');
    return { success: true, data: template };
  } catch (error) {
    console.error('Error creating class template:', error);
    return { success: false, error: 'Failed to create class template' };
  }
}

// Create a specific class instance from a template
export async function createClassInstance(data: CreateClassInstanceData) {
  try {
    // Get the template to build the full datetime
    const template = await prisma.classTemplate.findUnique({
      where: { id: data.templateId },
    });

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Parse the date and combine with template times
    const date = new Date(data.date);
    const [startHour, startMinute] = template.startTime.split(':').map(Number);
    const [endHour, endMinute] = template.endTime.split(':').map(Number);

    const startTime = new Date(date);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMinute, 0, 0);

    const instance = await prisma.classInstance.create({
      data: {
        templateId: data.templateId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        capacity: data.capacity || template.capacity,
        price: data.price || template.price,
        notes: data.notes,
        instructorId: data.instructorId || template.instructorId,
      },
      include: {
        template: true,
        instructor: true,
      },
    });

    revalidatePath('/admin/classes');
    return { success: true, data: instance };
  } catch (error) {
    console.error('Error creating class instance:', error);
    return { success: false, error: 'Failed to create class instance' };
  }
}

// Cancel a specific class instance (creates an exception)
export async function cancelClassInstance(templateId: string, date: string, reason?: string) {
  try {
    // Create exception record
    await prisma.classException.create({
      data: {
        templateId,
        date: new Date(date),
        reason: reason || 'Cancelled',
      },
    });

    // Delete the instance if it exists
    await prisma.classInstance.deleteMany({
      where: {
        templateId,
        date: new Date(date),
      },
    });

    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error) {
    console.error('Error cancelling class instance:', error);
    return { success: false, error: 'Failed to cancel class instance' };
  }
}

// Update a class template
export async function updateClassTemplate(id: string, data: Partial<CreateClassTemplateData>) {
  try {
    const template = await prisma.classTemplate.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity,
        price: data.price,
        difficulty: data.difficulty,
        category: data.category,
        location: data.location,
        meetingUrl: data.meetingUrl,
        notes: data.notes,
        instructorId: data.instructorId,
      },
      include: {
        instructor: true,
      },
    });

    revalidatePath('/admin/classes');
    return { success: true, data: template };
  } catch (error) {
    console.error('Error updating class template:', error);
    return { success: false, error: 'Failed to update class template' };
  }
}

// Delete a class template
export async function deleteClassTemplate(id: string) {
  try {
    await prisma.classTemplate.delete({
      where: { id },
    });

    revalidatePath('/admin/classes');
    return { success: true };
  } catch (error) {
    console.error('Error deleting class template:', error);
    return { success: false, error: 'Failed to delete class template' };
  }
}

// Get all class templates with their upcoming instances
export async function getClassTemplatesWithInstances() {
  try {
    const templates = await prisma.classTemplate.findMany({
      where: { isActive: true },
      include: {
        instructor: true,
        instances: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: 'asc',
          },
          take: 10, // Limit to next 10 instances per template
          include: {
            instructor: true,
          },
        },
        exceptions: {
          where: {
            date: {
              gte: new Date(),
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return { success: true, data: templates };
  } catch (error) {
    console.error('Error fetching class templates:', error);
    return { success: false, error: 'Failed to fetch class templates' };
  }
}

// Generate instances for a template for the next N weeks
export async function generateInstancesForTemplate(templateId: string, weeks: number = 12) {
  try {
    const template = await prisma.classTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    const instances = [];
    const today = new Date();
    const endDate = new Date(today.getTime() + (weeks * 7 * 24 * 60 * 60 * 1000));

    // Find the first occurrence of the template's day of week
    const currentDate = new Date(today);
    while (currentDate.getDay() !== template.dayOfWeek) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate instances for each week
    while (currentDate <= endDate) {
      // Check if this date has an exception
      const hasException = await prisma.classException.findUnique({
        where: {
          templateId_date: {
            templateId: templateId,
            date: currentDate,
          },
        },
      });

      // Check if instance already exists
      const existingInstance = await prisma.classInstance.findUnique({
        where: {
          templateId_date: {
            templateId: templateId,
            date: currentDate,
          },
        },
      });

      if (!hasException && !existingInstance) {
        const [startHour, startMinute] = template.startTime.split(':').map(Number);
        const [endHour, endMinute] = template.endTime.split(':').map(Number);

        const startTime = new Date(currentDate);
        startTime.setHours(startHour, startMinute, 0, 0);

        const endTime = new Date(currentDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        instances.push({
          templateId: templateId,
          date: new Date(currentDate),
          startTime: startTime,
          endTime: endTime,
          capacity: template.capacity,
          price: template.price,
          instructorId: template.instructorId,
        });
      }

      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    if (instances.length > 0) {
      await prisma.classInstance.createMany({
        data: instances,
      });
    }

    revalidatePath('/admin/classes');
    return { success: true, count: instances.length };
  } catch (error) {
    console.error('Error generating instances:', error);
    return { success: false, error: 'Failed to generate instances' };
  }
}
