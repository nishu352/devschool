import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import GlassCard from '../components/dashboard/GlassCard'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function AssessmentHistoryPage() {
  const { state } = useApp()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const userId = state.user.id || ''
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    fetch(`${API_BASE}/api/assessment/history?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.ok) {
          throw new Error(data.error || 'Unable to load assessment history')
        }
        setHistory(Array.isArray(data.history) ? data.history : [])
        setSummary(data.summary || null)
      })
      .catch((fetchError) => {
        console.warn('Assessment history fetch failed:', fetchError)
        setError('Unable to load assessment history from server. Showing local history instead.')
      })
      .finally(() => setLoading(false))
  }, [state.user.id])

  const fallbackHistory = state.assessmentHistory || []
  const effectiveHistory = history.length ? history : fallbackHistory

  const effectiveSummary = useMemo(() => {
    if (summary) return summary
    const count = effectiveHistory.length
    const averageScore = count
      ? Math.round(effectiveHistory.reduce((sum, item) => sum + Number(item.score || 0), 0) / count)
      : 0
    const passRate = count
      ? Math.round((effectiveHistory.filter((item) => item.passed).length / count) * 100)
      : 0
    const lastAssessment = effectiveHistory[0] || null
    return {
      count,
      averageScore,
      passRate,
      lastAssessment,
    }
  }, [effectiveHistory, summary])

  return (
    <section className="space-y-5 pb-20 md:pb-4">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Assessment History</h1>
        <p className="max-w-2xl text-sm text-slate-300">
          Review your synced assessment history, progress reports, and recent scores.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <GlassCard>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Assessments</p>
                <p className="mt-2 text-3xl font-semibold text-white">{effectiveSummary.count}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Average Score</p>
                <p className="mt-2 text-3xl font-semibold text-white">{effectiveSummary.averageScore}%</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Pass Rate</p>
                <p className="mt-2 text-3xl font-semibold text-white">{effectiveSummary.passRate}%</p>
              </div>
            </div>
          </GlassCard>

          {error ? (
            <GlassCard>
              <p className="text-sm text-amber-200">{error}</p>
            </GlassCard>
          ) : null}

          <GlassCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-400">Recent Assessments</p>
                <p className="mt-2 text-xs text-slate-400">Latest results are synced with the database.</p>
              </div>
              {loading ? <span className="text-xs text-slate-400">Loading…</span> : null}
            </div>
            {effectiveHistory.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No assessment records are available yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {effectiveHistory.slice(0, 10).map((item, index) => (
                  <div key={item.id || `${item.course_id}-${index}-${item.submitted_at}`} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{String(item.course_id || item.courseId || 'Course').toUpperCase()} Assessment</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'Unknown date'}
                        </p>
                      </div>
                      <div className="space-y-1 text-right">
                        <p className="text-sm font-semibold text-white">{Number(item.score || item.score || 0)}%</p>
                        <p className="text-xs text-slate-400">{item.passed ? 'Passed' : 'Failed'}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <span className="rounded-2xl bg-slate-900/70 px-3 py-2 text-xs text-slate-300">Violations: {Number(item.violations || 0)}</span>
                      <span className="rounded-2xl bg-slate-900/70 px-3 py-2 text-xs text-slate-300">Deductions: {Number(item.deductions || 0)}</span>
                      <span className="rounded-2xl bg-slate-900/70 px-3 py-2 text-xs text-slate-300">Duration: {Number(item.duration_seconds || item.durationSeconds || 0)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        <aside className="space-y-4">
          <GlassCard>
            <p className="text-xs uppercase tracking-wide text-slate-400">Data Sync</p>
            <p className="mt-3 text-sm text-slate-300">
              Assessment history is kept in your database and reflected in dashboard reports.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              If you sign in with Supabase, your history syncs across devices.
            </p>
          </GlassCard>

          <GlassCard>
            <p className="text-xs uppercase tracking-wide text-slate-400">Latest Score</p>
            <p className="mt-2 text-3xl font-semibold text-white">{effectiveSummary.lastAssessment?.score ?? '—'}%</p>
            <p className="mt-2 text-sm text-slate-400">
              {effectiveSummary.lastAssessment?.passed ? 'Passed' : 'Not passed'} {effectiveSummary.lastAssessment?.submittedAt ? `on ${new Date(effectiveSummary.lastAssessment.submittedAt).toLocaleDateString()}` : ''}
            </p>
          </GlassCard>
        </aside>
      </div>
    </section>
  )
}
