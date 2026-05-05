import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Bot,
  CalendarDays,
  ClipboardCheck,
  Coins,
  Dumbbell,
  House,
  NotebookPen,
  Settings,
  Trophy,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import AppLogo from './AppLogo'
import { t } from '../data/i18n'

const navItems = [
  { to: '/home', label: 'Home', icon: House },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/exercises', label: 'Practice', icon: Dumbbell },
  { to: '/quizzes', label: 'Assessments', icon: ClipboardCheck },
  { to: '/assessment-history', label: 'History', icon: NotebookPen },
  { to: '/tutor', label: 'AI Tutor', icon: Bot },
  { to: '/home', label: 'Leaderboard', icon: Trophy, placeholder: true },
  { to: '/home', label: 'Earn', icon: Coins, placeholder: true },
  { to: '/home', label: 'Calendar', icon: CalendarDays, placeholder: true },
  { to: '/home', label: 'Notes', icon: NotebookPen, placeholder: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function LinkItem({ item, disabled, active }) {
  const Icon = item.icon
  return (
    disabled || item.placeholder ? (
      <div
        className={`flex cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
          active
            ? 'bg-linear-to-r from-violet-500/30 via-blue-500/20 to-orange-500/30 text-white ring-1 ring-violet-400/40'
            : 'text-slate-400'
        }`}
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </div>
    ) : (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
            isActive
              ? 'bg-linear-to-r from-violet-500/40 via-blue-500/30 to-orange-500/40 text-white ring-1 ring-violet-400/40'
              : 'text-slate-300 hover:bg-slate-800/70'
          }`
        }
      >
        <Icon size={18} />
        <span>{item.label}</span>
      </NavLink>
    )
  )
}

export default function ShellLayout() {
  const location = useLocation()
  const { state, actions, notice } = useApp()
  const isChapterRoute = location.pathname.startsWith('/chapter/')
  const navLocked = state.focusMode.sessionActive || state.assessmentMode.active

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-[#06070f] via-[#0b1020] to-[#110d1f] text-white">
      <div className="relative h-full pb-20 md:pb-0">
        <aside className="fixed inset-y-0 left-0 z-20 hidden h-screen w-[260px] border-r border-white/10 bg-slate-950/60 p-4 backdrop-blur-xl md:block">
          <div className="mb-6 flex items-center gap-2">
            <AppLogo size={30} />
            <h1 className="text-2xl font-bold">DevSchool Pro</h1>
          </div>
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-blue-500 text-sm font-bold">
                {(state.user.name || 'L').slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold">{state.user.name || 'Learner'}</p>
                <p className="text-xs text-slate-400">Level {Math.max(1, Math.floor((state.xp || 0) / 120) + 1)} • Full Stack Track</p>
              </div>
            </div>
          </div>
          <label className="mb-4 block">
            <span className="text-xs text-slate-400">{t(state.language, 'language')}</span>
            <select
              value={state.language}
              onChange={(event) => actions.setLanguage(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/20 bg-slate-900/60 px-2 py-1 text-sm"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </label>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <LinkItem
                key={`${item.label}-${item.to}`}
                item={item}
                disabled={navLocked}
                active={location.pathname.startsWith(item.to) && !item.placeholder}
              />
            ))}
          </nav>
        </aside>
        <main className={`h-full w-full md:pl-[268px] ${isChapterRoute ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-6'}`}>
          {(state.focusMode.sessionActive || state.assessmentMode.active) && (
            <div className="sticky top-0 z-30 mb-3 rounded-xl border border-amber-400/50 bg-amber-500/15 px-3 py-2 text-sm font-semibold text-amber-100">
              {state.focusMode.sessionActive
                ? `Focus Mode Active 🔒 ${Math.floor(state.focusMode.timerRemaining / 60)
                    .toString()
                    .padStart(2, '0')}:${String(state.focusMode.timerRemaining % 60).padStart(2, '0')}`
                : `Assessment Active 🔒 ${Math.floor(state.assessmentMode.timerRemaining / 60)
                    .toString()
                    .padStart(2, '0')}:${String(state.assessmentMode.timerRemaining % 60).padStart(2, '0')}`}
            </div>
          )}
          <div className="mb-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <AppLogo size={24} />
              <h1 className="text-lg font-bold">DevSchool Pro</h1>
            </div>
            <select
              value={state.language}
              onChange={(event) => actions.setLanguage(event.target.value)}
              className="rounded-lg border border-white/20 bg-slate-900/80 px-2 py-1 text-xs"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/90 p-2 backdrop-blur-xl md:hidden">
        <ul className="grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.to)
            return (
              <li key={`${item.label}-${item.to}`}>
                {navLocked ? (
                  <div className="flex cursor-not-allowed flex-col items-center rounded-lg py-2 text-xs text-slate-500">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>
                ) : (
                  <NavLink
                    to={item.to}
                    className={`flex flex-col items-center rounded-lg py-2 text-xs ${
                      active
                        ? 'bg-linear-to-r from-violet-500/40 via-blue-500/30 to-orange-500/40 text-white'
                        : 'text-slate-300'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            )
          })}
        </ul>
      </nav>
      {notice ? (
        <div className="pointer-events-none fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {notice.message}
        </div>
      ) : null}
    </div>
  )
}
