import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth/nextauth'

export async function GET(req: NextRequest) {
  console.log('Testing authOptions configuration')
  console.log('Providers count:', authOptions.providers.length)
  console.log('First provider:', authOptions.providers[0])
  
  return NextResponse.json({
    providersCount: authOptions.providers.length,
    firstProvider: authOptions.providers[0],
  })
}
