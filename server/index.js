import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const corsOrigin = process.env.CORS_ORIGIN || '*'
app.use(cors({ origin: corsOrigin }))
app.use(express.json())

const dashboardTable = process.env.DASHBOARD_TABLE || 'dashboard_overview'
const adminSupabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null

const dailyPlanCatalog = {
  beginner: [
    {
      lesson: 'HTML Semantic Structure',
      exercise: 'Build a semantic blog page using header, main, section, article, and footer.',
      miniProject: 'Personal profile card with responsive layout.',
      quiz: '6 questions on semantic tags and accessibility basics.',
    },
    {
      lesson: 'CSS Flexbox Foundations',
      exercise: 'Create a navbar and hero section aligned with flex containers.',
      miniProject: 'Responsive landing page top section.',
      quiz: '8 questions on main-axis, cross-axis, and spacing.',
    },
    {
      lesson: 'JavaScript Variables and Functions',
      exercise: 'Write utility functions for formatting names and prices.',
      miniProject: 'Simple calculator with clean function structure.',
      quiz: '7 questions on scopes, params, and return values.',
    },
  ],
  intermediate: [
    {
      lesson: 'DOM Event Patterns',
      exercise: 'Implement event delegation for a dynamic todo list.',
      miniProject: 'Interactive FAQ accordion with keyboard support.',
      quiz: '10 questions on bubbling, capturing, and delegation.',
    },
    {
      lesson: 'Async JavaScript and Fetch',
      exercise: 'Fetch posts from an API and handle loading/error states.',
      miniProject: 'Weather widget with retry and fallback UI.',
      quiz: '8 questions on promises, async/await, and error handling.',
    },
    {
      lesson: 'State Management in React',
      exercise: 'Refactor a form using controlled components.',
      miniProject: 'Task board with filters and persisted state.',
      quiz: '10 questions on state flow and component composition.',
    },
  ],
  advanced: [
    {
      lesson: 'Performance Optimization',
      exercise: 'Audit rendering bottlenecks and optimize with memoization.',
      miniProject: 'Fast searchable catalog with debounced input.',
      quiz: '10 questions on profiling and optimization trade-offs.',
    },
    {
      lesson: 'Auth and Access Control',
      exercise: 'Protect routes and handle expired sessions gracefully.',
      miniProject: 'Role-aware dashboard shell with guarded actions.',
      quiz: '9 questions on tokens, sessions, and auth flows.',
    },
    {
      lesson: 'System Design for Web Apps',
      exercise: 'Design API contracts and data models for a learning app.',
      miniProject: 'Scalable notes app architecture document.',
      quiz: '8 questions on caching, queues, and consistency.',
    },
  ],
}

const normalizeLevel = (level) => {
  if (!level) return 'beginner'
  const candidate = String(level).toLowerCase()
  if (candidate === 'expert') return 'advanced'
  return dailyPlanCatalog[candidate] ? candidate : 'beginner'
}

const hashCode = (value) =>
  String(value)
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function loadQuizBankFromContent() {
  const contentRoot = path.resolve(__dirname, '../src/content')
  if (!fs.existsSync(contentRoot)) {
    return {}
  }

  const bank = {}
  const categories = fs.readdirSync(contentRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory())

  for (const category of categories) {
    const courseId = category.name.toLowerCase()
    const folderPath = path.join(contentRoot, category.name)
    const files = fs.readdirSync(folderPath).filter((name) => name.endsWith('.json'))
    const collected = []

    for (const fileName of files) {
      try {
        const filePath = path.join(folderPath, fileName)
        const raw = fs.readFileSync(filePath, 'utf8')
        const lesson = JSON.parse(raw)
        const lessonQuiz = Array.isArray(lesson.quiz) ? lesson.quiz : []
        for (let index = 0; index < lessonQuiz.length; index += 1) {
          const q = lessonQuiz[index]
          if (!q || !q.question || !Array.isArray(q.options) || typeof q.answer !== 'number') continue
          collected.push({
            id: `${lesson.id || lesson.slug || fileName}-q${index + 1}`,
            courseId,
            lessonId: lesson.id || lesson.slug || fileName,
            chapterSlug: lesson.slug || null,
            chapterTitle: lesson.title || '',
            question: {
              en: q.question,
              hi: q.question,
              hinglish: q.question,
            },
            options: q.options,
            answer: q.answer,
            explanation: {
              en: q.explanation || '',
              hi: q.explanation || '',
              hinglish: q.explanation || '',
            },
          })
        }
      } catch (error) {
        console.error(`Failed to parse quiz content from ${fileName}:`, error.message)
      }
    }
    bank[courseId] = collected
  }
  return bank
}

