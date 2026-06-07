import { useState } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards } from '../components/ui'

const ACCENT = 'fuchsia'

const EXPERTS = [
  'Syntax', 'Math', 'Code', 'Facts',
  'Language', 'Reasoning', 'Style', 'Common-sense',
]

// Preset gating per token → tells a clean specialization story.
// values are raw gate logits over the 8 experts.
const TOKENS = [
  { tok: ' the',    gates: [9, 1, 1, 2, 5, 1, 3, 4] },
  { tok: ' 42',     gates: [1, 9, 3, 4, 1, 6, 1, 2] },
  { tok: ' def',    gates: [3, 2, 9, 1, 2, 5, 1, 1] },
  { tok: ' Paris',  gates: [2, 1, 1, 9, 4, 1, 2, 5] },
  { tok: ' because',gates: [4, 2, 1, 2, 3, 9, 1, 6] },
  { tok: ' elegant',gates: [3, 1, 1, 2, 5, 2, 9, 3] },
]

const softmax = (xs) => {
  const m = Math.max(...xs)
  const e = xs.map(x => Math.exp(x - m))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map(v => v / s)
}

const TOTAL_PARAMS = 47   // Mixtral 8x7B-ish, in billions
const ACTIVE_PARAMS = 13

export default function MoESection() {
  const [tIdx, setTIdx] = useState(0)
  const [dense, setDense] = useState(false)

  const tok = TOKENS[tIdx]
  const probs = softmax(tok.gates)
  // top-2 routing
  const ranked = probs.map((p, i) => ({ i, p })).sort((a, b) => b.p - a.p)
  const chosen = dense ? probs.map((_, i) => i) : ranked.slice(0, 2).map(r => r.i)

  return (
    <SectionShell>
      <SectionHeader num="14" title="Mixture of Experts (MoE)" accent={ACCENT}>
        GPT-4, Mixtral, DeepSeek and Gemini reportedly share a trick the textbook transformer doesn't have. Instead of one giant
        feed-forward network, they hold <strong className="text-slate-200">many expert networks</strong> plus a{' '}
        <strong className="text-slate-200">router</strong> that sends each token to just a couple of them. Huge total capacity,
        but only a slice runs per token.
      </SectionHeader>

      <Panel
        label="Live router — watch each token get assigned"
        right={
          <button onClick={() => setDense(d => !d)}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${dense ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300'}`}>
            {dense ? 'Dense (all experts)' : 'MoE (top-2)'}
          </button>
        }
        className="mb-5"
      >
        {/* token picker */}
        <div className="flex flex-wrap gap-2 mb-5">
          {TOKENS.map((t, i) => (
            <button key={i} onClick={() => setTIdx(i)}
              className={`font-mono text-sm px-3 py-1.5 rounded-lg border transition-all ${tIdx === i ? 'bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              {t.tok.trim()}
            </button>
          ))}
        </div>

        {/* router → experts diagram */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* token + router */}
          <div className="flex-shrink-0 text-center">
            <div className="font-mono text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-fuchsia-300 mb-2">{tok.tok.trim()}</div>
            <div className="text-xs text-slate-500 mb-1">↓</div>
            <div className="text-xs px-2 py-1 rounded bg-fuchsia-500/10 border border-fuchsia-500/30 text-fuchsia-400">Router</div>
          </div>

          {/* experts grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXPERTS.map((name, i) => {
              const active = chosen.includes(i)
              const gateW = probs[i]
              return (
                <div key={name}
                  className="rounded-lg p-2.5 border text-center transition-all duration-300"
                  style={{
                    background: active ? `rgba(217,70,239,${0.1 + gateW * 0.5})` : 'rgba(15,23,42,0.5)',
                    borderColor: active ? '#d946ef' : '#1e293b',
                    opacity: active ? 1 : 0.4,
                    transform: active ? 'scale(1)' : 'scale(0.96)',
                  }}>
                  <div className="text-xs font-semibold mb-0.5" style={{ color: active ? '#f0abfc' : '#64748b' }}>{name}</div>
                  <div className="text-xs font-mono" style={{ color: active ? '#d946ef' : '#475569' }}>
                    {(gateW * 100).toFixed(0)}%
                  </div>
                  {active && !dense && <div className="text-xs text-fuchsia-500 mt-0.5">● active</div>}
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-4">
          {dense
            ? 'Dense mode: every expert runs for every token — maximum compute, no routing.'
            : `Top-2 routing: only the 2 highest-scoring experts process "${tok.tok.trim()}". The others stay dark — their weights exist but aren't computed.`}
        </p>
      </Panel>

      {/* params counter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Panel className="text-center">
          <div className="text-3xl font-bold text-fuchsia-400">{TOTAL_PARAMS}B</div>
          <div className="text-xs text-slate-500 mt-1">total parameters (all experts)</div>
        </Panel>
        <Panel className="text-center">
          <div className="text-3xl font-bold" style={{ color: dense ? '#f0abfc' : '#10b981' }}>
            {dense ? TOTAL_PARAMS : ACTIVE_PARAMS}B
          </div>
          <div className="text-xs text-slate-500 mt-1">active per token {dense ? '(100%)' : '(~28%)'}</div>
        </Panel>
        <Panel className="text-center">
          <div className="text-3xl font-bold text-amber-400">{dense ? '1×' : '3.6×'}</div>
          <div className="text-xs text-slate-500 mt-1">{dense ? 'compute baseline' : 'cheaper inference'}</div>
        </Panel>
      </div>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'Knowledge vs compute', body: 'MoE decouples how much a model knows (total params) from how much it costs to run (active params). You get the knowledge of a 47B model at the speed of a 13B one.' },
        { title: 'The routing problem', body: 'A naive router sends everything to its favourite expert. Training adds a load-balancing loss so tokens spread evenly — otherwise most experts would never learn anything.' },
        { title: 'Memory tradeoff', body: 'All experts must sit in memory even though most are idle each step. MoE saves compute (FLOPs), not VRAM — which is why it shines in big datacenter serving.' },
      ]} />
    </SectionShell>
  )
}
