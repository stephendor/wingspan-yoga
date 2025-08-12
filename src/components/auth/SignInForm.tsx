'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'
// OAuth imports temporarily commented out - can be enabled later when needed
// import { useEffect } from 'react'
// import { getProviders, type ClientSafeProvider } from 'next-auth/react'
// import { Chrome, Facebook, Twitter, Instagram } from 'lucide-react'

function SignInFormContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  // OAuth state temporarily commented out - can be enabled later when needed
  // const [availableProviders, setAvailableProviders] = useState<Record<string, ClientSafeProvider> | null>(null)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  // OAuth provider fetching temporarily commented out - can be enabled later when needed
  /*
  useEffect(() => {
    // Fetch configured providers so we only show enabled social buttons
    getProviders().then((prov) => setAvailableProviders(prov)).catch(() => setAvailableProviders(null))
  }, [])
  */

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setIsLoading(false)
      } else if (result?.url) {
        // Successful sign-in, NextAuth will handle the redirect
        window.location.href = result.url
      }
    } catch {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  // OAuth social sign-in handler temporarily commented out - can be enabled later when needed
  /*
  const handleSocialSignIn = (provider: string) => {
    setIsLoading(true)
    signIn(provider, { callbackUrl }).catch(() => {
      setError('Failed to sign in with ' + provider)
      setIsLoading(false)
    })
  }
  */

  const handleSubmitWrapper = (e: React.FormEvent) => {
    void handleSubmit(e)
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Sign In to Wingspan Yoga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmitWrapper} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              required
              errorMessage={error && !email ? 'Email is required' : undefined}
              autoFocus
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              required
              errorMessage={error && !password ? 'Password is required' : undefined}
            />
            <div className="flex items-center justify-between -mt-2">
              <label className="flex items-center gap-2 text-xs text-charcoal-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="h-4 w-4"
                />
                Show password
              </label>
            </div>
            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* OAuth section temporarily commented out - can be enabled later when needed
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-charcoal-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-charcoal-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {availableProviders?.google && (
              <Button
                variant="outline"
                onClick={() => { handleSocialSignIn('google') }}
                className="w-full"
              >
                <Chrome className="h-4 w-4 mr-2" />
                Google
              </Button>
            )}
            {availableProviders?.facebook && (
              <Button
                variant="outline"
                onClick={() => { handleSocialSignIn('facebook') }}
                className="w-full"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
            )}
            {availableProviders?.twitter && (
              <Button
                variant="outline"
                onClick={() => { handleSocialSignIn('twitter') }}
                className="w-full"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
            )}
            {availableProviders?.instagram && (
              <Button
                variant="outline"
                onClick={() => { handleSocialSignIn('instagram') }}
                className="w-full"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
            )}
          </div>
          */}
        </CardContent>
        <CardFooter className="text-center">
          <p className="text-sm text-charcoal-600">
            Don&apos;t have an account?{' '}
            <a href="/auth/register" className="text-sage-600 hover:text-sage-700 font-medium">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export function SignInForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-ocean-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="py-12 text-center">
            <div className="animate-pulse">Loading sign in form...</div>
          </CardContent>
        </Card>
      </div>
    }>
      <SignInFormContent />
    </Suspense>
  )
}