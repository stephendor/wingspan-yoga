"use client";
import React, { useState, useEffect } from 'react';
import ClassForm from './ClassForm';

interface Instructor {
  id: string;
  name: string;
}

export default function CreateClassModal({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/instructors');
      if (response.ok) {
        const data = await response.json();
        setInstructors(data.instructors || []);
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchInstructors();
    }
  }, [open]);

  return (
    <>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium shadow-sm transition-colors w-full"
        onClick={() => setOpen(true)}
      >
        + Create Recurring Class
      </button>
      
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Recurring Class</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading instructors...</p>
                </div>
              ) : (
                <ClassForm 
                  onSuccess={() => { 
                    setOpen(false); 
                    onCreated(); 
                  }} 
                  onCancel={() => setOpen(false)}
                  instructors={instructors}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
