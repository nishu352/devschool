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

const guestUserShape = () => ({
  name: 'Learner',
  loggedIn: false,
  email: null,
  id: null,
})

const defaultState = {
  user: guestUserShape(),
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
    return {
      loggedIn: true,
      email: u.email ?? null,
      id: u.id ?? null,
      name: String(meta.full_name || meta.name || u.email?.split('@')[0] || 'Learner'),
    }
  }
  if (guestLogin) {
    return {
      loggedIn: true,
      email: null,
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
        }))
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
    () => ({ ...state, user: deriveUser(session, guestLogin) }),
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
