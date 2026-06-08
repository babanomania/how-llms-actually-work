import { useState } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards } from '../components/ui'

const ACCENT = 'cyan'

// Human-readable big numbers (for params / tokens)
const human = (n) => {
  if (n >= 1e12) return (n / 1e12).toFixed(n >= 1e13 ? 0 : 1) + 'T'
  if (n >= 1e9)  return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + 'B'
  if (n >= 1e6)  return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M'
  if (n >= 1e3)  return (n / 1e3).toFixed(0) + 'K'
  return n.toFixed(0)
}

// Scientific notation with unicode superscript (for FLOPs, which are astronomically large)
const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }
const sup = (n) => String(n).split('').map(d => SUP[d] ?? d).join('')
const fmtFlops = (c) => {
  const e = Math.floor(Math.log10(c))
  const m = (c / Math.pow(10, e)).toFixed(1)
  return `${m} × 10${sup(e)}`
}

// Chinchilla-style compute-optimal split. C = 6·N·D, optimal at D ≈ 20·N.
// => N = sqrt(C/120), D = 20·N.
const optimalFromCompute = (C) => {
  const N = Math.sqrt(C / 120)
  const D = 20 * N
  return { N, D }
}

// Illustrative loss vs compute (smooth power-law-ish on log compute)
const lossFromCompute = (C) => 1.65 + 2.2 * Math.pow(C / 1e21, -0.07)

const REF_MODELS = [
  { name: 'GPT-2', C: 4e19, x: null },
  { name: 'GPT-3', C: 3.1e23, x: null },
  { name: 'Chinchilla', C: 5.8e23, x: null },
  { name: 'GPT-4', C: 2e25, x: null },
]

// Emergent abilities: accuracy stays ~0 then jumps at a scale threshold.
const TASKS = [
  { name: '3-digit addition',   thr: 10.3, width: 0.45, color: '#06b6d4' },
  { name: 'Word unscrambling',  thr: 11.0, width: 0.4,  color: '#a855f7' },
  { name: 'Multi-step reasoning', thr: 11.6, width: 0.5, color: '#f59e0b' },
]
const sigmoid = (x) => 1 / (1 + Math.exp(-x))
const accuracy = (logN, task) => sigmoid((logN - task.thr) / task.width) * 0.95

