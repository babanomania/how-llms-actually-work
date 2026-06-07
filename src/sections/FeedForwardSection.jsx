import { useState } from 'react'

const ACTIVATIONS = {
  ReLU:   { fn: x => Math.max(0, x),                 label: 'ReLU',   color: '#f59e0b', desc: 'max(0, x) — simple, kills negatives' },
  GELU:   { fn: x => x * 0.5 * (1 + Math.tanh(Math.sqrt(2/Math.PI) * (x + 0.044715 * x**3))), label: 'GELU', color: '#a855f7', desc: 'Smooth ReLU variant used in GPT-2/3' },
  SwiGLU: { fn: (x, g=null) => { const s = 1/(1+Math.exp(-x)); return x * s }, label: 'SwiGLU', color: '#22c55e', desc: 'x·σ(x) — used in LLaMA, Mistral, Gemma' },
}

const STEPS = [
  { id: 'input',    label: 'Input',         desc: 'One token\'s embedding vector arrives from attention output.' },
  { id: 'expand',   label: 'Expand (W₁)',   desc: 'Linear projection multiplies dimension by 4× (e.g. 4096 → 16384). Each neuron can detect a different feature.' },
  { id: 'activate', label: 'Activate',      desc: 'Non-linear activation gates neurons — some fire, some don\'t. This creates sparse, expressive representations.' },
  { id: 'compress', label: 'Compress (W₂)', desc: 'Another linear projection reduces back to model dimension (16384 → 4096). Only activated features survive.' },
  { id: 'output',   label: 'Output',        desc: 'Refined embedding — enriched with factual and compositional knowledge stored in the weights.' },
]

