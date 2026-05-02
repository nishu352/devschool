import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'

export default function QuizzesPage() {
  const { state, actions, metadata } = useApp()
  const language = state.language
  const [selectedCourse, setSelectedCourse] = useState('html')
  const [answers, setAnswers] = useState({})

  const quiz = useMemo(() => metadata.courseQuizzes[selectedCourse] || [], [metadata.courseQuizzes, selectedCourse])
  const score = useMemo(() => {
    if (quiz.length === 0) return 0
    const total = quiz.reduce((count, q) => (answers[q.id] === q.answer ? count + 1 : count), 0)
    return Math.round((total / quiz.length) * 100)
  }, [answers, quiz])

  const submit = () => {
    actions.submitQuiz(selectedCourse, score)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Quizzes</h2>
      <p className="text-base text-slate-600 dark:text-slate-300">Take course quizzes and track score history.</p>

      <select
        value={selectedCourse}
        onChange={(event) => {
          setSelectedCourse(event.target.value)
          setAnswers({})
        }}
        className="rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
      >
        {Object.keys(metadata.courseQuizzes).map((courseId) => (
          <option key={courseId} value={courseId}>
            {courseId.toUpperCase()} quiz
          </option>
        ))}
      </select>

      {quiz.map((question) => (
        <article key={question.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
          <p className="font-medium">{question.question[language]}</p>
          <div className="mt-2 space-y-2">
            {question.options.map((option, index) => (
              <label key={option} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={answers[question.id] === index}
                  onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: index }))}
                />
                {option}
              </label>
            ))}
          </div>
          {answers[question.id] !== undefined ? (
            <p className="mt-2 text-xs text-slate-500">{question.explanation[language]}</p>
          ) : null}
        </article>
      ))}

      <div className="flex gap-2">
        <button onClick={submit} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Submit Quiz
        </button>
        <p className="self-center text-sm">Current score: {score}%</p>
      </div>

      <article className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
        <h3 className="font-semibold">Saved Scores</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {Object.entries(state.quizScores).map(([courseId, savedScore]) => (
            <li key={courseId}>
              {courseId.toUpperCase()}: {savedScore}%
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
