import { useEffect, useMemo, useState } from 'react'
import BottomBanner from '../components/dashboard/BottomBanner'
import CourseCard from '../components/dashboard/CourseCard'
import GlassCard from '../components/dashboard/GlassCard'
import ProgressBar from '../components/dashboard/ProgressBar'
import RightRail from '../components/dashboard/RightRail'
import StatCard from '../components/dashboard/StatCard'
import TopNavbar from '../components/dashboard/TopNavbar'
import { useApp } from '../context/AppContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function HomePage() {
  const { state, stats } = useApp()
  const [dashboardData, setDashboardData] = useState(null)

  const accuracy = useMemo(() => {
    const values = Object.values(state.quizScores || {})
    if (values.length === 0) return 0
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
  }, [state.quizScores])

  useEffect(() => {
    const userId = state.user.id || ''
    const params = new URLSearchParams({
      userId,
      name: state.user.name || 'Learner',
      studyPoints: String(state.studyPoints || 0),
      streak: String(state.streak || 0),
      accuracy: String(accuracy),
      completedChapters: String(stats.completedChapterCount || 0),
      xp: String(state.xp || 0),
    })
    const syncBody = {
      userId,
      name: state.user.name || 'Learner',
      studyPoints: state.studyPoints || 0,
      streak: state.streak || 0,
      accuracy,
      completedChapters: stats.completedChapterCount || 0,
      xp: state.xp || 0,
    }
    fetch(`${API_BASE}/api/dashboard/overview/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncBody),
    })
      .catch(() => null)
      .finally(() => {
        fetch(`${API_BASE}/api/dashboard/overview?${params.toString()}`)
          .then((res) => res.json())
          .then((json) => setDashboardData(json))
          .catch(() => setDashboardData(null))
      })
  }, [state.user.id, state.user.name, state.studyPoints, state.streak, state.xp, stats.completedChapterCount, accuracy])

  if (!dashboardData) {
    return (
      <section className="space-y-5 pb-20 md:pb-4">
        <TopNavbar title="Learn & Earn — Build Skills, Bright Your Future" menu={['Learn', 'Practice', 'Assess']} />
        <GlassCard>
          <p className="text-sm text-slate-300">Loading live dashboard data...</p>
        </GlassCard>
      </section>
    )
  }

  return (
    <section className="space-y-5 pb-20 md:pb-4">
      <TopNavbar
        title="Learn & Earn — Build Skills, Bright Your Future"
        menu={dashboardData.topMenu}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <header>
            <h2 className="text-3xl font-bold text-white">Welcome back, {dashboardData.profile.name} 👋</h2>
            <p className="text-sm text-slate-300">Focused today, rewarded tomorrow. Keep your streak alive.</p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardData.stats.map((stat) => (
              <StatCard key={stat.id} label={stat.label} value={stat.value} delta={stat.delta} />
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GlassCard>
              <p className="text-xs uppercase tracking-wide text-slate-400">Continue Learning</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{dashboardData.continueLearning.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{dashboardData.continueLearning.subtitle}</p>
              <ProgressBar value={dashboardData.continueLearning.progress} gradient="from-blue-500 to-violet-500" />
              <button
                type="button"
                className="mt-3 rounded-xl bg-linear-to-r from-violet-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Continue
              </button>
            </GlassCard>

            <GlassCard>
              <p className="text-xs uppercase tracking-wide text-slate-400">Today&apos;s Challenge</p>
              <h3 className="mt-1 text-xl font-semibold text-white">{dashboardData.challenge.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{dashboardData.challenge.subtitle}</p>
              <button
                type="button"
                className="mt-6 rounded-xl bg-linear-to-r from-orange-500 to-amber-400 px-4 py-2 text-sm font-semibold text-black"
              >
                Start Challenge
              </button>
            </GlassCard>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">Courses</h3>
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {dashboardData.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  title={course.title}
                  progress={course.progress}
                  gradient={course.gradient}
                />
              ))}
            </div>
          </div>

          <BottomBanner />
        </div>

        <RightRail
          assessments={dashboardData.upcomingAssessments}
          achievements={dashboardData.achievements}
        />
      </div>
    </section>
  )
}
