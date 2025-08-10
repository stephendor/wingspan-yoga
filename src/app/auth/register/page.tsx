import { SignUpForm } from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-warm-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-heading font-bold text-charcoal-900">
            Start Your Journey
          </h2>
          <p className="mt-2 text-sm text-charcoal-600">
            Join our community of mindful practitioners
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}
