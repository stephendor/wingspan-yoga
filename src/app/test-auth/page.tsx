'use client'

import { useEffect } from 'react'
import { signIn } from 'next-auth/react'

export default function TestAuthPage() {
  useEffect(() => {
    const testAuth = async () => {
      console.log('Testing authentication...')
      
      try {
        // First, test direct HTTP request
        console.log('Testing direct HTTP request to credentials callback...')
        
        const csrfResponse = await fetch('/api/auth/csrf')
        const { csrfToken } = await csrfResponse.json()
        console.log('CSRF Token:', csrfToken)
        
        const directResponse = await fetch('/api/auth/callback/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            email: 'admin@example.com',
            password: 'password123',
            csrfToken,
            callbackUrl: '/admin/classes',
          }),
        })
        
        console.log('Direct response status:', directResponse.status)
        const directResult = await directResponse.text()
        console.log('Direct response body:', directResult)
        
        // Now test with signIn function
        console.log('Testing with signIn function...')
        const result = await signIn('credentials', {
          email: 'admin@example.com',
          password: 'password123',
          redirect: false,
        })
        
        console.log('SignIn function result:', result)
      } catch (error) {
        console.error('Test auth error:', error)
      }
    }
    
    // Run the test after a short delay
    setTimeout(testAuth, 1000)
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Testing Authentication</h1>
      <p>Check the browser console for authentication test results.</p>
      <p>This page tests both direct HTTP requests and signIn function.</p>
    </div>
  )
}
