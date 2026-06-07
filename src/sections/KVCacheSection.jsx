import { useState, useEffect, useRef } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards, PlaybackBar } from '../components/ui'

const ACCENT = 'sky'

const PROMPT = ['The', 'sun', 'rises', 'in', 'the']
const GEN = ['east', 'every', 'single', 'morning', '.']
const ALL = [...PROMPT, ...GEN]

// per-token KV memory (illustrative): 2(K,V) × 32 layers × 4096 dim × 2 bytes ≈ 0.5 MB
const MB_PER_TOKEN = 0.5

export default function KVCacheSection() {
  // pos = how many tokens have been processed. prompt is "prefilled" together.
  const [pos, setPos] = useState(PROMPT.length)
  const [playing, setPlaying] = useState(false)
  const [useCache, setUseCache] = useState(true)
  const posRef = useRef(PROMPT.length)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      posRef.current += 1
      if (posRef.current >= ALL.length) { posRef.current = ALL.length; setPos(ALL.length); setPlaying(false); return }
      setPos(posRef.current)
    }, 650)
    return () => clearInterval(id)
  }, [playing])

  const reset = () => { setPlaying(false); posRef.current = PROMPT.length; setPos(PROMPT.length) }

  const generated = pos - PROMPT.length
  const cacheMB = (pos * MB_PER_TOKEN).toFixed(1)

  // work this step: with cache, only 1 new token's K/V computed; without, all `pos`.
  const isDecoding = pos > PROMPT.length && pos < ALL.length
  const workWithCache = 1
  const workNoCache = pos
  const phase = pos <= PROMPT.length ? 'prefill' : (pos >= ALL.length ? 'done' : 'decode')

  return (
    <SectionShell>
      <SectionHeader num="15" title="KV Cache & Inference" accent={ACCENT}>
        Generation feels like the model "types" one token at a time — and it does. The trick that makes it fast is the{' '}
        <strong className="text-slate-200">KV cache</strong>: every token's Key and Value vectors are saved, so each new token
        only attends to stored memory instead of recomputing the entire history. Press play to generate.
      </SectionHeader>

      <Panel
        label={`Token-by-token generation — ${phase} phase`}
        right={
          <button onClick={() => setUseCache(c => !c)}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${useCache ? 'bg-sky-500/20 border-sky-500/40 text-sky-300' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
            {useCache ? 'KV cache ON' : 'KV cache OFF'}
          </button>
        }
        className="mb-5"
      >
        {/* sequence of tokens */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {ALL.map((t, i) => {
            const isPrompt = i < PROMPT.length
            const processed = i < pos
            const justAdded = i === pos - 1 && i >= PROMPT.length
            return (
              <div key={i}
                className={`px-2.5 py-1.5 rounded-md font-mono text-sm border transition-all duration-300 ${justAdded ? 'scale-110' : ''}`}
                style={{
                  background: !processed ? 'rgba(15,23,42,0.4)'
                    : isPrompt ? 'rgba(100,116,139,0.18)' : 'rgba(14,165,233,0.18)',
                  borderColor: !processed ? '#1e293b' : isPrompt ? '#475569' : '#0ea5e9',
                  color: !processed ? '#475569' : isPrompt ? '#cbd5e1' : '#7dd3fc',
                  opacity: processed ? 1 : 0.4,
                }}>
                {t}
              </div>
            )
          })}
          {phase === 'decode' && <span className="inline-block w-0.5 h-6 bg-sky-400 animate-pulse self-center" />}
        </div>

        {/* KV cache visualization */}
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
          KV cache {useCache ? '(stored — reused every step)' : '(disabled — recomputed every step)'}
        </p>
        <div className="flex flex-wrap gap-1 mb-4">
          {ALL.slice(0, pos).map((t, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div className="w-7 h-5 rounded-sm flex items-center justify-center text-xs font-mono"
                style={{ background: useCache ? 'rgba(14,165,233,0.25)' : 'rgba(244,63,94,0.15)', color: useCache ? '#7dd3fc' : '#fda4af' }}>
                K
              </div>
              <div className="w-7 h-5 rounded-sm flex items-center justify-center text-xs font-mono"
                style={{ background: useCache ? 'rgba(14,165,233,0.15)' : 'rgba(244,63,94,0.1)', color: useCache ? '#38bdf8' : '#fb7185' }}>
                V
              </div>
              <div className="text-xs text-slate-600 truncate" style={{ maxWidth: 28 }}>{t}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <PlaybackBar playing={playing} onToggle={() => { if (pos >= ALL.length) reset(); setPlaying(p => !p) }} onReset={reset} accent={ACCENT} />
          <div className="flex gap-3 text-xs font-mono">
            <span className="text-slate-500">cache: <span className="text-sky-400">{cacheMB} MB</span></span>
            <span className="text-slate-500">generated: <span className="text-slate-300">{generated}/{GEN.length}</span></span>
          </div>
        </div>
      </Panel>

      {/* work comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Panel label="Work to add the next token">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-sky-400">With cache</span>
                <span className="font-mono text-sky-400">{workWithCache} token computed</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${(workWithCache / ALL.length) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-rose-400">Without cache</span>
                <span className="font-mono text-rose-400">{workNoCache} tokens recomputed</span>
              </div>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${(workNoCache / ALL.length) * 100}%` }} />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Without a cache, generating an N-token reply costs <span className="font-mono text-slate-300">1+2+…+N ≈ N²/2</span> work.
            The cache turns each step into <span className="font-mono text-slate-300">O(1)</span> recompute — the difference between seconds and minutes.
          </p>
        </Panel>

        <Panel label="Prefill vs decode — two very different phases">
          <div className="space-y-3">
            <div className="rounded-lg p-3 border border-slate-700 bg-slate-800/40">
              <p className="text-sm font-semibold text-slate-200 mb-1">Prefill <span className="text-xs font-normal text-slate-500">(your prompt)</span></p>
              <p className="text-xs text-slate-400 leading-relaxed">All prompt tokens processed <strong>in parallel</strong> in one pass — fast, compute-bound. Fills the cache. This is the "time to first token."</p>
            </div>
            <div className="rounded-lg p-3 border border-sky-500/30 bg-sky-500/5">
              <p className="text-sm font-semibold text-sky-300 mb-1">Decode <span className="text-xs font-normal text-slate-500">(the reply)</span></p>
              <p className="text-xs text-slate-400 leading-relaxed">One token per forward pass, <strong>sequentially</strong> — memory-bandwidth-bound. This is why output streams at a steady tokens/second and long replies take time.</p>
            </div>
          </div>
        </Panel>
      </div>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'Cache eats memory', body: 'The cache grows linearly with context length. At 100k tokens it can dwarf the model weights themselves — the real reason long context is expensive to serve.' },
        { title: 'GQA shrinks it', body: 'Grouped-Query Attention has many query heads share the same K/V — directly cutting cache size. That\'s a big reason modern models adopt it.' },
        { title: 'Why TTFT ≠ speed', body: 'A long prompt slows the first token (prefill), but once decoding starts, speed depends on model size and memory bandwidth — not prompt length.' },
      ]} />
    </SectionShell>
  )
}
