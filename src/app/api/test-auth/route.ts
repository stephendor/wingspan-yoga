import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    console.log('Test auth endpoint called with:', { email })
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        avatar: true,
        membershipType: true,
      },
    })

    console.log('User found:', !!user)

    if (!user || !user.password) {
      console.log('User not found or no password')
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('Password valid:', isPasswordValid)
    
    if (!isPasswordValid) {
      console.log('Invalid password')
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const returnUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.avatar,
      membershipType: user.membershipType,
    }
    
    console.log('Returning user:', returnUser)
    return NextResponse.json({ user: returnUser })
  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
