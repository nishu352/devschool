import { ArrowRight } from 'lucide-react'
import GlassCard from './GlassCard'
import ProgressBar from './ProgressBar'

export default function CourseCard({
  title,
  progress,
  gradient,
  description = 'Open the next lesson in this path.',
  actionLabel = 'Open course',
  onOpen,
}) {
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        <span className="rounded-full border border-slate-300/80 px-2 py-1 text-xs text-slate-600 dark:border-white/20 dark:text-slate-200">
          Active
        </span>
      </div>
      <ProgressBar value={progress} gradient={gradient} />
      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300">
        <span>{actionLabel}</span>
        <ArrowRight size={16} />
      </div>
    </>
  )

  if (onOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="glass-card interactive-card h-full w-full rounded-2xl p-4 text-left"
      >
        {body}
      </button>
    )
  }

  return <GlassCard>{body}</GlassCard>
}
