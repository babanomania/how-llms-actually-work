// Shared, mobile-first UI primitives used by the deep-dive sections.
// Accent classes are written as full literals so Tailwind's JIT detects them.

export const ACCENTS = {
  blue:    { text: 'text-blue-400',    badgeBg: 'bg-blue-500/20',    badgeBorder: 'border-blue-500/30',    cardBg: 'bg-blue-500/5',    cardBorder: 'border-blue-500/20',    hex: '#3b82f6' },
  violet:  { text: 'text-violet-400',  badgeBg: 'bg-violet-500/20',  badgeBorder: 'border-violet-500/30',  cardBg: 'bg-violet-500/5',  cardBorder: 'border-violet-500/20',  hex: '#8b5cf6' },
  red:     { text: 'text-red-400',     badgeBg: 'bg-red-500/20',     badgeBorder: 'border-red-500/30',     cardBg: 'bg-red-500/5',     cardBorder: 'border-red-500/20',     hex: '#ef4444' },
  cyan:    { text: 'text-cyan-400',    badgeBg: 'bg-cyan-500/20',    badgeBorder: 'border-cyan-500/30',    cardBg: 'bg-cyan-500/5',    cardBorder: 'border-cyan-500/20',    hex: '#06b6d4' },
  emerald: { text: 'text-emerald-400', badgeBg: 'bg-emerald-500/20', badgeBorder: 'border-emerald-500/30', cardBg: 'bg-emerald-500/5', cardBorder: 'border-emerald-500/20', hex: '#10b981' },
  yellow:  { text: 'text-yellow-400',  badgeBg: 'bg-yellow-500/20',  badgeBorder: 'border-yellow-500/30',  cardBg: 'bg-yellow-500/5',  cardBorder: 'border-yellow-500/20',  hex: '#eab308' },
  fuchsia: { text: 'text-fuchsia-400', badgeBg: 'bg-fuchsia-500/20', badgeBorder: 'border-fuchsia-500/30', cardBg: 'bg-fuchsia-500/5', cardBorder: 'border-fuchsia-500/20', hex: '#d946ef' },
  sky:     { text: 'text-sky-400',     badgeBg: 'bg-sky-500/20',     badgeBorder: 'border-sky-500/30',     cardBg: 'bg-sky-500/5',     cardBorder: 'border-sky-500/20',     hex: '#0ea5e9' },
  lime:    { text: 'text-lime-400',    badgeBg: 'bg-lime-500/20',    badgeBorder: 'border-lime-500/30',    cardBg: 'bg-lime-500/5',    cardBorder: 'border-lime-500/20',    hex: '#84cc16' },
  purple:  { text: 'text-purple-400',  badgeBg: 'bg-purple-500/20',  badgeBorder: 'border-purple-500/30',  cardBg: 'bg-purple-500/5',  cardBorder: 'border-purple-500/20',  hex: '#a855f7' },
  indigo:  { text: 'text-indigo-400',  badgeBg: 'bg-indigo-500/20',  badgeBorder: 'border-indigo-500/30',  cardBg: 'bg-indigo-500/5',  cardBorder: 'border-indigo-500/20',  hex: '#6366f1' },
}

export function SectionShell({ children, last = false }) {
  return (
    <section className={`px-4 sm:px-6 lg:px-8 py-12 sm:py-16 ${last ? '' : 'border-b border-slate-800/50'}`}>
      <div className="max-w-4xl mx-auto">{children}</div>
    </section>
  )
}

export function SectionHeader({ num, title, accent, children }) {
  const a = ACCENTS[accent]
  return (
    <div className="mb-8 sm:mb-10">
      <div className="flex items-center gap-3 mb-3">
        <span className={`w-8 h-8 rounded-lg ${a.badgeBg} border ${a.badgeBorder} flex items-center justify-center ${a.text} font-bold text-xs flex-shrink-0`}>
          {num}
        </span>
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      </div>
      <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">{children}</p>
    </div>
  )
}

export function Panel({ label, right, children, className = '' }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">{label}</p>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

export function ConceptCards({ accent, cards }) {
  const a = ACCENTS[accent]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
      {cards.map(c => (
        <div key={c.title} className={`${a.cardBg} border ${a.cardBorder} rounded-xl p-4`}>
          <p className={`${a.text} font-semibold text-sm mb-1.5`}>{c.title}</p>
          <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
  )
}

// A reusable play / pause / reset control row.
export function PlaybackBar({ playing, onToggle, onReset, accent, children }) {
  const a = ACCENTS[accent]
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all active:scale-95"
        style={{ background: a.hex }}
      >
        {playing ? (
          <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg> Pause</>
        ) : (
          <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> Play</>
        )}
      </button>
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        Reset
      </button>
      {children}
    </div>
  )
}
