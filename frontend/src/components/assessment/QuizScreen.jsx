function formatTimer(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export default function QuizScreen({
  autoAdvanceRemaining,
  currentIndex,
  deductions,
  onQuit,
  onSelectOption,
  question,
  selectedOption,
  subject,
  timeRemaining,
  totalQuestions,
  violations,
}) {
  const progress = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0
  const isLocked = selectedOption !== null && selectedOption !== undefined
  const nextLabel = isLocked
    ? autoAdvanceRemaining > 0
      ? `Next in ${autoAdvanceRemaining}s`
      : 'Preparing next question...'
    : 'Select an option to continue'

  return (
    <section className="space-y-4">
      <header className="glass-card rounded-3xl p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              {subject} Assessment
            </p>
            <h3 className="mt-2 text-2xl font-bold md:text-3xl">
              {currentIndex + 1} of {totalQuestions}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Select one option. Answers stay hidden until the result screen.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[300px]">
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Timer</p>
              <p className="mt-1 text-lg font-semibold">{formatTimer(timeRemaining)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Progress</p>
              <p className="mt-1 text-lg font-semibold">{progress}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Violations</p>
              <p className="mt-1 text-lg font-semibold">{violations}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Deductions</p>
              <p className="mt-1 text-lg font-semibold">{deductions}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <article className="glass-card flex min-h-[62vh] flex-col rounded-[2rem] p-4 pb-28 md:p-8 md:pb-32">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">{subject}</span>
          <span className="rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">Single Choice</span>
        </div>

        <h4 className="mt-6 text-xl font-semibold leading-snug text-slate-900 dark:text-white md:text-3xl">
          {question.question}
        </h4>

        <div className="mt-8 grid gap-3">
          {question.options.map((option, index) => {
            const optionLabel = String.fromCharCode(65 + index)
            const isSelected = selectedOption === index
            const optionClass = isSelected
              ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm dark:bg-blue-950/60 dark:text-blue-100'
              : 'border-slate-200 bg-white/85 text-slate-800 dark:border-slate-700 dark:bg-slate-900/75 dark:text-slate-100'

            return (
              <button
                key={`${question.id}-${optionLabel}`}
                type="button"
                disabled={isLocked}
                onClick={() => onSelectOption(index)}
                className={`w-full rounded-2xl border px-4 py-4 text-left text-base font-medium md:px-5 md:py-5 md:text-lg ${optionClass} ${isLocked && !isSelected ? 'opacity-70' : ''}`}
              >
                <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-current text-sm font-semibold">
                  {optionLabel}
                </span>
                {option}
              </button>
            )
          })}
        </div>
      </article>

      <div className="glass-card sticky bottom-0 rounded-3xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={onQuit}
            className="rounded-2xl border border-rose-300 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-100"
          >
            Quit Assessment
          </button>

          <div className="flex flex-col gap-2 text-right">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {isLocked ? 'Option locked. Moving automatically after 5 seconds.' : 'Select an option to continue.'}
            </p>
            <button
              type="button"
              disabled
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white opacity-70 dark:bg-slate-100 dark:text-slate-900"
            >
              {nextLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
