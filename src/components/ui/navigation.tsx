 'use client'

import * as React from 'react'
import { clsx } from 'clsx'
import { Menu, X, User, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

export interface NavigationProps {
  className?: string
  items: NavItem[]
  logo?: React.ReactNode
}

const Navigation = ({ 
  className, 
  items, 
  logo
}: NavigationProps) => {
  const { data: session } = useSession()
  const user = session?.user ? {
    name: session.user.name || 'User',
    email: session.user.email || '',
  } : null
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false)

  // Close mobile menu when window resizes
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Close menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsUserMenuOpen(false)
    }

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isUserMenuOpen])

  return (
    <nav className={clsx("bg-white border-b border-softgreen-400 shadow-soft", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              {logo || (
                <span className="text-xl font-playfair font-bold text-charcoal-800">
                  Wingspan Yoga
                </span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-1 text-charcoal-600 hover:text-softgreen-600 px-3 py-2 rounded-soft text-sm font-medium transition-colors font-lato"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu / Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsUserMenuOpen(!isUserMenuOpen)
                  }}
                  className="flex items-center space-x-2 text-charcoal-600 hover:text-softgreen-600 px-3 py-2 rounded-soft text-sm font-medium transition-colors font-lato"
                >
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-natural shadow-zen border border-softgreen-400 py-1 z-50">
                      <div className="px-4 py-2 border-b border-softgreen-200">
                        <p className="text-sm font-medium text-charcoal-900 font-lato">{user.name}</p>
                        <p className="text-xs text-charcoal-600 font-lato">{user.email}</p>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-charcoal-600 hover:bg-softgreen-50 hover:text-charcoal-900 transition-colors font-lato"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/signin"
                  className="text-charcoal-600 hover:text-softgreen-600 px-3 py-2 rounded-soft text-sm font-medium transition-colors font-lato"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-softgreen-500 hover:bg-softgreen-600 text-white px-4 py-2 rounded-soft text-sm font-medium transition-colors font-lato"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen)
              }}
              className="text-charcoal-600 hover:text-softgreen-600 p-2"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-softgreen-400 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-charcoal-600 hover:text-softgreen-600 hover:bg-softgreen-50 px-3 py-2 rounded-soft text-base font-medium transition-colors font-lato"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              
              {/* Mobile User Menu */}
              {user ? (
                <div className="border-t border-softgreen-400 pt-4 mt-4">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-charcoal-900 font-lato">{user.name}</p>
                    <p className="text-xs text-charcoal-600 font-lato">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      void signOut({ callbackUrl: '/' })
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex w-full items-center space-x-2 text-charcoal-600 hover:text-softgreen-600 hover:bg-softgreen-50 px-3 py-2 rounded-soft text-base font-medium transition-colors font-lato"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-softgreen-400 pt-4 mt-4 space-y-1">
                  <Link
                    href="/auth/signin"
                    className="block text-charcoal-600 hover:text-softgreen-600 hover:bg-softgreen-50 px-3 py-2 rounded-soft text-base font-medium transition-colors font-lato"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block bg-softgreen-500 hover:bg-softgreen-600 text-white px-3 py-2 rounded-soft text-base font-medium transition-colors font-lato"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
        </div>
      )}
    </nav>
  )
}

Navigation.displayName = "Navigation"

export { Navigation }
