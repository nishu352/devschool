import GlassCard from './GlassCard'

export default function RightRail({ assessments, achievements }) {
  return (
    <div className="space-y-4">
      <GlassCard>
        <h3 className="text-sm font-semibold text-white">Upcoming Assessments</h3>
        <ul className="mt-3 space-y-3">
          {assessments.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-medium text-slate-100">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.time}</p>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard>
        <h3 className="text-sm font-semibold text-white">Recent Achievements</h3>
        <ul className="mt-3 space-y-3">
          {achievements.map((item) => (
            <li key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <p className="text-sm font-medium text-violet-200">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  )
}
