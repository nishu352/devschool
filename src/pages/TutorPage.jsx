import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { t } from '../data/i18n'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function TutorPage() {
  const { state } = useApp()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Ask anything about coding and web development.')
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!question.trim()) return
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, language: state.language }),
      })
      const data = await response.json()
      setAnswer(data.answer)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">AI Tutor</h2>
      <p className="text-base text-slate-600 dark:text-slate-300">Ask for explanations, debugging help, examples, and project ideas.</p>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Explain closures. Why is my code not working? Give examples. Create a project idea."
        className="w-full rounded-2xl border border-slate-300 p-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
      />
      <button
        onClick={ask}
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
      >
        {loading ? t(state.language, 'thinking') : t(state.language, 'askTutor')}
      </button>
      <div className="rounded-2xl bg-slate-100 p-4 text-sm dark:bg-slate-800">{answer}</div>
    </section>
  )
}
