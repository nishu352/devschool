import GlassCard from './GlassCard'
import ProgressBar from './ProgressBar'

export default function CourseCard({ title, progress, gradient }) {
  return (
    <GlassCard>
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-white">{title}</h4>
        <span className="rounded-full border border-white/20 px-2 py-1 text-xs text-slate-200">Active</span>
      </div>
      <ProgressBar value={progress} gradient={gradient} />
    </GlassCard>
  )
}
