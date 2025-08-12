import { Suspense } from 'react'
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-heading font-bold text-charcoal-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-charcoal-600">
            Continue your yoga journey with us
          </p>
        </div>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
