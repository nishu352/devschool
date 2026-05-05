import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import InstallPrompt from './components/InstallPrompt'
import ShellLayout from './components/ShellLayout'
import { useApp } from './context/AppContext'
import ChapterPage from './pages/ChapterPage'
import CoursesPage from './pages/CoursesPage'
import EditorPage from './pages/EditorPage'
import ExercisesPage from './pages/ExercisesPage'
import HomePage from './pages/HomePage'
import LegalDocumentPage from './pages/LegalDocumentPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import ProjectsPage from './pages/ProjectsPage'
import QuizzesPage from './pages/QuizzesPage'
import SearchPage from './pages/SearchPage'
import SettingsPage from './pages/SettingsPage'
import TutorPage from './pages/TutorPage'

function AuthRoutes() {
  const { state } = useApp()
  if (!state.user.loggedIn) return <Navigate to="/login" replace />

  return (
    <>
      <InstallPrompt />
      <Routes>
        <Route element={<ShellLayout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/chapter/:courseId/:chapterId" element={<ChapterPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/tutor" element={<TutorPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/privacy-policy" element={<LegalDocumentPage />} />
          <Route path="/settings/terms" element={<LegalDocumentPage />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  const { authReady, state } = useApp()

  useEffect(() => {
    document.title = 'DevSchool Pro'
    const favicon = document.querySelector("link[rel='icon']")
    if (favicon) favicon.setAttribute('href', '/devschool-icon.svg')
  }, [])

  if (!authReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" aria-hidden />
        <p className="text-sm text-slate-600 dark:text-slate-300">Checking your session…</p>
      </div>
    )
  }

  if (!state.user.loggedIn) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }
  return <AuthRoutes />
}
