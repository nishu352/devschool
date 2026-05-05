import { ArrowRight } from 'lucide-react'
import GlassCard from './GlassCard'

export default function RightRail({ assessments, achievements, onAssessmentSelect, onAchievementSelect }) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Assessments</h3>
        <ul className="mt-3 space-y-3">
          {assessments.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onAssessmentSelect?.(item)}
                className="interactive-card w-full rounded-xl border border-slate-200/80 bg-white/60 p-3 text-left transition hover:border-blue-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-400/50"
              >
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-300">
                    <span>Open</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Achievements</h3>
        <ul className="mt-3 space-y-3">
          {achievements.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onAchievementSelect?.(item)}
                className="interactive-card w-full rounded-xl border border-slate-200/80 bg-white/60 p-3 text-left transition hover:border-violet-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:border-violet-400/50"
              >
                <p className="text-sm font-medium text-violet-700 dark:text-violet-200">{item.title}</p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                    <span>View</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  )
}
