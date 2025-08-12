import { NextResponse } from 'next/server'

// This route handler checks if we're in a test or development environment
export async function GET() {
  const isDev = process.env.NODE_ENV === 'development'
  const isTest = process.env.NODE_ENV === 'test' || process.env.E2E_TEST === 'true'

  if (isDev || isTest) {
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json(
      { success: false, error: 'Only available in test or development environment' },
      { status: 403 }
    )
  }
}
