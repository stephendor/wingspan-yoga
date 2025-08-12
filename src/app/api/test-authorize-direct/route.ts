import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('=== MANUAL AUTHORIZE TEST ===')
    
    const { authOptions } = await import('@/lib/auth/nextauth')
    
    // Get the credentials provider
    const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials')
    console.log('Found credentials provider:', !!credentialsProvider)
    
    if (credentialsProvider && 'authorize' in credentialsProvider) {
      console.log('Provider has authorize function')
      
      // Try to call authorize directly
  const result = await credentialsProvider.authorize({
        email: 'admin@example.com',
        password: 'password123'
  }, {} as unknown as Record<string, unknown>)
      
      console.log('Direct authorize result:', result)
      
      return NextResponse.json({ 
        success: true,
        result,
        message: 'Authorize function called directly'
      })
    } else {
      return NextResponse.json({ 
        error: 'No authorize function found'
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error in manual authorize test:', error)
    return NextResponse.json({ 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
