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
import TrainingSection from './sections/TrainingSection'
import ScalingSection from './sections/ScalingSection'
import RLHFSection from './sections/RLHFSection'
import InContextSection from './sections/InContextSection'
import MoESection from './sections/MoESection'
import KVCacheSection from './sections/KVCacheSection'
import QuantizationSection from './sections/QuantizationSection'
import HallucinationSection from './sections/HallucinationSection'
import BlogContent from './BlogContent'

const GROUPS = [
  {
    part: 'Part I', title: 'The Forward Pass', accent: '#6366f1',
    sections: [
      { id: 'tokenization',        label: 'Tokenization',          num: '01', dot: '#3b82f6', Comp: TokenizationSection },
      { id: 'embeddings',          label: 'Embeddings',            num: '02', dot: '#8b5cf6', Comp: EmbeddingsSection },
      { id: 'positional-encoding', label: 'Positional Encoding',   num: '03', dot: '#22c55e', Comp: PositionalEncodingSection },
      { id: 'attention',           label: 'Attention',             num: '04', dot: '#f59e0b', Comp: AttentionSection },
      { id: 'multi-head',          label: 'Multi-Head Attention',  num: '05', dot: '#ec4899', Comp: MultiHeadSection },
      { id: 'feed-forward',        label: 'Feed-Forward Network',  num: '06', dot: '#f97316', Comp: FeedForwardSection },
      { id: 'residual',            label: 'Residual Stream',       num: '07', dot: '#14b8a6', Comp: ResidualSection },
      { id: 'next-token',          label: 'Next-Token Prediction', num: '08', dot: '#f43f5e', Comp: NextTokenSection },
      { id: 'architecture',        label: 'Full Architecture',     num: '09', dot: '#6366f1', Comp: ArchitectureSection },
    ],
  },
  {
    part: 'Part II', title: 'How Models Learn', accent: '#06b6d4',
    sections: [
      { id: 'training', label: 'Training & Backprop', num: '10', dot: '#ef4444', Comp: TrainingSection },
      { id: 'scaling',  label: 'Scaling Laws',        num: '11', dot: '#06b6d4', Comp: ScalingSection },
    ],
  },
  {
    part: 'Part III', title: 'Base → Assistant', accent: '#10b981',
    sections: [
      { id: 'rlhf',       label: 'RLHF & Alignment',    num: '12', dot: '#10b981', Comp: RLHFSection },
      { id: 'in-context', label: 'In-Context Learning', num: '13', dot: '#eab308', Comp: InContextSection },
    ],
  },
  {
    part: 'Part IV', title: 'Running the Model', accent: '#d946ef',
    sections: [
      { id: 'moe',          label: 'Mixture of Experts', num: '14', dot: '#d946ef', Comp: MoESection },
      { id: 'kv-cache',     label: 'KV Cache & Inference', num: '15', dot: '#0ea5e9', Comp: KVCacheSection },
      { id: 'quantization', label: 'Quantization',       num: '16', dot: '#84cc16', Comp: QuantizationSection },
    ],
  },
  {
    part: 'Part V', title: 'Limitations', accent: '#a855f7',
    sections: [
      { id: 'hallucination', label: 'Why Hallucinations Happen', num: '17', dot: '#a855f7', Comp: HallucinationSection },
    ],
  },
]

const ALL = GROUPS.flatMap(g => g.sections)
const SIDEBAR_W = 264

