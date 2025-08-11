'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui'
import { Github, Chrome } from 'lucide-react'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    console.log('Form submitted with:', { email, password, callbackUrl })

    try {
      // Let NextAuth handle everything - no redirect: false
      console.log('Calling signIn with full NextAuth handling...')
      await signIn('credentials', {
        email,
        password,
        callbackUrl,
        // Remove redirect: false to let NextAuth handle the flow completely
      })
      
      // If we reach here without an error, the redirect should have happened
      console.log('SignIn completed - should have redirected')
      
    } catch (error) {
      console.error('SignIn error:', error)
      setError('Invalid email or password. Please try again.')
      setIsLoading(false)
    }
  }

  const handleSocialSignIn = (provider: string) => {
    console.log('Social sign in with:', provider)
    signIn(provider, { callbackUrl })
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Sign In to Wingspan Yoga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { handleSubmit(e) }} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value) }}
              required
              errorMessage={error && !email ? 'Email is required' : undefined}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value) }}
              required
              errorMessage={error && !password ? 'Password is required' : undefined}
            />
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-charcoal-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-charcoal-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => { handleSocialSignIn('google') }}
              className="w-full"
            >
              <Chrome className="h-4 w-4 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => { handleSocialSignIn('github') }}
              className="w-full"
            >
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
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
