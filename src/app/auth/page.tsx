'use client'

import { supabase } from '@/lib/supabase'

export default function AuthPage() {
    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`
            }
        })
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-bold text-white">MockMind</h1>
                <p className="text-gray-400">AI-powered mock interviews</p>
                <button
                    onClick={handleGoogleLogin}
                    className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
                >
                    Continue with Google
                </button>
            </div>
        </div>
    )
}