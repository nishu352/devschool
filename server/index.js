import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

const dailyPlans = [
  {
    lesson: 'HTML Basics',
    exercise: 'Create a semantic resume page using header, section, and footer.',
    miniProject: 'Responsive profile landing page.',
    quiz: '5 questions on semantic tags.',
  },
  {
    lesson: 'JavaScript DOM',
    exercise: 'Make a dark mode toggle with event listeners.',
    miniProject: 'Interactive FAQ accordion.',
    quiz: 'DOM selectors and events quick quiz.',
  },
]

const fallbackTutor = (question, language = 'en') => {
  const isHindi = language === 'hi'
  const isHinglish = language === 'hinglish'

  if (/react/i.test(question)) {
    if (isHindi) return 'React reusable components और state-driven rendering से UI बनाता है। Props, state, और effects से शुरुआत करें।'
    if (isHinglish) return 'React reusable components aur state-driven rendering se UI banata hai. Props, state, aur effects se start karo.'
    return 'React builds UIs with reusable components and state-driven rendering. Start with props, state, and effects.'
  }
  if (/javascript|js/i.test(question)) {
    if (isHindi) return 'JavaScript में पहले variables, functions, arrays, objects, और DOM events पर मजबूत पकड़ बनाएं।'
    if (isHinglish) return 'JavaScript me pehle variables, functions, arrays, objects, aur DOM events strong karo.'
    return 'In JavaScript, focus first on variables, functions, arrays, objects, and DOM events before advanced topics.'
  }
  if (isHindi) return 'समस्या को 3 भागों में तोड़ें: concept, syntax, और mini example। अपना code भेजें, मैं step-by-step fix बताऊंगा।'
  if (isHinglish) return 'Problem ko 3 parts me todo: concept, syntax, aur mini example. Code bhejo, mai step-by-step fix dunga.'
  return 'Break your problem into: concept, syntax, and mini example. If you share code, I can give a step-by-step fix.'
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'devguru-api' })
})

app.get('/api/daily-plan', (_, res) => {
  const index = new Date().getDate() % dailyPlans.length
  res.json(dailyPlans[index])
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
  if (!question) {
    return res.status(400).json({ answer: 'Please ask a coding question.' })
  }
  res.json({ answer: fallbackTutor(question, language) })
})

app.listen(port, () => {
  console.log(`DevSchool Pro API running on http://localhost:${port}`)
})
