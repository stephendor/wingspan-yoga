'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/**
 * This component provides a simple way to bypass authentication in E2E tests.
 * It should only be accessible in development and test environments.
 */
export default function E2ETestPage() {
  const router = useRouter()
  const [testKey, setTestKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationStatus, setValidationStatus] = useState<string | null>(null)

  // Check if we are in a test or development environment
  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const res = await fetch('/api/e2e-test/check-environment')
        const data = await res.json()
        if (!data.success) {
          setValidationStatus('This page is only available in test and development environments')
        }
      } catch {
        setValidationStatus('Error checking environment')
      }
    }
    
    checkEnvironment()
  }, [])

  const handleBypass = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/e2e-test/bypass-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: testKey }),
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to homepage after successful bypass
        router.push('/')
      } else {
        setError(data.error || 'Invalid test key')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (validationStatus) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{validationStatus}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>E2E Test Authentication Bypass</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleBypass} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="test-key" className="text-sm font-medium text-gray-700">Test Key</label>
              <Input
                id="test-key"
                type="password"
                placeholder="Enter test key"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Authenticate for Testing'}
            </Button>
            
            <p className="text-xs text-gray-500 mt-2">
              This page is for E2E testing only. Use this to bypass authentication in test environments.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
