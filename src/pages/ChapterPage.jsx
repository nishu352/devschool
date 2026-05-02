import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Menu, PanelRightClose, PanelRightOpen, Search } from 'lucide-react'
import CourseLogo from '../components/CourseLogo'
import { useApp } from '../context/AppContext'
import { getAdjacentLessons, getCourseById, getLesson } from '../content/lessonStore'

export default function ChapterPage() {
  const { state, actions } = useApp()
  const { courseId, chapterId } = useParams()
  const course = getCourseById(courseId)
  const lesson = getLesson(courseId, chapterId)
  const adjacent = getAdjacentLessons(courseId, chapterId)
  const language = state.language
  const [query, setQuery] = useState('')
  const [showMobileChapters, setShowMobileChapters] = useState(false)
  const [showMobileNav, setShowMobileNav] = useState(false)
  const [isPanelMinimized, setIsPanelMinimized] = useState(false)

  if (!course || !lesson) return <Navigate to="/courses" replace />

  const doneKey = `${course.id}:${lesson.slug}`
  const isDone = Boolean(state.completedChapters[doneKey])
  const theoryKey = language === 'hi' ? 'hindi' : language
  const theory = lesson.theory?.[theoryKey] || lesson.theory?.english || ''
  const total = course.chapters.length
  const completed = course.chapters.filter((item) => state.completedChapters[`${course.id}:${item.slug}`]).length
  const progressPercent = Math.round((completed / total) * 100)
  const filteredChapters = course.chapters.filter((item) => {
    const text = `${item.chapterNumber}. ${item.title}`.toLowerCase()
    return text.includes(query.trim().toLowerCase())
  })

  return (
    <section
      className={`h-full overflow-hidden md:grid ${
        isPanelMinimized ? 'md:grid-cols-[minmax(0,1fr)_56px]' : 'md:grid-cols-[minmax(0,1fr)_320px]'
      }`}
    >
      <div className="relative flex h-full min-h-0 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-1">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-xs font-medium dark:border-slate-700"
                >
                  <ArrowLeft size={14} />
                  Back
                </Link>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <CourseLogo courseId={course.id} size={16} />
                {course.title[language]} course
              </p>
              <h2 className="truncate text-xl font-bold md:text-2xl">{lesson.title}</h2>
              <p className="text-xs text-slate-500">
                Chapter {lesson.chapterNumber} | {lesson.level} | {lesson.estimatedTime}
              </p>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setShowMobileNav((prev) => !prev)}
                className="rounded-lg border border-slate-300 p-2 dark:border-slate-700"
                aria-label="Toggle navigation drawer"
              >
                <Menu size={16} />
              </button>
              <button
                onClick={() => setShowMobileChapters((prev) => !prev)}
                className="rounded-lg border border-slate-300 p-2 dark:border-slate-700"
                aria-label="Toggle chapters panel"
              >
                {showMobileChapters ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
              </button>
            </div>
            <button
              onClick={() => setIsPanelMinimized((prev) => !prev)}
              className="hidden rounded-lg border border-slate-300 p-2 dark:border-slate-700 md:inline-flex"
              aria-label={isPanelMinimized ? 'Expand chapter panel' : 'Minimize chapter panel'}
              title={isPanelMinimized ? 'Expand panel' : 'Minimize panel'}
            >
              {isPanelMinimized ? <PanelRightOpen size={16} /> : <PanelRightClose size={16} />}
            </button>
          </div>
        </header>

        {showMobileNav ? (
          <div className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/home" className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900">Home</Link>
              <Link to="/courses" className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900">Courses</Link>
              <Link to="/profile" className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900">Profile</Link>
              <Link to="/settings" className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900">Settings</Link>
            </div>
          </div>
        ) : null}

        {showMobileChapters ? (
          <div className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <label className="block">
              <span className="text-xs text-slate-500">Search chapters</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                <Search size={14} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Find chapter..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </label>
            <div className="mt-2 max-h-56 overflow-y-auto space-y-2">
              {filteredChapters.map((item) => {
                const done = Boolean(state.completedChapters[`${course.id}:${item.slug}`])
                const active = item.slug === lesson.slug
                return (
                  <Link
                    key={item.slug}
                    to={`/chapter/${course.id}/${item.slug}`}
                    onClick={() => setShowMobileChapters(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                      active ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="pr-2">{item.chapterNumber}. {item.title}</span>
                    {done ? <CheckCircle2 size={16} className={active ? 'text-white' : 'text-emerald-500'} /> : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-4">
            <ContentCard title="Theory" value={theory} />

            <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold">Examples</h3>
              <div className="mt-2 space-y-3">
                {lesson.examples.map((example) => (
                  <div key={example.title} className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                    <p className="font-medium">{example.title}</p>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-2 text-xs dark:bg-slate-900">
                      <code>{example.code}</code>
                    </pre>
                    <p className="mt-2 text-sm">{example.explanation}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold">Exercises</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {lesson.exercises.map((exercise) => (
                  <li key={exercise.prompt} className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                    <p>{exercise.prompt}</p>
                    <p className="mt-1 text-xs text-slate-500">Expected: {exercise.expectedOutcome}</p>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h3 className="font-semibold">Quiz</h3>
              <ul className="mt-2 space-y-3">
                {lesson.quiz.map((q) => (
                  <li key={q.question} className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
                    <p className="font-medium">{q.question}</p>
                    <p className="mt-1 text-xs text-slate-500">Answer: {q.options[q.answer]}</p>
                  </li>
                ))}
              </ul>
            </article>

            <ContentCard title="Summary" value={lesson.summary} />

            <div className="flex flex-wrap gap-2 pb-8">
              <button
                onClick={() => actions.completeChapter(course.id, lesson.slug)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {isDone ? 'Completed' : 'Mark Chapter Complete'}
              </button>
              <Link to="/exercises" className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold dark:bg-slate-800">
                Go to Exercises
              </Link>
              <Link to="/quizzes" className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold dark:bg-slate-800">
                Take Quiz
              </Link>
              {adjacent.prev ? (
                <Link to={`/chapter/${course.id}/${adjacent.prev.slug}`} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold dark:bg-slate-800">
                  Previous
                </Link>
              ) : null}
              {adjacent.next ? (
                <Link to={`/chapter/${course.id}/${adjacent.next.slug}`} className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold dark:bg-slate-800">
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden h-full border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 md:block">
        <div className="flex h-full flex-col p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase text-slate-500">Course</p>
            <button
              onClick={() => setIsPanelMinimized((prev) => !prev)}
              className="rounded-lg border border-slate-300 p-1 dark:border-slate-700"
              aria-label={isPanelMinimized ? 'Expand chapter panel' : 'Minimize chapter panel'}
              title={isPanelMinimized ? 'Expand panel' : 'Minimize panel'}
            >
              {isPanelMinimized ? <PanelRightOpen size={14} /> : <PanelRightClose size={14} />}
            </button>
          </div>
          {isPanelMinimized ? (
            <div className="mt-4 text-center">
              <p className="text-[11px] text-slate-500">Panel minimized</p>
            </div>
          ) : (
            <>
              <h2 className="mt-1 text-xl font-bold">{course.title[language]}</h2>
              <p className="mt-2 text-xs text-slate-500">
                {completed}/{total} completed ({progressPercent}%)
              </p>
              <div className="mt-3 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <label className="mt-4 block">
                <span className="text-xs text-slate-500">Search chapters</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
                  <Search size={14} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Find chapter..."
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </label>

              <div className="mt-4 flex-1 overflow-y-auto pr-1">
                <div className="space-y-2">
                  {filteredChapters.map((item) => {
                    const done = Boolean(state.completedChapters[`${course.id}:${item.slug}`])
                    const active = item.slug === lesson.slug
                    return (
                      <Link
                        key={item.slug}
                        to={`/chapter/${course.id}/${item.slug}`}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${
                          active ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-900'
                        }`}
                      >
                        <span className="pr-2">{item.chapterNumber}. {item.title}</span>
                        {done ? <CheckCircle2 size={16} className={active ? 'text-white' : 'text-emerald-500'} /> : null}
                      </Link>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </aside>
    </section>
  )
}

function ContentCard({ title, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-base text-slate-700 dark:text-slate-200">{value}</p>
    </article>
  )
}

