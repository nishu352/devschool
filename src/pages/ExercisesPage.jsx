import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { exerciseTemplates } from '../data/content'

export default function ExercisesPage() {
  const { state } = useApp()
  const language = state.language
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const score = useMemo(() => {
    if (!submitted) return 0
    return exerciseTemplates.reduce((count, exercise) => {
      const userAnswer = String(answers[exercise.id] || '').trim().toLowerCase()
      return userAnswer.includes(exercise.answer.toLowerCase()) ? count + 1 : count
    }, 0)
  }, [answers, submitted])

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Exercises</h2>
      <p className="text-base text-slate-600 dark:text-slate-300">
        Practice fill in blanks, fix errors, and write missing code after each chapter.
      </p>
      <p className="text-sm text-slate-500">Current chapter: {state.selectedCourseId} / {state.selectedChapterId}</p>

      {exerciseTemplates.map((exercise) => (
        <article key={exercise.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="text-xs uppercase text-slate-500">Practice</p>
          <p className="mt-1 font-medium">{exercise.prompt[language]}</p>
          <input
            value={answers[exercise.id] || ''}
            onChange={(event) => setAnswers((prev) => ({ ...prev, [exercise.id]: event.target.value }))}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800"
          />
        </article>
      ))}

      <button onClick={() => setSubmitted(true)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
        Check Answers
      </button>

      {submitted ? (
        <p className="rounded-xl bg-slate-100 p-3 text-sm dark:bg-slate-800">
          You solved {score}/{exerciseTemplates.length} exercises.
        </p>
      ) : null}
    </section>
  )
}