export default function ScalingSection({ embedded = false }) {
  const [logC, setLogC] = useState(23.5)      // log10 of compute (FLOPs)
  const [task, setTask] = useState(0)

  const C = Math.pow(10, logC)
  const { N, D } = optimalFromCompute(C)
  const lossNow = lossFromCompute(C)

  // loss-vs-compute curve geometry
  const VW = 340, VH = 180, PAD = 30
  const logCmin = 19, logCmax = 26
  const lmin = lossFromCompute(Math.pow(10, logCmax))
  const lmax = lossFromCompute(Math.pow(10, logCmin))
  const cx = lc => PAD + ((lc - logCmin) / (logCmax - logCmin)) * (VW - 2 * PAD)
  const cy = l => PAD + ((l - lmin) / (lmax - lmin)) * (VH - 2 * PAD)
  const lossCurve = (() => {
    const p = []
    for (let lc = logCmin; lc <= logCmax; lc += 0.15)
      p.push(`${cx(lc).toFixed(1)},${cy(lossFromCompute(Math.pow(10, lc))).toFixed(1)}`)
    return p.join(' ')
  })()

  // emergence curve geometry
  const EW = 340, EH = 180, EPAD = 30
  const logNmin = 8, logNmax = 13
  const ex = ln => EPAD + ((ln - logNmin) / (logNmax - logNmin)) * (EW - 2 * EPAD)
  const ey = a => EH - EPAD - a * (EH - 2 * EPAD)
  const emCurve = (t) => {
    const p = []
    for (let ln = logNmin; ln <= logNmax; ln += 0.1)
      p.push(`${ex(ln).toFixed(1)},${ey(accuracy(ln, t)).toFixed(1)}`)
    return p.join(' ')
  }
  const curLogN = Math.log10(N)

  return (
    <SectionShell embedded={embedded}>
      <SectionHeader num="11" title="Scaling Laws & Emergence" accent={ACCENT}>
        Why did models suddenly get so good? Because performance improves <strong className="text-slate-200">predictably</strong> with
        scale. Pour in more compute, and loss drops along a smooth power law — so much so that labs forecast a model's
        quality <em>before training it</em>. And some abilities appear to switch on all at once. Drag the sliders.
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Compute-optimal allocation */}
        <Panel label="Compute-optimal recipe (Chinchilla)">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">training compute</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">{fmtFlops(C)} FLOPs</span>
          </div>
          <input type="range" min="19" max="26" step="0.1" value={logC}
            onChange={e => setLogC(parseFloat(e.target.value))} className="w-full accent-cyan-500 mb-4" />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-800/60 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{human(N)}</div>
              <div className="text-xs text-slate-500 mt-0.5">optimal parameters</div>
            </div>
            <div className="bg-slate-800/60 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-violet-400">{human(D)}</div>
              <div className="text-xs text-slate-500 mt-0.5">optimal tokens</div>
            </div>
          </div>
          {/* allocation bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-2">
            <div style={{ width: '33%', background: '#06b6d4' }} />
            <div style={{ width: '67%', background: '#8b5cf6' }} />
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            The key finding: train on <strong className="text-slate-300">~20 tokens per parameter</strong>. GPT-3 (175B) was
            badly under-trained on only 300B tokens; Chinchilla (70B) beat it using 1.4T tokens with the <em>same</em> compute.
          </p>
        </Panel>

        {/* Loss vs compute */}
        <Panel label="Test loss vs compute — the power law">
          <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full rounded-lg bg-slate-950/60">
            {[20, 22, 24].map(t => (
              <line key={t} x1={cx(t)} y1={PAD} x2={cx(t)} y2={VH - PAD} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,4" />
            ))}
            <polyline points={lossCurve} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
            {REF_MODELS.map(m => {
              const lc = Math.log10(m.C)
              if (lc < logCmin || lc > logCmax) return null
              return (
                <g key={m.name}>
                  <circle cx={cx(lc)} cy={cy(lossFromCompute(m.C))} r="3" fill="#64748b" />
                  <text x={cx(lc)} y={cy(lossFromCompute(m.C)) - 7} fill="#94a3b8" fontSize="8" textAnchor="middle">{m.name}</text>
                </g>
              )
            })}
            {/* current marker */}
            <circle cx={cx(logC)} cy={cy(lossNow)} r="6" fill="#22d3ee" className="animate-glow" />
            <text x={VW / 2} y={VH - 6} fill="#475569" fontSize="9" textAnchor="middle">compute (log FLOPs) →</text>
            <text x={10} y={PAD} fill="#475569" fontSize="9">loss</text>
          </svg>
          <div className="flex items-center justify-between mt-2 text-xs font-mono">
            <span className="text-slate-500">predicted loss</span>
            <span className="text-cyan-400 font-bold">{lossNow.toFixed(3)}</span>
          </div>
        </Panel>
      </div>

      {/* Emergence */}
      <Panel label="Emergent abilities — capabilities that switch on suddenly" className="mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <svg viewBox={`0 0 ${EW} ${EH}`} className="w-full rounded-lg bg-slate-950/60">
              <line x1={EPAD} y1={EH - EPAD} x2={EW - EPAD} y2={EH - EPAD} stroke="#334155" strokeWidth="1" />
              <line x1={EPAD} y1={EPAD} x2={EPAD} y2={EH - EPAD} stroke="#334155" strokeWidth="1" />
              {TASKS.map((t, i) => (
                <polyline key={t.name} points={emCurve(t)} fill="none"
                  stroke={t.color} strokeWidth={i === task ? 3 : 1.5} opacity={i === task ? 1 : 0.35} />
              ))}
              {/* current scale marker */}
              <line x1={ex(curLogN)} y1={EPAD} x2={ex(curLogN)} y2={EH - EPAD} stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="4,3" />
              <circle cx={ex(curLogN)} cy={ey(accuracy(curLogN, TASKS[task]))} r="5" fill={TASKS[task].color} />
              <text x={EW / 2} y={EH - 6} fill="#475569" fontSize="9" textAnchor="middle">model scale (log params) →</text>
              <text x={8} y={EPAD} fill="#475569" fontSize="9">acc</text>
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500 mb-1">Pick a task — the dashed line is your current model size:</p>
            {TASKS.map((t, i) => (
              <button key={t.name} onClick={() => setTask(i)}
                className={`text-left rounded-lg px-3 py-2 border transition-all ${i === task ? 'bg-slate-800' : 'bg-transparent border-transparent hover:bg-slate-800/50'}`}
                style={{ borderColor: i === task ? t.color + '55' : 'transparent' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                  <span className="text-sm text-slate-300">{t.name}</span>
                </div>
                <div className="text-xs font-mono mt-0.5" style={{ color: t.color }}>
                  {(accuracy(curLogN, t) * 100).toFixed(0)}% at {human(N)} params
                </div>
              </button>
            ))}
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Below the threshold the model scores near-zero; cross it and accuracy jumps. (Whether this is truly "sudden" or an
              artifact of harsh metrics is actively debated.)
            </p>
          </div>
        </div>
      </Panel>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'Predictable returns', body: 'Loss ∝ compute^(−a). Plotted on log axes it\'s a straight line across 8+ orders of magnitude. Labs fit the curve on small runs to forecast giant ones.' },
        { title: 'The bitter lesson', body: 'General methods that scale with compute beat clever hand-designed ones. Much of recent progress is "the same architecture, but bigger and on more data."' },
        { title: 'Data is the bottleneck', body: 'Chinchilla showed we were starving big models of data. High-quality text is now finite — driving interest in synthetic data and multiple epochs.' },
      ]} />
    </SectionShell>
  )
}
