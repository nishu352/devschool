import { useApp } from '../context/AppContext'

export default function ProfilePage() {
  const { state, stats } = useApp()

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Profile</h2>
      <p className="text-base text-slate-600 dark:text-slate-300">Track progress, streak, quiz performance, and skill growth.</p>

      <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h3 className="text-lg font-semibold">{state.user.name}</h3>
        {state.user.email ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{state.user.email}</p>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">Offline learner on this device</p>
        )}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Metric title="Completed chapters" value={`${stats.completedChapterCount}/${stats.totalChapters}`} />
          <Metric title="Skill percentage" value={`${stats.skillPercentage}%`} />
          <Metric title="Quiz average" value={`${stats.quizAverage}%`} />
          <Metric title="Practice streak" value={`${state.streak} days`} />
          <Metric title="Completed projects" value={`${state.completedProjects.length}`} />
          <Metric title="Study hours" value={`${state.studyHours} hrs`} />
        </div>
      </article>
    </section>
  )
}

function Metric({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}
