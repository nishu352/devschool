/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getCourseQuizzes, getCourses } from '../content/lessonStore'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const AppContext = createContext(null)

const STORAGE_KEY_LEGACY = 'devschool-state'

const courses = getCourses()
const courseQuizzes = getCourseQuizzes()
const categories = {
  en: ['Core'],
  hi: ['Core'],
  hinglish: ['Core'],
}
const learningLevels = ['beginner', 'intermediate', 'advanced', 'expert']
const projectsByLevel = {
  beginner: ['Resume page', 'Portfolio'],
  intermediate: ['Todo app', 'Calculator'],
  advanced: ['Ecommerce', 'Blog', 'Chat app'],
}
const dailyChallenge = {
  en: { title: 'Daily Challenge', description: 'Finish one chapter and solve one exercise.' },
  hi: { title: 'Daily Challenge', description: 'Ek chapter complete karo aur ek exercise solve karo.' },
  hinglish: { title: 'Daily Challenge', description: 'Ek chapter complete karo aur ek exercise solve karo.' },
}
const defaultFocusDurationSeconds = 25 * 60
const defaultAssessmentDurationSeconds = 15 * 60

const guestUserShape = () => ({
  name: 'Learner',
  loggedIn: false,
  email: null,
  phone: null,
  id: null,
})

const defaultState = {
  user: guestUserShape(),
  profileAvatar: '',
  darkMode: false,
  language: 'en',
  learningLevel: 'beginner',
  fontScale: 100,
  dailyGoal: 2,
  streak: 1,
  studyHours: 0,
  completedChapters: {},
  quizScores: {},
  completedProjects: [],
  selectedCourseId: 'html',
  selectedChapterId: courses[0]?.chapters[0]?.slug || '',
  searchQuery: '',
  editorCode: `<!doctype html>
<html>
  <head>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      h1 { color: #2563eb; }
    </style>
  </head>
  <body>
    <h1>Welcome to DevSchool</h1>
    <p>Write code, run, and learn.</p>
    <script>
      console.log('DevSchool editor running')
    </script>
  </body>
</html>`,
  remindersEnabled: false,
  dailyChallenge: dailyChallenge.en,
  studyPoints: 0,
  xp: 0,
  focusMode: {
    sessionActive: false,
    courseId: null,
    chapterId: null,
    violations: 0,
    timerEndsAt: null,
    timerRemaining: defaultFocusDurationSeconds,
    status: 'idle',
  },
  assessmentMode: {
    active: false,
    courseId: null,
    startedAt: null,
    timerEndsAt: null,
    timerRemaining: defaultAssessmentDurationSeconds,
    violations: 0,
    deductions: 0,
    score: 0,
    submitted: false,
    failed: false,
  },
}

function persistenceKey(sessionUserId) {
  return sessionUserId ? `devschool-state-${sessionUserId}` : STORAGE_KEY_LEGACY
}

function loadPersistedLearningState(storageKey) {
  try {
    const value = localStorage.getItem(storageKey)
    if (!value) return { ...defaultState }
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      delete parsed.user
      return { ...defaultState, ...parsed }
    }
    return { ...defaultState }
  } catch {
    return { ...defaultState }
  }
}

function deriveUser(session, guestLogin) {
  if (session?.user) {
    const u = session.user
    const meta = u.user_metadata || {}
    const phone = u.phone ?? null
    const fromEmail = u.email?.split('@')[0]
    const nameGuess = meta.full_name || meta.name || fromEmail || (phone ? `···${String(phone).slice(-4)}` : null)
    return {
      loggedIn: true,
      email: u.email ?? null,
      phone,
      id: u.id ?? null,
      name: String(nameGuess || 'Learner'),
    }
  }
  if (guestLogin) {
    return {
      loggedIn: true,
      email: null,
      phone: null,
      id: null,
      name: guestLogin.name || 'Learner',
    }
  }
  return guestUserShape()
}

function serializeForStorage(stateSlice) {
  const payload = { ...stateSlice }
  delete payload.user
  return JSON.stringify(payload)
}

