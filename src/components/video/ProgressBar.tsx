'use client'

import { CheckCircle } from 'lucide-react'

interface ProgressBarProps {
  progress: number // Progress in seconds
  duration: number // Video duration in seconds
  className?: string
}

export function ProgressBar({ progress, duration, className = '' }: ProgressBarProps) {
  if (progress <= 0) {
    return null // Don't show progress bar for unwatched videos
  }

  const progressPercentage = Math.min((progress / duration) * 100, 100)
  const isCompleted = progressPercentage >= 95

  return (
    <div className={`absolute bottom-0 left-0 right-0 ${className}`}>
      {/* Progress bar background */}
      <div className="h-1 bg-black/30 w-full">
        {/* Progress bar fill */}
        <div 
          className="h-full bg-sage-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Progress indicator */}
      <div className="absolute -top-6 right-2 flex items-center space-x-1 bg-black/70 text-white text-xs px-2 py-1 rounded-soft">
        {isCompleted ? (
          <>
            <CheckCircle className="h-3 w-3 text-sage-400" />
            <span>Completed</span>
          </>
        ) : (
          <span>{Math.round(progressPercentage)}%</span>
        )}
      </div>
    </div>
  )
}