let quizBank = loadQuizBankFromContent()

function buildDashboardOverview({
  name = 'Learner',
  studyPoints = 0,
  streak = 0,
  accuracy = 0,
  completedChapters = 0,
  xp = 0,
} = {}) {
  const courseIds = Object.keys(quizBank)
  const courseSeed = `${name}:${studyPoints}:${streak}:${xp}`
  const courses = (courseIds.length ? courseIds : ['html', 'css', 'javascript'])
    .slice(0, 3)
    .map((id, index) => {
      const progress = Math.min(96, Math.max(12, 35 + ((Math.abs(hashCode(`${courseSeed}:${id}`)) + index * 7) % 55)))
      const title = id.toUpperCase()
      const gradients = ['from-orange-500 to-amber-400', 'from-cyan-500 to-blue-500', 'from-violet-500 to-fuchsia-500']
      return { id, title, progress, gradient: gradients[index % gradients.length] }
    })

  return {
    profile: {
      name,
      level: `Level ${Math.max(1, Math.floor(xp / 120) + 1)} • Full Stack Track`,
    },
    topMenu: ['Learn', 'Practice', 'Assess', 'Strict Mode', 'Earn Rewards'],
    stats: [
      { id: 'lessons', label: 'Lessons Completed', value: `${completedChapters}`, delta: 'Synced from progress' },
      { id: 'points', label: 'Study Points', value: `${studyPoints}`, delta: 'Updated in real-time' },
      { id: 'streak', label: 'Current Streak', value: `${streak} Days`, delta: 'Keep consistency' },
      { id: 'accuracy', label: 'Accuracy', value: `${Math.max(0, Math.min(100, accuracy))}%`, delta: 'Based on assessments' },
    ],
    continueLearning: {
      title: `${courses[0]?.title || 'HTML'} Mastery Path`,
      subtitle: 'Next module is unlocked from your current progress.',
      progress: courses[0]?.progress || 45,
    },
    challenge: {
      title: 'Build a Login Form',
      subtitle: 'Ship a clean responsive auth form with validation.',
    },
    courses,
    upcomingAssessments: [
      { id: 1, title: `${courses[0]?.title || 'HTML'} Timed Assessment`, time: 'Today • 7:00 PM' },
      { id: 2, title: `${courses[1]?.title || 'CSS'} Practice Test`, time: 'Tomorrow • 6:30 PM' },
      { id: 3, title: `${courses[2]?.title || 'JAVASCRIPT'} Quiz`, time: 'This week • 8:00 PM' },
    ],
    achievements: [
      { id: 1, title: 'Focus Hero', detail: `Current streak: ${streak} days` },
      { id: 2, title: 'Points Builder', detail: `${studyPoints} points earned` },
      { id: 3, title: 'Skill Growth', detail: `${xp} XP collected` },
    ],
  }
}

function getRandomQuiz({ courseId = 'html', count = 8 }) {
  const available = quizBank[courseId] || []
  const safeCount = Math.min(Math.max(Number(count) || 8, 1), 20)
  return shuffle(available).slice(0, safeCount)
}

