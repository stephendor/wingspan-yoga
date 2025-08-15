'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-soft text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-softgreen-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-softgreen-600 text-white hover:bg-softgreen-700 active:bg-softgreen-800 focus:ring-2 focus:ring-softgreen-500 focus:ring-offset-2",
        secondary: "bg-softblue-500 text-white hover:bg-softblue-600 active:bg-softblue-700 focus:ring-2 focus:ring-softblue-400 focus:ring-offset-2",
        outline: "border border-softgreen-500 text-softgreen-600 hover:bg-softgreen-50 active:bg-softgreen-100",
        ghost: "text-softgreen-600 hover:bg-softgreen-50 active:bg-softgreen-100",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        terracotta: "bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        className={clsx(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
