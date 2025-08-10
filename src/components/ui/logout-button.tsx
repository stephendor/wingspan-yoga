'use client'

import React from 'react'
import { Button, ButtonProps } from './button'
import { LogOut } from 'lucide-react'
import { handleLogout } from '@/lib/auth/logout'

export interface LogoutButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  children?: React.ReactNode
  showIcon?: boolean
  redirectUrl?: string
  onLogoutStart?: () => void
  onLogoutSuccess?: () => void
  onLogoutError?: (error: Error) => void
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  children,
  showIcon = true,
  redirectUrl = '/',
  onLogoutStart,
  onLogoutSuccess,
  onLogoutError,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}) => {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleClick = async () => {
    try {
      setIsLoggingOut(true)
      onLogoutStart?.()

      const result = await handleLogout({ 
        callbackUrl: redirectUrl,
        redirect: true 
      })

      if (result.success) {
        onLogoutSuccess?.()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Logout failed:', error)
      onLogoutError?.(error instanceof Error ? error : new Error('Logout failed'))
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoggingOut}
      variant={variant}
      size={size}
      className={className}
      {...props}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      <span>{isLoggingOut ? 'Signing out...' : (children || 'Sign Out')}</span>
    </Button>
  )
}

LogoutButton.displayName = 'LogoutButton'