function isLoggedIn(session, guestLogin) {
  return Boolean((isSupabaseConfigured && session?.user) || (!isSupabaseConfigured && guestLogin))
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => ({ ...defaultState }))
  const [session, setSession] = useState(null)
  const [guestLogin, setGuestLogin] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const persistIdentityRef = useRef(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      if (!supabase) {
        if (!cancelled) setAuthReady(true)
        return
      }
      const { data } = await supabase.auth.getSession()
      if (!cancelled) {
        setSession(data.session ?? null)
        setAuthReady(true)
      }
    }
    boot()
    const sub =
      supabase?.auth?.onAuthStateChange((_evt, nextSession) => {
        setSession(nextSession)
      }) ?? null
    return () => {
      cancelled = true
      sub?.data?.subscription?.unsubscribe()
    }
  }, [])

  // Rehydrate learning state when Supabase session or offline guest identity changes (separate storage keys per user).
  /* eslint-disable react-hooks/set-state-in-effect -- localStorage keyed by auth identity; must run before persist effect */
  useLayoutEffect(() => {
    if (!authReady) return
    const loggedIn = isLoggedIn(session, guestLogin)
    const sid = session?.user?.id ?? null
    const identity =
      loggedIn && sid ? `sid:${sid}` : loggedIn && guestLogin ? 'guest' : 'out'
    const prev = persistIdentityRef.current

    if (identity === prev) return
    persistIdentityRef.current = identity

    if (!loggedIn) return

    const key = sid ? persistenceKey(sid) : STORAGE_KEY_LEGACY
    setState(loadPersistedLearningState(key))
  }, [authReady, session, guestLogin])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode)
    document.documentElement.style.fontSize = `${state.fontScale}%`
  }, [state.darkMode, state.fontScale])

  useEffect(() => {
    if (!authReady) return
    const loggedIn = isLoggedIn(session, guestLogin)
    if (!loggedIn) return
    const key = session?.user?.id ? persistenceKey(session.user.id) : STORAGE_KEY_LEGACY
    localStorage.setItem(key, serializeForStorage(state))
  }, [state, authReady, session, guestLogin])

  useEffect(() => {
    if (!state.remindersEnabled || !('Notification' in window) || Notification.permission !== 'granted') {
      return
    }
    const timer = setInterval(() => {
      new Notification('DevSchool Pro Reminder', { body: 'Time to study and complete your coding goal.' })
    }, 1000 * 60 * 60 * 4)
    return () => clearInterval(timer)
  }, [state.remindersEnabled])

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        const next = { ...prev }
        let changed = false
        const now = Date.now()

        if (prev.focusMode.sessionActive && prev.focusMode.timerEndsAt) {
          const remaining = Math.max(0, Math.ceil((prev.focusMode.timerEndsAt - now) / 1000))
          if (remaining !== prev.focusMode.timerRemaining) {
            next.focusMode = { ...prev.focusMode, timerRemaining: remaining }
            changed = true
          }
          if (remaining === 0) {
            next.focusMode = {
              ...prev.focusMode,
              sessionActive: false,
              timerRemaining: 0,
              status: 'completed',
            }
            next.studyPoints = prev.studyPoints + 10
            next.xp = prev.xp + 20
            next.streak = prev.streak + 1
            changed = true
            setNotice({ type: 'success', message: 'Focus session completed. +10 points and +20 XP.' })
          }
        }

        if (prev.assessmentMode.active && prev.assessmentMode.timerEndsAt) {
          const remaining = Math.max(0, Math.ceil((prev.assessmentMode.timerEndsAt - now) / 1000))
          if (remaining !== prev.assessmentMode.timerRemaining) {
            next.assessmentMode = { ...prev.assessmentMode, timerRemaining: remaining }
            changed = true
          }
          if (remaining === 0) {
            const netScore = Math.max(0, prev.assessmentMode.score - prev.assessmentMode.deductions)
            next.assessmentMode = {
              ...prev.assessmentMode,
              active: false,
              submitted: true,
              timerRemaining: 0,
              score: netScore,
            }
            changed = true
            setNotice({ type: 'warning', message: 'Assessment auto-submitted due to timeout.' })
          }
        }

        return changed ? next : prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const onBeforeUnload = () => {
      setState((prev) => {
        let changed = false
        const next = { ...prev }
        if (prev.focusMode.sessionActive) {
          next.focusMode = {
            ...prev.focusMode,
            sessionActive: false,
            status: 'failed',
            timerEndsAt: null,
          }
          next.studyPoints = Math.max(0, prev.studyPoints - 5)
          changed = true
        }
        if (prev.assessmentMode.active) {
          next.assessmentMode = {
            ...prev.assessmentMode,
            active: false,
            failed: true,
            submitted: true,
            timerEndsAt: null,
          }
          changed = true
        }
        return changed ? next : prev
      })
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  const actions = useMemo(
    () => ({
      async signInWithPassword(email, password) {
        if (!supabase) return { error: new Error('Supabase is not configured.') }
        return supabase.auth.signInWithPassword({ email: email.trim(), password })
      },
      async signUp(email, password, fullName) {
        if (!supabase) return { error: new Error('Supabase is not configured.') }
        const name = fullName.trim()
        return supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: name ? { full_name: name } : undefined },
        })
      },
      async resetPassword(email) {
        if (!supabase) return { error: new Error('Supabase is not configured.') }
        return supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/login`,
        })
      },
      async signInWithGoogle() {
        if (!supabase) return { error: new Error('Supabase is not configured.') }
        return supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: `${window.location.origin}/login` },
        })
      },
      async sendPhoneOtp(phone, metadata) {
        if (!supabase) return { error: new Error('Supabase is not configured.') }
        const trimmed = String(phone || '').trim()
        const name = String(metadata?.fullName || '').trim()
        return supabase.auth.signInWithOtp({
          phone: trimmed,
          options: name ? { data: { full_name: name } } : undefined,
        })
      },
      async verifyPhoneOtp(phone, token) {
        if (!supabase) return { error: new Error('Supabase is not configured.') }
        return supabase.auth.verifyOtp({
          phone: String(phone || '').trim(),
          token: String(token || '').trim(),
          type: 'sms',
        })
      },
      guestLogin(displayName) {
        if (isSupabaseConfigured) return
        setGuestLogin({ name: displayName.trim() || 'Learner' })
      },
      async logout() {
        if (supabase) await supabase.auth.signOut()
        setGuestLogin(null)
        persistIdentityRef.current = null
        setState(loadPersistedLearningState(STORAGE_KEY_LEGACY))
      },
      toggleDarkMode() {
        setState((prev) => ({ ...prev, darkMode: !prev.darkMode }))
      },
      setLanguage(language) {
        setState((prev) => ({
          ...prev,
          language,
          dailyChallenge: dailyChallenge[language] || dailyChallenge.en,
        }))
      },
      setLearningLevel(learningLevel) {
        setState((prev) => ({ ...prev, learningLevel }))
      },
      setFontScale(fontScale) {
        setState((prev) => ({ ...prev, fontScale }))
      },
      setDailyGoal(dailyGoal) {
        setState((prev) => ({ ...prev, dailyGoal }))
      },
      selectCourse(courseId) {
        const fallbackCourse = courses[0]
        const pickedCourse = courses.find((course) => course.id === courseId) || fallbackCourse
        setState((prev) => ({
          ...prev,
          selectedCourseId: pickedCourse.id,
          selectedChapterId: pickedCourse.chapters[0]?.slug || '',
        }))
      },
      selectChapter(courseId, chapterId) {
        setState((prev) => ({
          ...prev,
          selectedCourseId: courseId,
          selectedChapterId: chapterId,
        }))
      },
      completeChapter(courseId, chapterId) {
        setState((prev) => {
          const key = `${courseId}:${chapterId}`
          if (prev.completedChapters[key]) return prev
          return {
            ...prev,
            studyHours: prev.studyHours + 1,
            completedChapters: { ...prev.completedChapters, [key]: true },
          }
        })
      },
      saveEditorCode(editorCode) {
        setState((prev) => ({ ...prev, editorCode }))
      },
      resetEditorCode() {
        setState((prev) => ({ ...prev, editorCode: defaultState.editorCode }))
      },
      setSearchQuery(searchQuery) {
        setState((prev) => ({ ...prev, searchQuery }))
      },
      submitQuiz(courseId, score) {
        setState((prev) => ({
          ...prev,
          quizScores: { ...prev.quizScores, [courseId]: score },
          studyPoints: score >= 60 ? prev.studyPoints + 5 : prev.studyPoints,
          xp: score >= 60 ? prev.xp + 10 : prev.xp,
        }))
      },
      startFocusMode(courseId, chapterId, durationSeconds = defaultFocusDurationSeconds) {
        const endsAt = Date.now() + durationSeconds * 1000
        setState((prev) => ({
          ...prev,
          focusMode: {
            sessionActive: true,
            courseId,
            chapterId,
            violations: 0,
            timerEndsAt: endsAt,
            timerRemaining: durationSeconds,
            status: 'active',
          },
        }))
        setNotice({ type: 'info', message: 'Focus Mode Active. Stay on this lesson.' })
      },
      registerFocusViolation() {
        setState((prev) => {
          if (!prev.focusMode.sessionActive) return prev
          const violations = prev.focusMode.violations + 1
          if (violations >= 3) {
            setNotice({ type: 'error', message: 'Focus session failed after 3 violations.' })
            return {
              ...prev,
              studyPoints: Math.max(0, prev.studyPoints - 10),
              focusMode: {
                ...prev.focusMode,
                sessionActive: false,
                status: 'failed',
                violations,
                timerEndsAt: null,
              },
            }
          }
          if (violations === 2) {
            setNotice({ type: 'warning', message: 'Second violation. 5 points deducted.' })
            return {
              ...prev,
              studyPoints: Math.max(0, prev.studyPoints - 5),
              focusMode: { ...prev.focusMode, violations },
            }
          }
          setNotice({ type: 'warning', message: 'Warning: keep the app focused.' })
          return {
            ...prev,
            focusMode: { ...prev.focusMode, violations },
          }
        })
      },
      cancelFocusMode(penalty = true) {
        setState((prev) => {
          if (!prev.focusMode.sessionActive) return prev
          return {
            ...prev,
            studyPoints: penalty ? Math.max(0, prev.studyPoints - 5) : prev.studyPoints,
            focusMode: {
              ...prev.focusMode,
              sessionActive: false,
              status: 'failed',
              timerEndsAt: null,
            },
          }
        })
      },
      startAssessment(courseId, durationSeconds = defaultAssessmentDurationSeconds) {
        const endsAt = Date.now() + durationSeconds * 1000
        setState((prev) => ({
          ...prev,
          assessmentMode: {
            active: true,
            courseId,
            startedAt: Date.now(),
            timerEndsAt: endsAt,
            timerRemaining: durationSeconds,
            violations: 0,
            deductions: 0,
            score: 0,
            submitted: false,
            failed: false,
          },
        }))
      },
      registerAssessmentViolation() {
        setState((prev) => {
          if (!prev.assessmentMode.active) return prev
          const violations = prev.assessmentMode.violations + 1
          if (violations >= 3) {
            setNotice({ type: 'error', message: 'Assessment auto-submitted after 3 violations.' })
            return {
              ...prev,
              assessmentMode: {
                ...prev.assessmentMode,
                active: false,
                submitted: true,
                failed: true,
                violations,
              },
            }
          }
          if (violations === 2) {
            setNotice({ type: 'warning', message: 'Second assessment violation. 5 marks deducted.' })
            return {
              ...prev,
              assessmentMode: {
                ...prev.assessmentMode,
                violations,
                deductions: prev.assessmentMode.deductions + 5,
              },
            }
          }
          setNotice({ type: 'warning', message: 'Assessment warning: stay in fullscreen and focused.' })
          return {
            ...prev,
            assessmentMode: { ...prev.assessmentMode, violations },
          }
        })
      },
      submitAssessment(rawScore) {
        setState((prev) => {
          const net = Math.max(0, Number(rawScore || 0) - prev.assessmentMode.deductions)
          return {
            ...prev,
            assessmentMode: {
              ...prev.assessmentMode,
              active: false,
              score: net,
              submitted: true,
              timerEndsAt: null,
            },
            xp: prev.xp + Math.round(net / 5),
            studyPoints: net >= 60 ? prev.studyPoints + 5 : prev.studyPoints,
          }
        })
      },
      clearAssessment() {
        setState((prev) => ({
          ...prev,
          assessmentMode: { ...defaultState.assessmentMode },
        }))
      },
      setProfileAvatar(avatar) {
        setState((prev) => ({ ...prev, profileAvatar: avatar || '' }))
      },
      completeProject(projectName) {
        setState((prev) => {
          if (prev.completedProjects.includes(projectName)) return prev
          return {
            ...prev,
            completedProjects: [...prev.completedProjects, projectName],
          }
        })
      },
      markMissedDay() {
        setState((prev) => ({
          ...prev,
          streak: Math.max(0, prev.streak - 1),
        }))
      },
      claimDailyChallenge() {
        setState((prev) => ({ ...prev, streak: prev.streak + 1 }))
      },
      setRemindersEnabled(enabled) {
        setState((prev) => ({ ...prev, remindersEnabled: enabled }))
      },
      clearNotice() {
        setNotice(null)
      },
    }),
    [],
  )

  const totalChapters = courses.reduce((sum, course) => sum + course.chapters.length, 0) || 1
  const completedChapterCount = Object.keys(state.completedChapters).length
  const skillPercentage = Math.round((completedChapterCount / totalChapters) * 100) || 0
  const quizAverage =
    Object.values(state.quizScores).length > 0
      ? Math.round(Object.values(state.quizScores).reduce((a, b) => a + b, 0) / Object.values(state.quizScores).length)
      : 0

  const flatProjects = Object.values(projectsByLevel).flat()
  const unlockedCount = Math.max(1, Math.ceil((skillPercentage / 100) * flatProjects.length))
  const unlockedProjects = flatProjects.slice(0, unlockedCount)

  const displayState = useMemo(
    () => ({ ...state, user: { ...deriveUser(session, guestLogin), avatar: state.profileAvatar || '' } }),
    [state, session, guestLogin],
  )

  return (
    <AppContext.Provider
      value={{
        authReady,
        state: displayState,
        actions,
        unlockedProjects,
        stats: { totalChapters, completedChapterCount, skillPercentage, quizAverage },
        metadata: { categories, courses, courseQuizzes, projectsByLevel, learningLevels },
        notice,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used inside AppProvider')
  }
  return context
}
