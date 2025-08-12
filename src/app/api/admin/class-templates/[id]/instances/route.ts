import { NextResponse } from 'next/server'
import { createClassInstance } from '@/lib/actions/class.actions'

export async function POST(req: Request, context: unknown) {
  try {
    const body = await req.json()
  const templateId = (context as { params?: { id?: string } })?.params?.id || ''
    const date = body.date as string
    if (!date) {
      return NextResponse.json({ success: false, error: 'Missing date' }, { status: 400 })
    }

    const result = await createClassInstance({ templateId, date })
    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (e) {
    console.error('Error creating class instance via API:', e)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
