import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { role, question, answer } = await req.json()

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: `You are a senior interviewer evaluating a candidate for a ${role} position. Give concise, honest feedback on their answer. End with a score like "Score: 7/10".`
                },
                {
                    role: 'user',
                    content: `Question: ${question}\n\nAnswer: ${answer}`
                }
            ]
        })

        const feedback = completion.choices[0].message.content ?? ''
        const scoreMatch = feedback.match(/Score:\s*(\d+)\/10/)
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 5

        return NextResponse.json({ feedback, score })

    } catch (error: any) {
        console.error('Groq error:', error?.message)
        return NextResponse.json({ error: 'Failed to generate feedback' }, { status: 500 })
    }
}