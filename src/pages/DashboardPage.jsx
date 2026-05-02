import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Timer, Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function DashboardPage() {
  const { state, actions } = useApp()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadPlan() {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE}/api/daily-plan`)
        const plan = await response.json()
        actions.refreshDailyPlan(plan)
      } finally {
        setLoading(false)
      }
    }
    loadPlan()
  }, [actions])

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Daily Learning Dashboard</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {loading ? 'Refreshing your daily track...' : 'Your mission for today.'}
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Today Lesson" value={state.dailyPlan.lesson} />
        <Card title="Practice Task" value={state.dailyPlan.exercise} />
        <Card title="Quiz Pending" value={state.dailyPlan.quiz} />
        <Card title="Mini Project" value={state.dailyPlan.miniProject} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat icon={Flame} label="Current Streak" value={`${state.streak} days`} />
        <Stat icon={Trophy} label="Progress" value={`${state.progress}%`} />
        <Stat icon={Timer} label="Study Hours" value={`${state.studyHours} hrs`} />
      </div>

      <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
        <h3 className="font-semibold">Quick Actions</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <QuickButton to="/learn" text="Continue Learning" />
          <QuickButton to="/practice" text="Open Practice Lab" />
          <QuickButton to="/tutor" text="Ask AI Tutor" />
          <QuickButton to="/stats" text="View Stats" />
          <QuickButton to="/settings" text="Set Reminders" />
        </div>
      </div>
    </section>
  )
}

function Card({ title, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </article>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-blue-600 p-4 text-white">
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <p className="text-xs uppercase">{label}</p>
      </div>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  )
}

function QuickButton({ to, text }) {
  return (
    <Link to={to} className="rounded-xl bg-white px-4 py-3 text-center text-sm font-medium dark:bg-slate-900">
      {text}
    </Link>
  )
}
