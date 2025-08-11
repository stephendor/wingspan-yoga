import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth/nextauth'

console.log('NextAuth route handler loaded')

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
