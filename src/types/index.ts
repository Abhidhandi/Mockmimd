export interface User {
  id: string
  email: string
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  role: string
  score: number
  created_at: string
}

export interface Question {
  id: string
  session_id: string
  question: string
  answer: string
  feedback: string
  score: number
}