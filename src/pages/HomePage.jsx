import { Link } from 'react-router-dom'
import CourseLogo from '../components/CourseLogo'
import { useApp } from '../context/AppContext'
import { popularCourseIds } from '../content/lessonStore'
import { t } from '../data/i18n'

export default function HomePage() {
  const { state, stats, metadata, actions } = useApp()
  const language = state.language
  const categoryList = metadata.categories[language] || metadata.categories.en
  const popular = metadata.courses.filter((course) => popularCourseIds.includes(course.id))

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-3xl font-bold">Welcome, {state.user.name}</h2>
        <p className="text-base text-slate-600 dark:text-slate-300">Continue your daily web development learning journey.</p>
      </header>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Search any topic</span>
        <input
          value={state.searchQuery}
          onChange={(event) => actions.setSearchQuery(event.target.value)}
          placeholder="Try: div, flexbox, array map, useEffect"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card title="Categories" value={categoryList.join(' | ')} />
        <Card title="Continue learning" value={`${stats.completedChapterCount}/${stats.totalChapters} chapters done`} />
        <Card title="Skill percentage" value={`${stats.skillPercentage}%`} />
        <Card title="Practice streak" value={`${state.streak} days`} />
      </div>

      <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold">Daily Challenge</h3>
        <p className="mt-1 text-sm">{state.dailyChallenge.description}</p>
        <button
          onClick={actions.claimDailyChallenge}
          className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Mark Challenge Complete (+streak)
        </button>
      </article>

      <div>
        <h3 className="text-lg font-semibold">Popular Courses</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {popular.map((course) => (
            <Link
              key={course.id}
              to={`/chapter/${course.id}/${course.chapters[0].slug}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold">{course.title[language]}</p>
                <CourseLogo courseId={course.id} size={24} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">{course.description[language]}</p>
            </Link>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-500">{t(language, 'level')}: {state.learningLevel}</p>
    </section>
  )
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  )
}
