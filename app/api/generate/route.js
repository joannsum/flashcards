import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const MODEL_NAME = "gemini-1.5-flash"

const systemPrompt = `
You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`

export async function POST(req) {
  try {
    if (!API_KEY) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set')
    }

    const genAI = new GoogleGenerativeAI(API_KEY)
    const model = genAI.getGenerativeModel({ model: MODEL_NAME })

    const data = await req.text()

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: data }
    ])

    const response = result.response
    const text = response.text()

    // Parse the JSON response from the Gemini API
    const flashcards = JSON.parse(text)

    // Return the flashcards as a JSON response
    return NextResponse.json(flashcards.flashcards)
  } catch (error) {
    console.error('Error in generate API:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}