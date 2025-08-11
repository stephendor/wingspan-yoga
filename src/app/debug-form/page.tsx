'use client'

import { useState } from 'react'

export default function DebugForm() {
  const [result, setResult] = useState('')

  const testDirectCall = async () => {
    try {
      console.log('Making direct call to credentials callback...')
      
      // First get CSRF token
      const csrfResponse = await fetch('/api/auth/csrf')
      const csrfData = await csrfResponse.json()
      console.log('CSRF data:', csrfData)

      // Make direct POST to credentials callback
      const formData = new FormData()
      formData.append('email', 'admin@example.com')
      formData.append('password', 'password123')
      formData.append('csrfToken', csrfData.csrfToken)
      formData.append('callbackUrl', '/admin/classes')
      formData.append('json', 'true')

      console.log('FormData entries:')
      for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`)
      }

      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        body: formData,
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', [...response.headers.entries()])
      
      const responseText = await response.text()
      console.log('Response body:', responseText)
      
      setResult(JSON.stringify({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      }, null, 2))

    } catch (error) {
      console.error('Error:', error)
      setResult(JSON.stringify({ error: String(error) }, null, 2))
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Authentication Form</h1>
      
      <button 
        onClick={testDirectCall}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Test Direct Credentials Call
      </button>

      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {result}
      </pre>
    </div>
  )
}
