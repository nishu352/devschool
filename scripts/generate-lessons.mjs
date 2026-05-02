import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const contentRoot = path.join(root, 'src', 'content')

const outlines = {
  html: [
    'Introduction to HTML and the Browser',
    'HTML Document Structure and DOCTYPE',
    'Headings and Paragraphs',
    'Text Formatting and Semantics',
    'Links and Navigation',
    'Images and Figure Captions',
    'Lists and Nested Lists',
    'Tables and Table Accessibility',
    'Forms and Input Types',
    'Form Validation Patterns',
    'Audio and Video Elements',
    'Semantic Layout Elements',
    'Block vs Inline Elements',
    'Meta Tags and SEO Basics',
    'Special Characters and Entities',
    'Comments and Code Readability',
    'Iframes and Embedded Content',
    'Data Attributes and Microdata',
    'Accessibility Basics in HTML',
    'Deprecated Tags and Modern Replacements',
    'HTML Best Practices',
    'Build a Multi-Section Landing Page',
  ],
  css: [
    'Introduction to CSS',
    'Selectors and Specificity',
    'Class, ID, and Attribute Selectors',
    'Combinators and Pseudo Classes',
    'Pseudo Elements',
    'Colors and Units',
    'Typography and Font Systems',
    'The Box Model',
    'Display, Visibility, and Positioning',
    'Margin, Padding, and Border',
    'Backgrounds and Gradients',
    'Shadows and Effects',
    'Flexbox Fundamentals',
    'Advanced Flexbox Patterns',
    'CSS Grid Fundamentals',
    'Responsive Grid Layouts',
    'Media Queries and Breakpoints',
    'Transitions and Timing Functions',
    'Keyframe Animations',
    'Transforms 2D and 3D',
    'CSS Variables and Theming',
    'Utility First CSS Strategy',
    'Forms and UI Component Styling',
    'Dark Mode with CSS',
    'Performance and Maintainability',
    'Debugging CSS Layout Issues',
    'Build a Responsive Dashboard Layout',
  ],
  javascript: [
    'Introduction to JavaScript',
    'Variables and Data Types',
    'Operators and Expressions',
    'Conditionals and Control Flow',
    'Loops and Iteration',
    'Functions and Scope',
    'Arrow Functions',
    'Arrays Basics',
    'Array Methods Map Filter Reduce',
    'Objects and Object Patterns',
    'Destructuring and Spread Syntax',
    'Template Literals',
    'Error Handling with Try Catch',
    'DOM Selection and Traversal',
    'DOM Manipulation',
    'Event Handling Fundamentals',
    'Event Delegation',
    'Timers and Scheduling',
    'Modules and Imports',
    'Asynchronous JavaScript Basics',
    'Promises in Depth',
    'Async Await Patterns',
    'Fetch API and HTTP Requests',
    'Working with JSON Data',
    'LocalStorage and SessionStorage',
    'Form Handling and Validation',
    'Classes and OOP Basics',
    'Prototypes and Inheritance',
    'Closures and Lexical Scope',
    'This Keyword and Binding',
    'Regular Expressions',
    'Date and Time APIs',
    'Performance Optimization',
    'Debugging and DevTools Workflow',
    'Testing Basics for JavaScript',
    'Build a Feature Rich Todo App',
  ],
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function pickLevel(index, total) {
  const ratio = (index + 1) / total
  if (ratio <= 0.3) return 'beginner'
  if (ratio <= 0.6) return 'intermediate'
  if (ratio <= 0.85) return 'advanced'
  return 'expert'
}

function lessonFor(course, title, index, total) {
  const number = index + 1
  const level = pickLevel(index, total)
  const slug = `${String(number).padStart(2, '0')}-${slugify(title)}`
  const readableCourse = course === 'javascript' ? 'JavaScript' : course.toUpperCase()
  const estimate = `${10 + (index % 4) * 5} min`

  return {
    id: `${course}-${number}`,
    title,
    slug,
    category: course,
    chapterNumber: number,
    level,
    estimatedTime: estimate,
    theory: {
      english: `${title} teaches ${readableCourse} concepts in a practical sequence. This lesson explains not only how the syntax works, but also when to use it in real projects. You will learn patterns that reduce bugs, improve readability, and make your code easier to maintain in production.`,
      hindi: `${title} lesson me ${readableCourse} concept ko practical tarike se samjhaya gaya hai. Isme sirf syntax nahi, balki real project me is feature ko kab aur kaise use karna hai, ye bhi clear kiya gaya hai. Focus clean code, kam bugs, aur maintainable approach par hai.`,
      hinglish: `${title} lesson me ${readableCourse} ka concept step-by-step clear kiya gaya hai. Sirf syntax yaad nahi karna, balki real project me kab use karna hai ye samajhna hai. Goal hai clean code, fewer bugs, aur better maintainability.`,
    },
    examples: [
      {
        title: 'Basic Example',
        code:
          course === 'html'
            ? `<section>\n  <h2>${title}</h2>\n  <p>Learning ${readableCourse} in DevSchool Pro.</p>\n</section>`
            : course === 'css'
              ? `.lesson-card {\n  border: 1px solid #d1d5db;\n  padding: 1rem;\n  border-radius: 0.75rem;\n}`
              : `function runLesson${number}() {\n  console.log('${title}');\n}\nrunLesson${number}();`,
        explanation: `Start with the minimal version first, then layer improvements such as semantics, accessibility, and reusable structure.`,
      },
      {
        title: 'Real World Use Case',
        code:
          course === 'html'
            ? `<article>\n  <header><h3>Product Card</h3></header>\n  <p>Used in ecommerce listings.</p>\n</article>`
            : course === 'css'
              ? `.product-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));\n  gap: 1rem;\n}`
              : `const items = ['read', 'practice', 'build'];\nconst plan = items.map((step, i) => ({ id: i + 1, step }));\nconsole.log(plan);`,
        explanation: `This pattern is frequently used in dashboards, course pages, and interactive products where structure and clarity matter.`,
      },
    ],
    exercises: [
      {
        prompt: `Create a mini task using ${title}.`,
        expectedOutcome: 'Code runs correctly and follows clean structure.',
      },
      {
        prompt: `Refactor one example to improve readability and accessibility.`,
        expectedOutcome: 'Better naming, better structure, and fewer mistakes.',
      },
    ],
    quiz: [
      {
        question: `What is the main goal of ${title}?`,
        options: ['Visual design only', 'Cleaner structure and reliable behavior', 'Database migration', 'Server deployment'],
        answer: 1,
        explanation:
          'The lesson focuses on writing reliable and maintainable code patterns, not only visual or infrastructure concerns.',
      },
      {
        question: 'What should you prioritize first while learning?',
        options: ['Memorizing all syntax', 'Building tiny practical examples', 'Skipping fundamentals', 'Using random hacks'],
        answer: 1,
        explanation: 'Small practical examples build intuition and transferable understanding faster than rote memorization.',
      },
      {
        question: 'Which approach is better for production quality?',
        options: ['Copy without understanding', 'Use deprecated patterns', 'Write readable tested code', 'Ignore edge cases'],
        answer: 2,
        explanation: 'Readable code with clear intent and validation is more scalable and safer for real projects.',
      },
    ],
    summary: `${title} complete hua. Aapne concept, practical usage, aur mistakes avoid karne ka clear workflow seekh liya.`,
  }
}

fs.mkdirSync(contentRoot, { recursive: true })

for (const [course, chapters] of Object.entries(outlines)) {
  const dir = path.join(contentRoot, course)
  fs.mkdirSync(dir, { recursive: true })
  chapters.forEach((title, index) => {
    const payload = lessonFor(course, title, index, chapters.length)
    const filename = path.join(dir, `${String(index + 1).padStart(2, '0')}-${slugify(title)}.json`)
    fs.writeFileSync(filename, JSON.stringify(payload, null, 2), 'utf8')
  })
}

console.log('Generated lessons:', Object.entries(outlines).map(([k, v]) => `${k}:${v.length}`).join(', '))
