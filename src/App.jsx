import { useState, useEffect, useRef } from 'react'
import TokenizationSection from './sections/TokenizationSection'
import EmbeddingsSection from './sections/EmbeddingsSection'
import PositionalEncodingSection from './sections/PositionalEncodingSection'
import AttentionSection from './sections/AttentionSection'
import MultiHeadSection from './sections/MultiHeadSection'
import FeedForwardSection from './sections/FeedForwardSection'
import ResidualSection from './sections/ResidualSection'
import NextTokenSection from './sections/NextTokenSection'
import ArchitectureSection from './sections/ArchitectureSection'

const SECTIONS = [
  { id: 'tokenization',        label: 'Tokenization',          color: 'text-blue-400',   num: '01' },
  { id: 'embeddings',          label: 'Embeddings',            color: 'text-violet-400', num: '02' },
  { id: 'positional-encoding', label: 'Positional Encoding',   color: 'text-green-400',  num: '03' },
  { id: 'attention',           label: 'Attention',             color: 'text-amber-400',  num: '04' },
  { id: 'multi-head',          label: 'Multi-Head Attention',  color: 'text-pink-400',   num: '05' },
  { id: 'feed-forward',        label: 'Feed-Forward Network',  color: 'text-orange-400', num: '06' },
  { id: 'residual',            label: 'Residual Stream',       color: 'text-teal-400',   num: '07' },
  { id: 'next-token',          label: 'Next-Token Prediction', color: 'text-rose-400',   num: '08' },
  { id: 'architecture',        label: 'Full Architecture',     color: 'text-indigo-400', num: '09' },
]

export default function App() {
  const [active, setActive] = useState('tokenization')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const refs = useRef({})

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-35% 0px -55% 0px' }
    )
    Object.values(refs.current).forEach(r => r && obs.observe(r))
    return () => obs.disconnect()
  }, [])

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full z-40 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-hidden"
        style={{ width: sidebarOpen ? 240 : 0 }}
      >
        <div style={{ width: 240 }} className="flex flex-col h-full">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              LLM
            </div>
            <span className="text-sm font-semibold text-slate-200 whitespace-nowrap">How LLMs Work</span>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <p className="text-xs text-slate-600 uppercase tracking-widest px-3 mb-2">Concepts</p>
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left mb-0.5 ${
                  active === s.id
                    ? 'bg-slate-800 text-slate-100 font-medium'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className={`text-xs font-mono font-bold flex-shrink-0 w-6 ${active === s.id ? s.color : 'text-slate-700'}`}>
                  {s.num}
                </span>
                <span className="truncate">{s.label}</span>
                {active === s.id && <span className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.color.replace('text-', 'bg-')}`} />}
              </button>
            ))}
          </nav>

          <div className="px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-600">Interactive · Visual · Educational</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 transition-all duration-300 min-w-0" style={{ marginLeft: sidebarOpen ? 240 : 0 }}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/60 px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(v => !v)} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm text-slate-400 font-medium">How LLMs Actually Work — Interactive Guide</span>
          <div className="ml-auto flex items-center gap-3">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`hidden lg:block text-xs transition-colors ${active === s.id ? s.color : 'text-slate-700 hover:text-slate-500'}`}
              >
                {s.num}
              </button>
            ))}
          </div>
        </header>

        {/* Hero */}
        <section className="px-8 pt-16 pb-12 border-b border-slate-800/50">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              9 interactive concepts
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              How LLMs<br />
              <span className="text-indigo-400">Actually Work</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
              Stop reading about transformers. Start playing with them.
              Every concept below has a live demo — type, click, drag, and build real intuition.
            </p>
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-slate-700 ${s.color}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* All sections */}
        {[
          ['tokenization',        <TokenizationSection />],
          ['embeddings',          <EmbeddingsSection />],
          ['positional-encoding', <PositionalEncodingSection />],
          ['attention',           <AttentionSection />],
          ['multi-head',          <MultiHeadSection />],
          ['feed-forward',        <FeedForwardSection />],
          ['residual',            <ResidualSection />],
          ['next-token',          <NextTokenSection />],
          ['architecture',        <ArchitectureSection />],
        ].map(([id, Component]) => (
          <div key={id} id={id} ref={el => refs.current[id] = el}>
            {Component}
          </div>
        ))}

        <footer className="border-t border-slate-800/50 px-8 py-8 text-center text-sm text-slate-600">
          <p>Built to make transformer internals tangible. Based on the guide at <span className="text-slate-500">0xkato.xyz</span></p>
        </footer>
      </main>
    </div>
  )
}
