import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { t } from '../data/i18n'

export default function SettingsPage() {
  const { state, actions } = useApp()
  const language = state.language
  const [message, setMessage] = useState('')

  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      setMessage(t(language, 'notificationsUnsupported'))
      return
    }
    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    actions.setRemindersEnabled(granted)
    setMessage(granted ? t(language, 'remindersEnabled') : t(language, 'permissionDenied'))
  }

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">{t(language, 'settingsTitle')}</h2>
      <div className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <label className="block">
          <span className="text-xs text-slate-500">{t(language, 'language')}</span>
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
          <span className="text-xs text-slate-500">{t(language, 'level')}</span>
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
          {state.darkMode ? t(language, 'switchToLight') : t(language, 'switchToDark')}
        </button>
        <button
          onClick={enableNotifications}
          className="w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold dark:bg-slate-800"
        >
          {t(language, 'enableNotifications')}
        </button>
        <label className="block">
          <span className="text-xs text-slate-500">{t(language, 'fontSize')}: {state.fontScale}%</span>
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
          <span className="text-xs text-slate-500">{t(language, 'dailyGoal')}</span>
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
          {t(language, 'simulateMissedTask')}
        </button>
        <p className="text-xs text-slate-500">
          {t(language, 'settingsNote')}
        </p>
        {message ? <p className="text-sm text-green-600">{message}</p> : null}
        <button
          type="button"
          onClick={() => actions.logout()}
          className="w-full rounded-xl border border-red-300 bg-transparent px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          {t(language, 'signOut')}
        </button>
      </div>
    </section>
  )
}
