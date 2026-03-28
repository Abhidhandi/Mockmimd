'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function InterviewContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const sessionId = searchParams.get('session')
    const role = searchParams.get('role')

    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState('')
    const [loading, setLoading] = useState(false)
    const [questionCount, setQuestionCount] = useState(0)
    const [currentQuestionId, setCurrentQuestionId] = useState('')

    const fetchQuestion = useCallback(async () => {
        setLoading(true)
        setFeedback('')
        setAnswer('')

        const res = await fetch('/api/question', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, questionCount })
        })

        if (!res.ok) {
            const text = await res.text()
            console.error('API error:', text)
            setLoading(false)
            return
        }

        const data = await res.json()
        setQuestion(data.question)

        const { data: q } = await supabase
            .from('questions')
            .insert({ session_id: sessionId, question: data.question })
            .select()
            .single()

        if (q) setCurrentQuestionId(q.id)
        setLoading(false)
    }, [role, questionCount, sessionId])

    useEffect(() => {
        fetchQuestion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const submitAnswer = async () => {
        if (!answer.trim()) return
        setLoading(true)

        const res = await fetch('/api/question/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, question, answer })
        })
        const data = await res.json()
        setFeedback(data.feedback)

        await supabase
            .from('questions')
            .update({ answer, feedback: data.feedback, score: data.score })
            .eq('id', currentQuestionId)

        setQuestionCount(prev => prev + 1)
        setLoading(false)
    }

    const endInterview = () => router.push('/dashboard')

    return (
        <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl font-bold">MockMind</h1>
                <span className="text-gray-400">Question {questionCount + 1} • {role}</span>
            </div>

            {loading && !question ? (
                <p className="text-gray-400">Generating question...</p>
            ) : (
                <div className="space-y-6">
                    <div className="bg-gray-900 rounded-lg p-5">
                        <p className="text-lg">{question}</p>
                    </div>

                    {!feedback ? (
                        <div className="space-y-4">
                            <textarea
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Type your answer here..."
                                rows={5}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white resize-none"
                            />
                            <button
                                onClick={submitAnswer}
                                disabled={loading || !answer.trim()}
                                className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
                            >
                                {loading ? 'Evaluating...' : 'Submit Answer'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gray-900 border border-gray-700 rounded-lg p-5">
                                <h3 className="text-gray-400 text-sm mb-2">Feedback</h3>
                                <p>{feedback}</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={fetchQuestion}
                                    className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                                >
                                    Next Question
                                </button>
                                <button
                                    onClick={endInterview}
                                    className="flex-1 border border-gray-700 text-white py-3 rounded-lg font-medium hover:border-white transition"
                                >
                                    End Interview
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function InterviewPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <InterviewContent />
        </Suspense>
    )
}