import { useState, useEffect, useRef } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards, PlaybackBar, ACCENTS } from '../components/ui'

const ACCENT = 'red'
const TARGET = 2          // location of the loss minimum (the "ideal weight")
const START = -4.2        // where the parameter starts
// Loss surface: L(w) = 0.25 (w - target)^2 ; gradient = 0.5 (w - target)
const loss = w => 0.25 * (w - TARGET) ** 2
const grad = w => 0.5 * (w - TARGET)

const VW = 320, VH = 200, PAD = 24
const W_MIN = -6, W_MAX = 10, L_MAX = 14
const sx = w => PAD + ((w - W_MIN) / (W_MAX - W_MIN)) * (VW - 2 * PAD)
const sy = l => VH - PAD - (Math.min(l, L_MAX) / L_MAX) * (VH - 2 * PAD)

const CURVE = (() => {
  const pts = []
  for (let w = W_MIN; w <= W_MAX; w += 0.2) pts.push(`${sx(w).toFixed(1)},${sy(loss(w)).toFixed(1)}`)
  return pts.join(' ')
})()

export default function TrainingSection() {
  const [w, setW] = useState(START)
  const [lr, setLr] = useState(0.6)
  const [history, setHistory] = useState([{ step: 0, loss: loss(START), w: START }])
  const [playing, setPlaying] = useState(false)
  const [diverged, setDiverged] = useState(false)
  const wRef = useRef(START)
  const stepRef = useRef(0)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      const cur = wRef.current
      const next = cur - lr * grad(cur)
      stepRef.current += 1
      if (!isFinite(next) || Math.abs(next - TARGET) > 50) {
        setDiverged(true); setPlaying(false); return
      }
      wRef.current = next
      setW(next)
      setHistory(h => [...h.slice(-60), { step: stepRef.current, loss: loss(next), w: next }])
      if (Math.abs(grad(next)) < 0.002 && stepRef.current > 4) setPlaying(false)
    }, 280)
    return () => clearInterval(id)
  }, [playing, lr])

  const reset = () => {
    setPlaying(false); setDiverged(false)
    wRef.current = START; stepRef.current = 0
    setW(START); setHistory([{ step: 0, loss: loss(START), w: START }])
  }

  const lrZone = lr < 0.3 ? { label: 'too small — slow crawl', c: '#fbbf24' }
    : lr <= 2.4 ? { label: 'healthy — smooth descent', c: '#34d399' }
    : lr < 3.6 ? { label: 'high — oscillates', c: '#fb923c' }
    : { label: 'too large — diverges 💥', c: '#ef4444' }

  const curLoss = loss(w)
  const maxHistLoss = Math.max(...history.map(h => h.loss), 1)

  // loss-vs-step mini chart geometry
  const CW = 320, CH = 120, CPAD = 20
  const histPts = history.map((h, i) => {
    const x = CPAD + (history.length <= 1 ? 0 : (i / (history.length - 1)) * (CW - 2 * CPAD))
    const y = CH - CPAD - (h.loss / maxHistLoss) * (CH - 2 * CPAD)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <SectionShell>
      <SectionHeader num="10" title="Training & Backpropagation" accent={ACCENT}>
        A fresh model is <em>random</em> — its weights are noise. Training shows it trillions of tokens and, for each, nudges
        every weight a tiny bit to make the correct next token more likely. That nudge is computed by{' '}
        <strong className="text-slate-200">backpropagation</strong> and applied by{' '}
        <strong className="text-slate-200">gradient descent</strong>. Press play and watch a single weight learn.
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Loss landscape + descent */}
        <Panel label="Gradient descent on the loss surface">
          <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full rounded-lg bg-slate-950/60">
            <polyline points={CURVE} fill="none" stroke="#475569" strokeWidth="2" />
            {/* minimum marker */}
            <line x1={sx(TARGET)} y1={sy(0)} x2={sx(TARGET)} y2={VH - PAD} stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
            <text x={sx(TARGET)} y={VH - 8} fill="#10b981" fontSize="9" textAnchor="middle">minimum</text>
            {/* gradient arrow */}
            {!diverged && Math.abs(grad(w)) > 0.05 && (
              <line x1={sx(w)} y1={sy(curLoss)} x2={sx(w - Math.sign(grad(w)) * 1.1)} y2={sy(curLoss)}
                stroke="#f87171" strokeWidth="2" markerEnd="url(#arrow)" />
            )}
            <defs>
              <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#f87171" />
              </marker>
            </defs>
            {/* the ball */}
            <circle cx={sx(w)} cy={sy(curLoss)} r="7" fill="#ef4444" className="animate-glow" />
          </svg>
          <div className="flex items-center justify-between mt-3 text-xs font-mono">
            <span className="text-slate-500">weight <span className="text-red-400">{w.toFixed(2)}</span></span>
            <span className="text-slate-500">loss <span className="text-amber-400">{curLoss.toFixed(3)}</span></span>
            <span className="text-slate-500">step <span className="text-slate-300">{stepRef.current}</span></span>
          </div>
        </Panel>

        {/* Loss vs steps + controls */}
        <div className="flex flex-col gap-5">
          <Panel label="Loss curve (what you watch during training)">
            <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full rounded-lg bg-slate-950/60" style={{ maxHeight: 130 }}>
              <line x1={CPAD} y1={CH - CPAD} x2={CW - CPAD} y2={CH - CPAD} stroke="#1e293b" strokeWidth="1" />
              <line x1={CPAD} y1={CPAD} x2={CPAD} y2={CH - CPAD} stroke="#1e293b" strokeWidth="1" />
              {history.length > 1 && <polyline points={histPts} fill="none" stroke="#f59e0b" strokeWidth="2" />}
              {diverged && <text x={CW / 2} y={CH / 2} fill="#ef4444" fontSize="13" textAnchor="middle" fontWeight="bold">diverged 💥</text>}
            </svg>
            <p className="text-xs text-slate-600 mt-1">loss → 0 means the model predicts perfectly. Real training curves look just like this, over billions of steps.</p>
          </Panel>

          <Panel label="Learning rate — the step size">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">how big a nudge per step</span>
              <span className="font-mono font-bold text-sm" style={{ color: lrZone.c }}>{lr.toFixed(2)}</span>
            </div>
            <input type="range" min="0.05" max="4.2" step="0.05" value={lr}
              onChange={e => setLr(parseFloat(e.target.value))}
              className="w-full accent-red-500" />
            <p className="text-xs mt-1.5 font-medium" style={{ color: lrZone.c }}>{lrZone.label}</p>
          </Panel>

          <PlaybackBar playing={playing} onToggle={() => { if (diverged) reset(); setPlaying(p => !p) }} onReset={reset} accent={ACCENT} />
        </div>
      </div>

      {/* The training loop */}
      <Panel label="The training loop — repeated trillions of times" className="mb-5">
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
          {[
            { t: 'Forward pass', d: 'predict next token', c: '#6366f1' },
            { t: 'Compute loss', d: 'how wrong? (cross-entropy)', c: '#f59e0b' },
            { t: 'Backprop', d: 'gradient for every weight', c: '#ef4444' },
            { t: 'Update', d: 'weight −= lr × gradient', c: '#10b981' },
          ].map((s, i) => (
            <div key={s.t} className="flex items-center gap-2">
              <div className="rounded-lg px-2.5 py-2 border" style={{ borderColor: s.c + '55', background: s.c + '12' }}>
                <div className="font-semibold" style={{ color: s.c }}>{s.t}</div>
                <div className="text-slate-500 text-xs">{s.d}</div>
              </div>
              {i < 3 ? <span className="text-slate-600">→</span> : <span className="text-slate-600">↻</span>}
            </div>
          ))}
        </div>
      </Panel>

      {/* Cross-entropy / perplexity explainer */}
      <Panel label="What 'loss' actually measures" className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm leading-relaxed mb-2">
              The loss is <strong className="text-slate-200">cross-entropy</strong>: the negative log-probability the model
              assigned to the <em>correct</em> next token. Confident and right → tiny loss. Confident and wrong → huge loss.
            </p>
            <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
              loss = −log( P<sub>model</sub>(correct token) )
            </div>
          </div>
          <div className="space-y-2">
            {[
              ['P = 0.99', '0.01', '#10b981', 'nailed it'],
              ['P = 0.50', '0.69', '#fbbf24', 'unsure'],
              ['P = 0.10', '2.30', '#fb923c', 'wrong-ish'],
              ['P = 0.01', '4.61', '#ef4444', 'badly wrong'],
            ].map(([p, l, c, note]) => (
              <div key={p} className="flex items-center gap-3 text-xs font-mono">
                <span className="text-slate-400 w-20">{p}</span>
                <span className="text-slate-600">→ loss</span>
                <span style={{ color: c }} className="font-bold w-12">{l}</span>
                <span className="text-slate-500">{note}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          <strong className="text-slate-400">Perplexity</strong> = e<sup>loss</sup> — roughly "how many tokens the model is choosing between." Perplexity 1 = perfect; GPT-2 scored ~20 on web text, modern models ~3–4.
        </p>
      </Panel>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'Self-supervised', body: 'No human labels needed. The "answer" is just the next word in the text — the internet is one giant free training set of correct continuations.' },
        { title: 'Billions of knobs', body: 'Backprop computes a gradient for every single weight at once (chain rule, layer by layer backwards). A 70B model adjusts 70 billion knobs each step.' },
        { title: 'Optimizers (Adam)', body: 'Real training uses Adam/AdamW, not plain descent — it adapts the step size per-weight using running averages of past gradients. Far more stable at scale.' },
      ]} />
    </SectionShell>
  )
}