export default function App() {
  const [active, setActive] = useState('tokenization')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const refs = useRef({})

  // open by default on desktop, closed on mobile
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const apply = () => setSidebarOpen(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-20% 0px -70% 0px' }
    )
    ALL.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const isMobile = () => !window.matchMedia('(min-width: 1024px)').matches
  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (isMobile()) setSidebarOpen(false)
  }

  const activeMeta = ALL.find(s => s.id === active)
  const activeIdx = ALL.findIndex(s => s.id === active)

  return (
    <div className="bg-slate-950 min-h-screen">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300"
        style={{ width: SIDEBAR_W, transform: sidebarOpen ? 'translateX(0)' : `translateX(-${SIDEBAR_W}px)` }}
      >
        <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">LLM</div>
          <span className="text-sm font-semibold text-slate-200 whitespace-nowrap flex-1">How LLMs Work</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-300 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {GROUPS.map(group => (
            <div key={group.part} className="mb-3">
              <div className="flex items-center gap-2 px-3 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: group.accent }}>{group.part}</span>
                <span className="text-xs text-slate-600 uppercase tracking-wider truncate">· {group.title}</span>
              </div>
              {group.sections.map(s => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left mb-0.5 ${active === s.id ? 'bg-slate-800 text-slate-100 font-medium' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}>
                  <span className="text-xs font-mono font-bold flex-shrink-0 w-5" style={{ color: active === s.id ? s.dot : '#475569' }}>{s.num}</span>
                  <span className="truncate text-[13px]">{s.label}</span>
                  {active === s.id && <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="px-5 py-3 border-t border-slate-800">
          <p className="text-xs text-slate-600">17 interactive concepts</p>
        </div>
      </aside>

      {/* Main */}
      <div className="transition-all duration-300" style={{ marginLeft: 0 }}>
        <div className="lg:ml-[264px]">
          {/* Topbar */}
          <header className="sticky top-0 z-30 bg-slate-950/85 backdrop-blur-sm border-b border-slate-800/60 px-4 sm:px-6 py-3 flex items-center gap-3">
            <button onClick={() => setSidebarOpen(v => !v)} className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded -ml-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <span className="text-sm text-slate-400 font-medium hidden sm:block">How LLMs Actually Work</span>
            {activeMeta && (
              <span className="flex items-center gap-2 text-sm text-slate-300 sm:ml-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeMeta.dot }} />
                <span className="font-mono text-xs text-slate-500">{activeMeta.num}</span>
                <span className="truncate">{activeMeta.label}</span>
              </span>
            )}
            {/* progress */}
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden sm:block w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${((activeIdx + 1) / ALL.length) * 100}%` }} />
              </div>
              <span className="text-xs font-mono text-slate-600">{activeIdx + 1}/{ALL.length}</span>
            </div>
          </header>

          {/* Hero */}
          <section className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12 border-b border-slate-800/50">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                17 interactive concepts · 5 parts
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
                How LLMs<br /><span className="text-indigo-400">Actually Work</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
                Not just the architecture — the whole story. How models are built, how they <em>learn</em>, how raw models become
                assistants, how they run in production, and why they hallucinate. Every concept has a live, playable demo.
              </p>

              {/* Part overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {GROUPS.map(g => (
                  <button key={g.part} onClick={() => scrollTo(g.sections[0].id)}
                    className="text-left rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800/80 hover:border-slate-700 p-4 transition-all active:scale-[0.98]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: g.accent }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: g.accent }}>{g.part}</span>
                    </div>
                    <p className="text-slate-200 font-semibold text-sm mb-1">{g.title}</p>
                    <p className="text-xs text-slate-500 leading-snug">{g.sections.map(s => s.label).join(' · ')}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* The blog: long-form prose with the interactive demos embedded inline */}
          <BlogContent />

          <footer className="border-t border-slate-800/50 px-4 sm:px-8 py-8 text-center text-sm text-slate-600">
            <p className="max-w-xl mx-auto leading-relaxed">
              Built to make transformer internals tangible — extending the concepts from{' '}
              <span className="text-slate-500">0xkato.xyz</span> with the training, alignment, and deployment story behind real LLMs.
            </p>
            <button onClick={() => scrollTo('tokenization')} className="mt-4 text-xs text-indigo-400 hover:text-indigo-300">↑ Back to start</button>
          </footer>
        </div>
      </div>
    </div>
  )
}
