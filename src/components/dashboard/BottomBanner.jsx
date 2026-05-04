import GlassCard from './GlassCard'

export default function BottomBanner() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-wide text-orange-300">Growth Zone</p>
          <h3 className="mt-1 text-2xl font-bold text-white">Learn More, Earn More</h3>
          <p className="mt-2 text-sm text-slate-300">
            Complete strict sessions and assessments to unlock premium rewards and future INR redemption.
          </p>
        </div>
        <div className="h-24 w-full rounded-2xl border border-dashed border-white/20 bg-linear-to-br from-violet-500/20 via-blue-500/20 to-orange-500/20 md:w-60">
          <div className="flex h-full items-center justify-center text-xs text-slate-300">Illustration Placeholder</div>
        </div>
      </div>
    </GlassCard>
  )
}