const planForToday = ({ level = 'beginner', language = 'en', focus = '' } = {}) => {
  const now = new Date()
  const dateKey = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`
  const normalizedLevel = normalizeLevel(level)
  const source = dailyPlanCatalog[normalizedLevel]
  const index = Math.abs(hashCode(`${dateKey}:${normalizedLevel}:${language}:${focus}`)) % source.length
  const base = source[index]

  const focusText = focus ? ` Focus area: ${focus}.` : ''
  return {
    ...base,
    level: normalizedLevel,
    language,
    generatedAt: now.toISOString(),
    lesson: `${base.lesson}${focusText}`,
  }
}

const fallbackTutor = ({ question, language = 'en', level = 'beginner' }) => {
  const hintByTopic = [
    { pattern: /react|component|hook/i, tip: 'Break UI into reusable components and track state transitions before coding.' },
    { pattern: /javascript|js|function|array|object/i, tip: 'Start with a tiny input/output example and test each function in isolation.' },
    { pattern: /css|flex|grid|layout/i, tip: 'Use browser devtools to inspect computed styles and reduce layout issues incrementally.' },
    { pattern: /api|fetch|axios|request/i, tip: 'Handle loading, success, and error explicitly and validate payload shape before rendering.' },
  ]
  const topic = hintByTopic.find((item) => item.pattern.test(question))
  const defaultTip = 'Split your problem into concept, syntax, and one runnable example.'
  const levelPlan = planForToday({ level, language, focus: question.slice(0, 24) })
  return `Quick guide: ${topic?.tip || defaultTip} Next lesson suggestion: ${levelPlan.lesson}. Practice: ${levelPlan.exercise}`
}

async function callOpenAIChat({ question, language, level }) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return null
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a concise coding tutor. Respond in plain text with clear explanation and one small example. Keep response under 180 words.',
        },
        {
          role: 'user',
          content: `Language preference: ${language}. Learner level: ${level}. Question: ${question}`,
        },
      ],
      temperature: 0.5,
    }),
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI API failed (${response.status}): ${body}`)
  }
  const json = await response.json()
  return json.choices?.[0]?.message?.content?.trim() || null
}

