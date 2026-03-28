'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
    const router = useRouter()
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) router.push('/auth')
        }
        checkUser()
    }, [router])

    const startInterview = async () => {
        if (!role.trim()) return
        setLoading(true)

        const { data: { session } } = await supabase.auth.getSession()
        console.log('session user:', session?.user?.id)

        const { data, error } = await supabase
            .from('sessions')
            .insert({ role, user_id: session?.user.id })
            .select()
            .single()

        console.log('insert result:', data, error)

        if (error) {
            console.error('Supabase error:', error)
            setLoading(false)
            return
        }
        router.push(`/interview?session=${data.id}&role=${encodeURIComponent(role)}`)
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center space-y-6 w-full max-w-md px-4">
                <h1 className="text-3xl font-bold text-white">What role are you preparing for?</h1>
                <input
                    type="text"
                    placeholder="e.g. Frontend Engineer, Product Manager"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white"
                />
                <button
                    onClick={startInterview}
                    disabled={loading || !role.trim()}
                    className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition disabled:opacity-50"
                >
                    {loading ? 'Starting...' : 'Start Interview'}
                </button>
            </div>
        </div>
    )
}