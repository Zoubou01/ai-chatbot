import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Define types for our messages
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
})

export async function POST(req: Request) {
  try {
    // Validate request body
    const body = await req.json()
    const messages = body.messages as ChatMessage[]

    if (!Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages must be an array' },
        { status: 400 }
      )
    }

    // Validate each message
    const isValidMessage = messages.every(
      msg => 
        typeof msg === 'object' &&
        (msg.role === 'user' || msg.role === 'assistant') &&
        typeof msg.content === 'string'
    )

    if (!isValidMessage) {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Make API request with retry logic
    let attempts = 0
    const maxAttempts = 3
    
    while (attempts < maxAttempts) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages,
          temperature: 0.7,
          max_tokens: 500
        })

        return NextResponse.json({
          message: response.choices[0].message.content
        })

      } catch (error: any|unknown) {
        attempts++
        
        // Handle specific error cases
        if (error.status === 429) {
          if (attempts === maxAttempts) {
            return NextResponse.json({
              error: 'Rate limit exceeded. Please try again later.'
            }, { status: 429 })
          }
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, attempts * 1000))
          continue
        }

        if (error.code === 'insufficient_quota') {
          return NextResponse.json({
            error: 'API quota exceeded. Please check your OpenAI account.'
          }, { status: 429 })
        }

        // For other errors, throw immediately
        throw error
      }
    }

    // If we get here, all attempts failed
    return NextResponse.json({
      error: 'Failed to get response from OpenAI'
    }, { status: 500 })

  } catch (error: any|unknown) {
    console.error('Error processing request:', error)
    return NextResponse.json({
      error: 'An unexpected error occurred'
    }, { status: 500 })
  }
}