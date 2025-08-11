import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('=== TESTING NEXTAUTH DIRECT ===')
    
    // Import NextAuth and our config directly
    const NextAuth = (await import('next-auth')).default
    const { authOptions } = await import('@/lib/auth/nextauth')
    
    console.log('Auth options loaded:', {
      providersCount: authOptions.providers?.length,
      firstProvider: authOptions.providers?.[0]?.id,
      firstProviderType: authOptions.providers?.[0]?.type
    })
    
    // Try to create a NextAuth handler
    NextAuth(authOptions)
    console.log('Handler created successfully')
    
    return NextResponse.json({ 
      success: true,
      providersCount: authOptions.providers?.length,
      providers: authOptions.providers?.map(p => ({ id: p.id, name: p.name, type: p.type }))
    })
  } catch (error) {
    console.error('Error testing NextAuth:', error)
    return NextResponse.json({ 
      error: String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