function ActivationPlot({ fnName }) {
  const { fn, color } = ACTIVATIONS[fnName]
  const W = 200, H = 100
  const xs = Array.from({ length: 80 }, (_, i) => -4 + i * 0.1)
  const ys = xs.map(fn)
  const ymin = -1.5, ymax = 2.5
  const toSX = x => ((x + 4) / 8) * W
  const toSY = y => H - ((y - ymin) / (ymax - ymin)) * H

  const pts = xs.map((x, i) => `${toSX(x).toFixed(1)},${toSY(ys[i]).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded" style={{ background: '#0f172a', height: 90 }}>
      {/* axes */}
      <line x1={0} y1={toSY(0)} x2={W} y2={toSY(0)} stroke="#334155" strokeWidth="1" />
      <line x1={toSX(0)} y1={0} x2={toSX(0)} y2={H} stroke="#334155" strokeWidth="1" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function NeuronBar({ value, maxVal, color, active }) {
  const pct = Math.abs(value) / maxVal * 100
  return (
    <div className="h-3 rounded-sm overflow-hidden bg-slate-800">
      <div
        className="h-full rounded-sm transition-all duration-500"
        style={{ width: `${active ? pct : 0}%`, background: active ? color : '#334155' }}
      />
    </div>
  )
}

const DEMO_INPUT = [0.8, -0.3, 0.6, 0.9, -0.7, 0.4, 0.2, -0.5]
const HIDDEN = Array.from({ length: 24 }, (_, i) => Math.sin(i * 0.7 + 0.3) * 1.2 + Math.cos(i * 0.4) * 0.5)

export default function FeedForwardSection() {
  const [step, setStep] = useState(0)
  const [actName, setActName] = useState('SwiGLU')

  const act = ACTIVATIONS[actName].fn
  const activated = HIDDEN.map(v => act(v))
  const maxH = Math.max(...HIDDEN.map(Math.abs))
  const maxA = Math.max(...activated.map(Math.abs))

  const isExpanded  = step >= 1
  const isActivated = step >= 2
  const isCompressed = step >= 3

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-xs">06</span>
            <h2 className="text-2xl font-bold text-white">Feed-Forward Network</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            After attention mixes information across tokens, a <strong className="text-slate-200">feed-forward network</strong> refines
            each token independently. It expands, applies a non-linearity, then compresses — storing
            factual knowledge in its weights.
          </p>
        </div>

        {/* Step diagram */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Step-through demo</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Activation:</span>
              {Object.keys(ACTIVATIONS).map(k => (
                <button key={k} onClick={() => setActName(k)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-all ${actName === k ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Visual flow */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {/* Input neurons */}
            <div className="flex-shrink-0 text-center">
              <div className="text-xs text-slate-500 mb-2">Input<br />(d=8)</div>
              <div className="flex flex-col gap-1">
                {DEMO_INPUT.map((v, i) => (
                  <div key={i} className="h-3 w-16 rounded-sm overflow-hidden bg-slate-800">
                    <div className="h-full rounded-sm bg-indigo-500/70 transition-all" style={{ width: `${Math.abs(v) * 100}%` }} />
                  </div>
                ))}
              </div>
            </div>

            <div className={`text-slate-${isExpanded ? '400' : '700'} text-lg transition-colors`}>→</div>

            {/* Hidden layer */}
            <div className="flex-shrink-0 text-center">
              <div className={`text-xs mb-2 transition-colors ${isExpanded ? 'text-amber-400' : 'text-slate-600'}`}>Expanded<br />(d×4=24)</div>
              <div className="flex flex-col gap-0.5">
                {HIDDEN.map((v, i) => (
                  <NeuronBar key={i} value={v} maxVal={maxH} color="#f59e0b" active={isExpanded} />
                ))}
              </div>
            </div>

            <div className={`text-slate-${isActivated ? '400' : '700'} text-lg transition-colors`}>→</div>

            {/* Activated */}
            <div className="flex-shrink-0 text-center">
              <div className={`text-xs mb-2 transition-colors ${isActivated ? 'text-orange-400' : 'text-slate-600'}`}>{actName}<br />(sparse)</div>
              <div className="flex flex-col gap-0.5">
                {activated.map((v, i) => (
                  <NeuronBar key={i} value={v} maxVal={maxA > 0 ? maxA : 1} color="#f97316" active={isActivated} />
                ))}
              </div>
            </div>

            <div className={`text-slate-${isCompressed ? '400' : '700'} text-lg transition-colors`}>→</div>

            {/* Output */}
            <div className="flex-shrink-0 text-center">
              <div className={`text-xs mb-2 transition-colors ${isCompressed ? 'text-emerald-400' : 'text-slate-600'}`}>Output<br />(d=8)</div>
              <div className="flex flex-col gap-1">
                {DEMO_INPUT.map((v, i) => (
                  <div key={i} className="h-3 w-16 rounded-sm overflow-hidden bg-slate-800">
                    <div className="h-full rounded-sm bg-emerald-500/70 transition-all duration-700"
                      style={{ width: isCompressed ? `${Math.abs(activated.slice(i * 3, i * 3 + 3).reduce((a, b) => a + b, 0) / 3 + 0.5) * 60 + 20}%` : '0%' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {STEPS.map((s, i) => (
              <button key={s.id} onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border transition-all ${step === i ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : i <= step ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-orange-500/40 text-orange-300' : 'bg-slate-800 text-slate-600'}`}>{i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">{STEPS[step].desc}</p>
        </div>

        {/* Activation functions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {Object.entries(ACTIVATIONS).map(([k, v]) => (
            <div key={k} className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${actName === k ? 'border-orange-500/40' : 'border-slate-800'}`} onClick={() => setActName(k)}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm" style={{ color: v.color }}>{v.label}</p>
                {actName === k && <span className="text-xs text-orange-400">active</span>}
              </div>
              <ActivationPlot fnName={k} />
              <p className="text-xs text-slate-500 mt-2">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Most Parameters Here', body: 'In a dense transformer, the FFN layers hold ~⅔ of all parameters — more than attention. A 7B model has ~5B params in FFN alone.' },
            { title: 'Factual Storage', body: 'Research (Geva et al.) shows specific FFN neurons encode specific facts. Some neurons activate specifically for "Rome → Italy" associations.' },
            { title: 'Per-Token, No Mixing', body: 'Unlike attention, the FFN processes each token\'s vector independently — no information flows between tokens at this stage.' },
          ].map(c => (
            <div key={c.title} className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
              <p className="text-orange-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
