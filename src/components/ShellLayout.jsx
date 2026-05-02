import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, Bot, FolderKanban, House, Search, Settings, SquareTerminal, UserRound } from 'lucide-react'
import { useApp } from '../context/AppContext'
import AppLogo from './AppLogo'
import { t } from '../data/i18n'

const navItems = [
  { to: '/home', key: 'home', icon: House },
  { to: '/courses', key: 'courses', icon: BookOpen },
  { to: '/editor', key: 'editor', icon: SquareTerminal },
  { to: '/search', key: 'search', icon: Search },
  { to: '/projects', key: 'projects', icon: FolderKanban },
  { to: '/tutor', key: 'tutor', icon: Bot },
  { to: '/profile', key: 'profile', icon: UserRound },
  { to: '/settings', key: 'settings', icon: Settings },
]

function LinkItem({ item, language }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
        }`
      }
    >
      <Icon size={18} />
      <span>{t(language, item.key)}</span>
    </NavLink>
  )
}

export default function ShellLayout() {
  const location = useLocation()
  const { state, actions } = useApp()
  const isChapterRoute = location.pathname.startsWith('/chapter/')

  return (
    <div className="h-screen overflow-hidden bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
      <div className="relative h-full pb-20 md:pb-0">
        <aside className="fixed inset-y-0 left-0 z-20 hidden h-screen w-[240px] border-r border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 md:block">
          <div className="mb-1 flex items-center gap-2">
            <AppLogo size={30} />
            <h1 className="text-2xl font-bold">DevSchool Pro</h1>
          </div>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Learn web dev step by step</p>
          <label className="mb-4 block">
            <span className="text-xs text-slate-500">{t(state.language, 'language')}</span>
            <select
              value={state.language}
              onChange={(event) => actions.setLanguage(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </label>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <LinkItem key={item.to} item={item} language={state.language} />
            ))}
          </nav>
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase text-slate-500">User</p>
            <p className="mt-1 text-sm font-semibold">{state.user.name}</p>
          </div>
        </aside>
        <main className={`h-full w-full ${isChapterRoute ? 'md:pl-[240px]' : 'md:pl-[240px]'} ${isChapterRoute ? 'overflow-hidden p-0' : 'overflow-y-auto p-4 md:p-8'}`}>
          <div className="mb-4 flex items-center justify-between md:hidden">
            <div className="flex items-center gap-2">
              <AppLogo size={24} />
              <h1 className="text-lg font-bold">DevSchool Pro</h1>
            </div>
            <select
              value={state.language}
              onChange={(event) => actions.setLanguage(event.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900 md:hidden">
        <ul className="grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.to)
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={`flex flex-col items-center rounded-lg py-2 text-xs ${
                    active ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{t(state.language, item.key)}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
