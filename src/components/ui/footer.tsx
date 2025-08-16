'use client'

import Link from 'next/link'
import { clsx } from 'clsx'

export interface FooterProps {
  className?: string
}

const Footer = ({ className }: FooterProps) => {
  const currentYear = new Date().getFullYear()

  const navigationLinks = [
    { label: 'Home', href: '/' },
    { label: 'Meet Anna', href: '/instructor' },
    { label: 'Classes', href: '/classes' },
    { label: 'Membership', href: '/membership' },
    { label: 'Retreats', href: '/retreats' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ]

  const socialLinks = [
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
    { label: 'Email', href: 'mailto:anna@wingspan-yoga.com', icon: 'email' },
  ]

  return (
    <footer className={clsx("bg-softgreen-300 border-t border-softgreen-400", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <span className="text-2xl font-playfair font-bold text-charcoal-800">
                Wingspan Yoga
              </span>
            </Link>
            <p className="text-charcoal-700 mb-4 max-w-md font-lato">
              Yoga inspired by nature&apos;s rhythm, for body, mind, and spirit. 
              Join Anna Dorman for trauma-informed, alignment-focused yoga classes.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-charcoal-600 hover:text-softgreen-700 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon === 'instagram' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.988-5.367 11.988-11.988C24.005 5.367 18.638.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.229 14.894 3.74 13.743 3.74 12.446s.49-2.448 1.297-3.323C5.934 8.247 7.085 7.758 8.382 7.758s2.448.49 3.323 1.297c.897.897 1.386 2.048 1.386 3.345s-.49 2.448-1.297 3.323c-.897.897-2.048 1.386-3.345 1.386zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.897-1.386-2.048-1.386-3.345s.49-2.448 1.297-3.323c.897-.897 2.048-1.386 3.345-1.386s2.448.49 3.323 1.297c.897.897 1.386 2.048 1.386 3.345s-.49 2.448-1.297 3.323c-.897.897-2.048 1.386-3.345 1.386z" clipRule="evenodd" />
                    </svg>
                  )}
                  {social.icon === 'facebook' && (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  )}
                  {social.icon === 'email' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-playfair font-semibold text-charcoal-800 mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-charcoal-600 hover:text-softgreen-700 transition-colors font-lato"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-playfair font-semibold text-charcoal-800 mb-4">Contact</h3>
            <div className="space-y-2 text-charcoal-600 font-lato">
              <p>
                <a href="mailto:anna@wingspan-yoga.com" className="hover:text-softgreen-700 transition-colors">
                  anna@wingspan-yoga.com
                </a>
              </p>
              <p>North Wales, UK</p>
              <p>London, UK</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-softgreen-400">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-charcoal-600 text-sm font-lato">
              © {currentYear} Wingspan Yoga. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="/privacy"
                className="text-charcoal-600 hover:text-softgreen-700 text-sm transition-colors font-lato"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-charcoal-600 hover:text-softgreen-700 text-sm transition-colors font-lato"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

Footer.displayName = "Footer"

export { Footer }
