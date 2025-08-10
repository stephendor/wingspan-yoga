import * as React from 'react'
import { motion } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const inputVariants = cva(
  "flex w-full rounded-soft border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-charcoal-200 hover:border-charcoal-300 focus:border-sage-500",
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
    const inputId = React.useId()
    const helpTextId = React.useId()
    const errorId = React.useId()

    // Auto-set variant based on error state
    const finalVariant = errorMessage ? 'error' : variant

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-sm font-medium text-charcoal-700"
          >
            {label}
          </label>
        )}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <input
            id={inputId}
            type={type}
            className={clsx(inputVariants({ variant: finalVariant, size, className }))}
            ref={ref}
            aria-describedby={
              clsx(
                helpText && helpTextId,
                errorMessage && errorId
              ) || undefined
            }
            aria-invalid={!!errorMessage}
            {...props}
          />
        </motion.div>
        {helpText && !errorMessage && (
          <p id={helpTextId} className="text-xs text-charcoal-500">
            {helpText}
          </p>
        )}
        {errorMessage && (
          <motion.p 
            id={errorId} 
            className="text-xs text-red-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            {errorMessage}
          </motion.p>
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
    const textareaId = React.useId()
    const helpTextId = React.useId()
    const errorId = React.useId()

    // Auto-set variant based on error state
    const finalVariant = errorMessage ? 'error' : variant

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
            className="text-sm font-medium text-charcoal-700"
          >
            {label}
          </label>
        )}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <textarea
            id={textareaId}
            className={clsx(inputVariants({ variant: finalVariant, size, className }), "min-h-[80px] resize-y")}
            ref={ref}
            aria-describedby={
              clsx(
                helpText && helpTextId,
                errorMessage && errorId
              ) || undefined
            }
            aria-invalid={!!errorMessage}
            {...props}
          />
        </motion.div>
        {helpText && !errorMessage && (
          <p id={helpTextId} className="text-xs text-charcoal-500">
            {helpText}
          </p>
        )}
        {errorMessage && (
          <motion.p 
            id={errorId} 
            className="text-xs text-red-600"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
          >
            {errorMessage}
          </motion.p>
        )}
      </div>
    )
  }
)
TextArea.displayName = "TextArea"

export { Input, TextArea, inputVariants }
