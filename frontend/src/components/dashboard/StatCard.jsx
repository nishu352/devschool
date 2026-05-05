import { ArrowRight } from 'lucide-react'
import GlassCard from './GlassCard'

export default function StatCard({ label, value, delta, onClick, actionLabel = 'View details' }) {
  const body = (
    <>
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-emerald-600 dark:text-emerald-300">{delta}</p>
        {onClick ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
            <span>{actionLabel}</span>
            <ArrowRight size={14} />
          </span>
        ) : null}
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="glass-card interactive-card h-full w-full rounded-2xl p-4 text-left"
      >
        {body}
      </button>
    )
  }

  return <GlassCard>{body}</GlassCard>
}
