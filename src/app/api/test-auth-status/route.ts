import { NextResponse } from 'next/server'

export async function GET() {
  console.log('=== TEST AUTH STATUS ===')
  
  try {
    // Test NextAuth providers endpoint
    const providersResponse = await fetch('http://localhost:3000/api/auth/providers')
    const providers = await providersResponse.json()
    console.log('Providers:', providers)
    
    // Test CSRF endpoint
    const csrfResponse = await fetch('http://localhost:3000/api/auth/csrf')
    const csrf = await csrfResponse.json()
    console.log('CSRF:', csrf)
    
    return NextResponse.json({ 
      status: 'ok',
      providers,
      csrf,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
      }
    })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
