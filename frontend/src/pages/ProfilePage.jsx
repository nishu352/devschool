import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { t } from '../data/i18n'

export default function ProfilePage() {
  const { state, stats, actions } = useApp()
  const language = state.language
  const [message, setMessage] = useState('')
  const initials = useMemo(() => getInitials(state.user.name), [state.user.name])

  const presetAvatars = useMemo(() => createPresetAvatars(initials), [initials])

  const handleUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage(t(language, 'uploadImageOnly'))
      return
    }
    if (file.size > 1024 * 1024 * 1.5) {
      setMessage(t(language, 'uploadTooLarge'))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const avatar = String(reader.result || '')
      actions.setProfileAvatar(avatar)
      setMessage(t(language, 'avatarUpdated'))
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="space-y-4">
      <h2 className="text-3xl font-bold">{t(language, 'profile')}</h2>
      <p className="text-base text-slate-600 dark:text-slate-300">{t(language, 'profileIntro')}</p>

      <article className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <img
            src={state.user.avatar || presetAvatars[0]}
            alt={`${state.user.name} avatar`}
            className="h-16 w-16 rounded-full border border-slate-300 object-cover dark:border-slate-600"
          />
          <div>
            <h3 className="text-lg font-semibold">{state.user.name}</h3>
            {state.user.email ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{state.user.email}</p>
            ) : state.user.phone ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{state.user.phone}</p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t(language, 'offlineLearner')}</p>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-sm font-medium">{t(language, 'profilePhoto')}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {presetAvatars.map((avatar, index) => (
              <button
                key={`preset-${index}`}
                type="button"
                onClick={() => {
                  actions.setProfileAvatar(avatar)
                  setMessage(t(language, 'avatarPresetSelected'))
                }}
                className="rounded-full border border-slate-300 p-0.5 transition hover:scale-105 dark:border-slate-600"
                title={`Avatar ${index + 1}`}
              >
                <img src={avatar} alt={`Preset avatar ${index + 1}`} className="h-10 w-10 rounded-full" />
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              {t(language, 'uploadFromGallery')}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={() => {
                actions.setProfileAvatar('')
                setMessage(t(language, 'avatarReset'))
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600"
            >
              {t(language, 'resetAvatar')}
            </button>
          </div>
          {message ? <p className="mt-2 text-xs text-slate-500">{message}</p> : null}
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Metric title={t(language, 'completedChapters')} value={`${stats.completedChapterCount}/${stats.totalChapters}`} />
          <Metric title={t(language, 'skillPercentage')} value={`${stats.skillPercentage}%`} />
          <Metric title={t(language, 'quizAverage')} value={`${stats.quizAverage}%`} />
          <Metric title={t(language, 'practiceStreak')} value={`${state.streak} ${t(language, 'days')}`} />
          <Metric title={t(language, 'completedProjects')} value={`${state.completedProjects.length}`} />
          <Metric title={t(language, 'studyHours')} value={`${state.studyHours} hrs`} />
        </div>
      </article>
    </section>
  )
}

function getInitials(name) {
  const normalized = String(name || 'Learner').trim()
  const parts = normalized.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'L'
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

function svgAvatarData({ bgA, bgB, fg, initials }) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${bgA}' />
        <stop offset='100%' stop-color='${bgB}' />
      </linearGradient>
    </defs>
    <rect width='120' height='120' rx='60' fill='url(#g)' />
    <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' fill='${fg}' font-family='Inter, Arial, sans-serif' font-size='40' font-weight='700'>${initials}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function createPresetAvatars(initials) {
  return [
    svgAvatarData({ bgA: '#2563eb', bgB: '#4f46e5', fg: '#ffffff', initials }),
    svgAvatarData({ bgA: '#db2777', bgB: '#7c3aed', fg: '#ffffff', initials }),
    svgAvatarData({ bgA: '#059669', bgB: '#0ea5e9', fg: '#ffffff', initials }),
    svgAvatarData({ bgA: '#f59e0b', bgB: '#ef4444', fg: '#ffffff', initials }),
    svgAvatarData({ bgA: '#0f172a', bgB: '#334155', fg: '#f8fafc', initials }),
    svgAvatarData({ bgA: '#0891b2', bgB: '#22c55e', fg: '#ffffff', initials }),
  ]
}

function Metric({ title, value }) {
  return (
    <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <p className="text-xs uppercase text-slate-500">{title}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  )
}
