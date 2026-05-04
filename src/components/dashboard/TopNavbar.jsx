export default function TopNavbar({ title, menu }) {
  return (
    <header className="sticky top-0 z-20 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-sm font-semibold text-slate-100 md:text-base">{title}</h1>
        <nav className="flex flex-wrap gap-2">
          {menu.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200 hover:border-violet-400/60 hover:bg-white/5"
            >
              {item}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
