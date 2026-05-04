import GlassCard from './GlassCard'

export default function StatCard({ label, value, delta }) {
  return (
    <GlassCard>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-emerald-300">{delta}</p>
    </GlassCard>
  )
}
