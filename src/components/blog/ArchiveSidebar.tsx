'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Calendar } from 'lucide-react';

// Simple Badge component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium';
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-transparent'
  };
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

interface ArchiveMonth {
  month: number;
  monthName: string;
  postCount: number;
}

interface ArchiveYear {
  year: number;
  months: ArchiveMonth[];
  totalPosts: number;
}

interface ArchiveData {
  success: boolean;
  archiveData?: ArchiveYear[];
  error?: string;
}

interface ArchiveSidebarProps {
  className?: string;
  selectedYear?: number;
  selectedMonth?: number;
}

export default function ArchiveSidebar({ 
  className = '', 
  selectedYear, 
  selectedMonth 
}: ArchiveSidebarProps) {
  const [archiveData, setArchiveData] = useState<ArchiveYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchArchiveData();
  }, []);

  useEffect(() => {
    // Auto-expand the selected year
    if (selectedYear && !expandedYears.has(selectedYear)) {
      setExpandedYears(prev => new Set([...prev, selectedYear]));
    }
  }, [selectedYear, expandedYears]);

  const fetchArchiveData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/blog-posts/archive-summary');
      const data: ArchiveData = await response.json();
      
      if (data.success && data.archiveData) {
        setArchiveData(data.archiveData);
        
        // Auto-expand the most recent year
        if (data.archiveData.length > 0) {
          setExpandedYears(new Set([data.archiveData[0].year]));
        }
      } else {
        setError(data.error || 'Failed to load archive data');
      }
    } catch (err) {
      setError('Failed to load archive data');
      console.error('Archive data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const newSet = new Set(prev);
      if (newSet.has(year)) {
        newSet.delete(year);
      } else {
        newSet.add(year);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Archive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Archive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (archiveData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Archive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">No blog posts found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Archive
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {archiveData.map((yearData) => (
          <div key={yearData.year} className="space-y-1">
            {/* Year Header */}
            <button
              onClick={() => toggleYear(yearData.year)}
              className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors hover:bg-gray-100 ${
                selectedYear === yearData.year ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                {expandedYears.has(yearData.year) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span className="font-medium">{yearData.year}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {yearData.totalPosts}
              </Badge>
            </button>

            {/* Month List */}
            {expandedYears.has(yearData.year) && (
              <div className="ml-6 space-y-1">
                {yearData.months.map((monthData) => (
                  <Link
                    key={monthData.month}
                    href={`/blog/archive/${yearData.year}/${monthData.month}`}
                    className={`flex items-center justify-between p-2 rounded-md text-sm transition-colors hover:bg-gray-100 ${
                      selectedYear === yearData.year && selectedMonth === monthData.month
                        ? 'bg-blue-100 border border-blue-300 text-blue-800'
                        : 'text-gray-700'
                    }`}
                  >
                    <span>{monthData.monthName}</span>
                    <Badge variant="outline" className="text-xs">
                      {monthData.postCount}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* All Posts Link */}
        <div className="pt-2 border-t">
          <Link
            href="/blog"
            className={`flex items-center justify-between p-2 rounded-md text-sm transition-colors hover:bg-gray-100 ${
              !selectedYear && !selectedMonth
                ? 'bg-blue-100 border border-blue-300 text-blue-800'
                : 'text-gray-700'
            }`}
          >
            <span>All Posts</span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
