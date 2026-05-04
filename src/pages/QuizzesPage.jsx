import { useEffect, useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { t } from '../data/i18n'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function QuizzesPage() {
  const { state, actions, metadata } = useApp()
  const language = state.language
  const [selectedCourse, setSelectedCourse] = useState('html')
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [quiz, setQuiz] = useState([])
  const [assessmentQuiz, setAssessmentQuiz] = useState([])

  const score = useMemo(() => {
    if (quiz.length === 0) return 0
    const total = quiz.reduce((count, q) => (answers[q.id] === q.answer ? count + 1 : count), 0)
    return Math.round((total / quiz.length) * 100)
  }, [answers, quiz])

  const loadRandomQuiz = async (courseId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/quiz/random?courseId=${courseId}&count=8`)
      const data = await response.json()
      const questions = Array.isArray(data.questions) ? data.questions : []
      setQuiz(questions)
      setAnswers({})
      return questions
    } catch {
      const fallback = metadata.courseQuizzes[courseId] || []
      setQuiz(fallback)
      setAnswers({})
      return fallback
    } finally {
      setLoading(false)
    }
  }

  /* eslint-disable react-hooks/set-state-in-effect -- fetches random quiz set when course changes */
  useEffect(() => {
    loadRandomQuiz(selectedCourse)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse])
  /* eslint-enable react-hooks/set-state-in-effect */

  const submit = () => {
    actions.submitQuiz(selectedCourse, score)
  }

  const assessmentScore = useMemo(() => {
    if (assessmentQuiz.length === 0) return 0
    const total = assessmentQuiz.reduce((count, q) => (answers[q.id] === q.answer ? count + 1 : count), 0)
    return Math.round((total / assessmentQuiz.length) * 100)
  }, [answers, assessmentQuiz])

  const shuffle = (items) => {
    const copy = [...items]
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
  }

  const buildAssessmentQuiz = (list) =>
    shuffle(list).map((question) => {
      const options = question.options.map((value, idx) => ({ value, idx }))
      const shuffledOptions = shuffle(options)
      const answer = shuffledOptions.findIndex((entry) => entry.idx === question.answer)
      return {
        ...question,
        options: shuffledOptions.map((entry) => entry.value),
        answer,
      }
    })

  const startAssessment = async () => {
    const source = await loadRandomQuiz(selectedCourse)
    setAssessmentQuiz(buildAssessmentQuiz(source))
    setAnswers({})
    actions.startAssessment(selectedCourse, 15 * 60)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }

  const submitAssessment = () => {
    actions.submitAssessment(assessmentScore)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }

  useEffect(() => {
    if (!state.assessmentMode.active) return undefined

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') actions.registerAssessmentViolation()
    }
    const onBlur = () => actions.registerAssessmentViolation()
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) actions.registerAssessmentViolation()
    }
    const onContextMenu = (event) => event.preventDefault()
    const onKeyDown = (event) => {
      const ctrl = event.ctrlKey || event.metaKey
      if (ctrl && ['c', 'v', 'x', 'a'].includes(event.key.toLowerCase())) {
        event.preventDefault()
        actions.registerAssessmentViolation()
      }
    }
    const onBeforeUnload = () => actions.registerAssessmentViolation()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('fullscreenchange', onFullscreenChange)
      window.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [state.assessmentMode.active, actions])

  return (
    <section className="premium-bg space-y-4 rounded-3xl p-4 md:p-6">
      <h2 className="text-3xl font-bold">{t(language, 'quizzes')}</h2>
      <p className="text-base text-slate-600 dark:text-slate-300">{t(language, 'quizIntro')}</p>

      <select
        value={selectedCourse}
        onChange={(event) => {
          setSelectedCourse(event.target.value)
        }}
        className="glass-card rounded-xl px-3 py-2 dark:text-slate-100"
      >
        {Object.keys(metadata.courseQuizzes).map((courseId) => (
          <option key={courseId} value={courseId}>
            {courseId.toUpperCase()} {t(language, 'chapterQuiz').toLowerCase()}
          </option>
        ))}
      </select>

      <div className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
        <button
          type="button"
          onClick={() => loadRandomQuiz(selectedCourse)}
          className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          {loading ? t(language, 'loading') : t(language, 'randomSet')}
        </button>
        <button
          type="button"
          onClick={startAssessment}
          disabled={state.assessmentMode.active}
          className="rounded-xl border border-amber-300 bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900 disabled:opacity-60 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          {state.assessmentMode.active ? t(language, 'assessmentRunning') : t(language, 'startAssessment')}
        </button>
        <p className="text-xs text-slate-600 dark:text-slate-300">{t(language, 'quizRandomHint')}</p>
      </div>

      {(state.assessmentMode.active ? assessmentQuiz : quiz).map((question) => (
        <article key={question.id} className="glass-card rounded-2xl p-4">
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
          {!state.assessmentMode.active && answers[question.id] !== undefined ? (
            <p className="mt-2 text-xs text-slate-500">{question.explanation[language]}</p>
          ) : null}
        </article>
      ))}

      <div className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3">
        {state.assessmentMode.active ? (
          <>
            <button onClick={submitAssessment} className="rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white">
              {t(language, 'submitAssessment')}
            </button>
            <p className="text-sm">
              {t(language, 'assessmentTimer')}: <span className="font-bold">{Math.floor(state.assessmentMode.timerRemaining / 60)}:{String(state.assessmentMode.timerRemaining % 60).padStart(2, '0')}</span>
            </p>
            <p className="text-sm">
              {t(language, 'violations')}: <span className="font-bold">{state.assessmentMode.violations}</span>
            </p>
            <p className="text-sm">
              {t(language, 'deductions')}: <span className="font-bold">{state.assessmentMode.deductions}</span>
            </p>
          </>
        ) : (
          <>
            <button onClick={submit} className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white">
              {t(language, 'submitQuiz')}
            </button>
            <p className="text-sm">{t(language, 'currentScore')}: <span className="font-bold">{score}%</span></p>
          </>
        )}
      </div>

      <article className="glass-card rounded-2xl p-4">
        <h3 className="font-semibold">{t(language, 'savedScores')}</h3>
        <ul className="mt-2 space-y-1 text-sm">
          {Object.entries(state.quizScores).map(([courseId, savedScore]) => (
            <li key={courseId}>
              {courseId.toUpperCase()}: {savedScore}%
            </li>
          ))}
        </ul>
      </article>
      {state.assessmentMode.submitted ? (
        <article className="glass-card rounded-2xl p-4">
          <h3 className="font-semibold">{t(language, 'assessmentResult')}</h3>
          <p className="mt-2 text-sm">{t(language, 'currentScore')}: {state.assessmentMode.score}%</p>
          <p className="text-sm">{t(language, 'violations')}: {state.assessmentMode.violations}</p>
          <p className="text-sm">{t(language, 'deductions')}: {state.assessmentMode.deductions}</p>
          <button
            type="button"
            className="mt-3 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold dark:border-slate-600"
            onClick={actions.clearAssessment}
          >
            {t(language, 'closeResult')}
          </button>
        </article>
      ) : null}
    </section>
  )
}
