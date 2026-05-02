import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { t } from '../data/i18n'

export default function SettingsPage() {
  const { state, actions } = useApp()
  const [message, setMessage] = useState('')

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      setMessage('Notifications are not supported on this device.')
      return
    }
    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    actions.setRemindersEnabled(granted)
    setMessage(granted ? 'Daily reminders enabled.' : 'Notification permission denied.')
  }

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">Settings</h2>
      <div className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <label className="block">
          <span className="text-xs text-slate-500">{t(state.language, 'language')}</span>
          <select
            value={state.language}
            onChange={(event) => actions.setLanguage(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-slate-500">{t(state.language, 'level')}</span>
          <select
            value={state.learningLevel}
            onChange={(event) => actions.setLearningLevel(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </label>

        <button
          onClick={actions.toggleDarkMode}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
        >
          {state.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <button
          onClick={enableNotifications}
          className="w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold dark:bg-slate-800"
        >
          Enable Study Notifications
        </button>
        <label className="block">
          <span className="text-xs text-slate-500">{t(state.language, 'fontSize')}: {state.fontScale}%</span>
          <input
            type="range"
            min="90"
            max="120"
            step="5"
            value={state.fontScale}
            onChange={(event) => actions.setFontScale(Number(event.target.value))}
            className="mt-1 w-full"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-500">{t(state.language, 'dailyGoal')}</span>
          <input
            type="number"
            min="1"
            max="10"
            value={state.dailyGoal}
            onChange={(event) => actions.setDailyGoal(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-800"
          />
        </label>
        <button
          onClick={actions.markMissedDay}
          className="w-full rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white"
        >
          Simulate Missed Task
        </button>
        <p className="text-xs text-slate-500">
          Light mode is default, dark mode is optional. Notifications help maintain consistency.
        </p>
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        <button
          type="button"
          onClick={() => actions.logout()}
          className="w-full rounded-xl border border-red-300 bg-transparent px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          Sign out
        </button>
      </div>
    </section>
  )
}
