'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

// Custom hook to handle SSR-safe IDs
function useSSRSafeId(prefix: string = 'input') {
  const [id, setId] = React.useState<string>('')
  
  React.useEffect(() => {
    // Generate a stable ID only on the client
    setId(`${prefix}_${Math.random().toString(36).substr(2, 9)}`)
  }, [prefix])
  
  return id
}

const inputVariants = cva(
  "flex w-full rounded-soft border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-softgreen-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-charcoal-200 hover:border-charcoal-300 focus:border-softgreen-500",
        error: "border-red-500 focus:border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus:border-green-500 focus-visible:ring-green-500",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helpText?: string
  errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, helpText, errorMessage, type, ...props }, ref) => {
    const inputId = useSSRSafeId('input')
    const helpTextId = useSSRSafeId('help')
    const errorId = useSSRSafeId('error')

    // Auto-set variant based on error state
    const finalVariant = errorMessage ? 'error' : variant

    return (
      <div className="space-y-2">
        {label && inputId && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-charcoal-700"
          >
            {label}
          </label>
        )}
        <input
          id={inputId || undefined}
          type={type}
          className={clsx(inputVariants({ variant: finalVariant, size, className }))}
          ref={ref}
          aria-describedby={
            clsx(
              helpText && helpTextId,
              errorMessage && errorId
            ) || undefined
          }
          aria-invalid={errorMessage ? 'true' : 'false'}
          {...props}
        />
        {helpText && !errorMessage && helpTextId && (
          <p id={helpTextId} className="text-xs text-charcoal-500">
            {helpText}
          </p>
        )}
        {errorMessage && errorId && (
          <p id={errorId} className="text-xs text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// TextArea component
export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  helpText?: string
  errorMessage?: string
}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant, size, label, helpText, errorMessage, ...props }, ref) => {
    const textareaId = useSSRSafeId('textarea')
    const helpTextId = useSSRSafeId('help')
    const errorId = useSSRSafeId('error')

    // Auto-set variant based on error state
    const finalVariant = errorMessage ? 'error' : variant

    return (
      <div className="space-y-2">
        {label && textareaId && (
          <label 
            htmlFor={textareaId}
            className="text-sm font-medium text-charcoal-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId || undefined}
          className={clsx(inputVariants({ variant: finalVariant, size, className }), "min-h-[80px] resize-y")}
          ref={ref}
          aria-describedby={
            clsx(
              helpText && helpTextId,
              errorMessage && errorId
            ) || undefined
          }
          aria-invalid={errorMessage ? 'true' : 'false'}
          {...props}
        />
        {helpText && !errorMessage && helpTextId && (
          <p id={helpTextId} className="text-xs text-charcoal-500">
            {helpText}
          </p>
        )}
        {errorMessage && errorId && (
          <p id={errorId} className="text-xs text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }
)
TextArea.displayName = "TextArea"

export { Input, TextArea, inputVariants }
