export default function AuthErrorPage({ searchParams }: { searchParams?: { error?: string } }) {
  const error = searchParams?.error
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-natural shadow-zen border border-charcoal-200 p-6 text-center">
        <h1 className="text-xl font-heading font-bold mb-2">Authentication Error</h1>
        <p className="text-sm text-charcoal-600 mb-6">
          {error ? `Error: ${error}` : 'Something went wrong during sign in.'}
        </p>
        <a href="/auth/signin" className="text-sage-600 hover:text-sage-700 font-medium">
          Back to Sign In
        </a>
      </div>
    </div>
  )
}
