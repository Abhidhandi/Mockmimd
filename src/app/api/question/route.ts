import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { role, questionCount } = await req.json()

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are a senior technical interviewer. Ask interview question number ${questionCount + 1} for a ${role} position. Ask only ONE question. No preamble, just the question.`
                },
                { role: 'user', content: 'Ask me an interview question.' }
            ]
        })

        const question = completion.choices[0].message.content
        return NextResponse.json({ question })

    } catch (error: any) {
        console.error('Groq error:', error?.message)
        return NextResponse.json({ error: 'Failed to generate question' }, { status: 500 })
    }
}