async function callOpenRouterChat({ question, language, level }) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) return null
  const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': process.env.OPENROUTER_REFERER || 'http://localhost:5173',
      'X-Title': 'DevSchool Pro Tutor',
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are a concise coding tutor. Respond in plain text with clear explanation and one small example. Keep response under 180 words.',
        },
        {
          role: 'user',
          content: `Language preference: ${language}. Learner level: ${level}. Question: ${question}`,
        },
      ],
      temperature: 0.5,
    }),
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenRouter API failed (${response.status}): ${body}`)
  }
  const json = await response.json()
  return json.choices?.[0]?.message?.content?.trim() || null
}

async function getTutorAnswer({ question, language, level }) {
  const provider = (process.env.LLM_PROVIDER || '').toLowerCase()
  if (provider === 'openai') {
    return (await callOpenAIChat({ question, language, level })) || fallbackTutor({ question, language, level })
  }
  if (provider === 'openrouter') {
    return (await callOpenRouterChat({ question, language, level })) || fallbackTutor({ question, language, level })
  }

  // Auto mode: try OpenRouter first, then OpenAI, then deterministic fallback.
  const viaOpenRouter = await callOpenRouterChat({ question, language, level }).catch(() => null)
  if (viaOpenRouter) return viaOpenRouter
  const viaOpenAI = await callOpenAIChat({ question, language, level }).catch(() => null)
  if (viaOpenAI) return viaOpenAI
  return fallbackTutor({ question, language, level })
}

app.get('/api/health', (_, res) => {
  res.json({
    ok: true,
    service: 'devguru-api',
    dynamic: true,
    llmProvider:
      process.env.LLM_PROVIDER ||
      (process.env.OPENROUTER_API_KEY ? 'openrouter(auto)' : process.env.OPENAI_API_KEY ? 'openai(auto)' : 'fallback'),
  })
})

app.get('/api/daily-plan', (req, res) => {
  const level = String(req.query.level || 'beginner')
  const language = String(req.query.language || 'en').toLowerCase()
  const focus = String(req.query.focus || '')
  res.json(planForToday({ level, language, focus }))
})

app.get('/api/quiz/random', (req, res) => {
  const courseId = String(req.query.courseId || 'html').toLowerCase()
  const count = Number(req.query.count || 8)
  const questions = getRandomQuiz({ courseId, count })
  return res.json({
    courseId,
    count: questions.length,
    totalAvailable: (quizBank[courseId] || []).length,
    questions,
  })
})

app.get('/api/dashboard/overview', async (req, res) => {
  const userId = String(req.query.userId || '').trim()
  const name = String(req.query.name || 'Learner').trim()
  const studyPoints = Number(req.query.studyPoints || 0)
  const streak = Number(req.query.streak || 0)
  const accuracy = Number(req.query.accuracy || 0)
  const completedChapters = Number(req.query.completedChapters || 0)
  const xp = Number(req.query.xp || 0)

  const fallback = buildDashboardOverview({
    name,
    studyPoints,
    streak,
    accuracy,
    completedChapters,
    xp,
  })

  if (!adminSupabase || !userId) return res.json(fallback)

  const { data, error } = await adminSupabase
    .from(dashboardTable)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return res.json(fallback)

  return res.json(
    buildDashboardOverview({
      name: data.name || fallback.profile.name,
      studyPoints: Number(data.study_points ?? studyPoints),
      streak: Number(data.streak ?? streak),
      accuracy: Number(data.accuracy ?? accuracy),
      completedChapters: Number(data.completed_chapters ?? completedChapters),
      xp: Number(data.xp ?? xp),
    }),
  )
})

app.post('/api/dashboard/overview/sync', async (req, res) => {
  const userId = String(req.body?.userId || '').trim()
  if (!adminSupabase || !userId) {
    return res.json({ ok: false, persisted: false, reason: 'missing_db_or_user' })
  }

  const payload = {
    user_id: userId,
    name: String(req.body?.name || 'Learner'),
    study_points: Number(req.body?.studyPoints || 0),
    streak: Number(req.body?.streak || 0),
    accuracy: Number(req.body?.accuracy || 0),
    completed_chapters: Number(req.body?.completedChapters || 0),
    xp: Number(req.body?.xp || 0),
    updated_at: new Date().toISOString(),
  }

  const { error } = await adminSupabase.from(dashboardTable).upsert(payload, { onConflict: 'user_id' })
  if (error) {
    return res.status(500).json({ ok: false, persisted: false, error: error.message })
  }
  return res.json({ ok: true, persisted: true })
})

app.post('/api/quiz/submit', (req, res) => {
  const score = Number(req.body?.score || 0)
  res.json({
    status: score >= 60 ? 'pass' : 'retry',
    feedback: score >= 60 ? 'Great consistency. Move to the next lesson.' : 'Review basics and retry quiz.',
  })
})

app.post('/api/tutor', (req, res) => {
  const question = String(req.body?.question || '').trim()
  const language = String(req.body?.language || 'en').toLowerCase()
  const level = String(req.body?.level || 'beginner').toLowerCase()
  if (!question) {
    return res.status(400).json({ answer: 'Please ask a coding question.' })
  }
  getTutorAnswer({ question, language, level })
    .then((answer) => res.json({ answer }))
    .catch((error) =>
      res.status(500).json({
        answer: 'Tutor API is temporarily unavailable. Please try again.',
        error: error.message,
      }),
    )
})

app.listen(port, () => {
  quizBank = loadQuizBankFromContent()
  console.log(`DevSchool Pro API running on http://localhost:${port}`)
})
