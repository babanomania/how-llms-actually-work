import { useState, useMemo } from 'react'

const PROMPTS = [
  {
    text: 'The capital of France is',
    tokens: [
      { token: ' Paris',    logit: 4.20 },
      { token: ' Lyon',     logit: 1.80 },
      { token: ' located',  logit: 1.50 },
      { token: ' a',        logit: 1.20 },
      { token: ' famous',   logit: 0.90 },
    ],
  },
  {
    text: 'The best way to learn programming is to',
    tokens: [
      { token: ' practice', logit: 3.80 },
      { token: ' build',    logit: 3.20 },
      { token: ' read',     logit: 2.60 },
      { token: ' start',    logit: 2.10 },
      { token: ' write',    logit: 1.90 },
    ],
  },
  {
    text: '2 + 2 =',
    tokens: [
      { token: ' 4',  logit: 5.50 },
      { token: ' 5',  logit: 0.80 },
      { token: ' 3',  logit: 0.60 },
      { token: ' 22', logit: 0.40 },
      { token: ' 6',  logit: 0.30 },
    ],
  },
  {
    text: 'def fibonacci(n):',
    tokens: [
      { token: '\n    if',     logit: 3.60 },
      { token: '\n    return', logit: 2.80 },
      { token: '\n    n',      logit: 2.20 },
      { token: '\n    fib',    logit: 1.80 },
      { token: '\n    #',      logit: 1.40 },
    ],
  },
]

function softmax(logits, temp) {
  const scaled = logits.map(l => l / temp)
  const max = Math.max(...scaled)
  const exps = scaled.map(l => Math.exp(l - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

const TOPK_OPTIONS = [1, 2, 3, 5]
const COLORS = ['#6366f1','#8b5cf6','#a855f7','#c026d3','#db2777']

export default function NextTokenSection() {
  const [promptIdx, setPromptIdx] = useState(0)
  const [temp, setTemp] = useState(1.0)
  const [topK, setTopK] = useState(5)
  const [chosen, setChosen] = useState(null)

  const prompt = PROMPTS[promptIdx]
  const logits = prompt.tokens.map(t => t.logit)
  const probs  = useMemo(() => softmax(logits, temp), [logits, temp])

  const displayed = prompt.tokens.slice(0, topK)
  const displayedProbs = probs.slice(0, topK)
  const displayedSum = displayedProbs.reduce((a, b) => a + b, 0)
  const renormalized = displayedProbs.map(p => p / displayedSum)

  const handlePromptChange = (i) => { setPromptIdx(i); setChosen(null) }

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">08</span>
            <h2 className="text-2xl font-bold text-white">Next-Token Prediction</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            The final layer maps each token vector to <strong className="text-slate-200">logits</strong> — one raw score per vocabulary entry.
            Softmax turns these into probabilities. Decoding parameters like
            <strong className="text-slate-200"> temperature</strong> and <strong className="text-slate-200">top-k</strong> control how the next token is sampled.
          </p>
        </div>

        {/* Prompt selector */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Choose a prompt</p>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p, i) => (
              <button key={i} onClick={() => handlePromptChange(i)}
                className={`px-3 py-2 rounded-lg text-sm font-mono border transition-all ${promptIdx === i ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
                {p.text}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Probability bars */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Top-{topK} token probabilities</p>
              <p className="text-xs text-slate-600 font-mono">temp={temp.toFixed(1)}</p>
            </div>

            {/* Prompt display */}
            <div className="bg-slate-800 rounded-lg px-4 py-3 mb-5 font-mono text-sm">
              <span className="text-slate-300">{prompt.text}</span>
              {chosen !== null ? (
                <span className="text-emerald-400 font-bold">{prompt.tokens[chosen].token}</span>
              ) : (
                <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>

            {/* Bars */}
            <div className="space-y-3">
              {displayed.map((t, i) => {
                const pct = renormalized[i] * 100
                const isTop = i === 0
                return (
                  <div key={i}
                    onClick={() => setChosen(c => c === i ? null : i)}
                    className={`group cursor-pointer rounded-xl p-3 border transition-all ${chosen === i ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-transparent hover:border-slate-700 hover:bg-slate-800/50'}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 w-4 font-mono">{i + 1}</span>
                        <span className="font-mono text-sm text-slate-200">{t.token}</span>
                        {isTop && temp <= 0.5 && <span className="text-xs bg-emerald-500/20 text-emerald-400 px-1.5 rounded">greedy</span>}
                      </div>
                      <span className="font-mono text-sm font-bold" style={{ color: COLORS[i] }}>
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: COLORS[i] }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-600">logit: {t.logit.toFixed(2)}</span>
                      <span className="text-xs text-slate-600">raw prob: {(probs[i] * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
            {chosen !== null && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-slate-400">
                <span className="text-emerald-400 font-semibold">Selected:</span> "{prompt.text}{prompt.tokens[chosen].token}" — click another token or click again to deselect
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Temperature */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Temperature</p>
                <span className="text-rose-400 font-mono font-bold text-sm">{temp.toFixed(1)}</span>
              </div>
              <input type="range" min="0.1" max="2.0" step="0.1" value={temp}
                onChange={e => { setTemp(parseFloat(e.target.value)); setChosen(null) }}
                className="w-full accent-rose-500" />
              <div className="flex justify-between text-xs text-slate-600 mt-1">
                <span>0.1 (sharp)</span><span>2.0 (random)</span>
              </div>
              <div className="mt-3 text-xs text-slate-500 leading-relaxed space-y-1.5">
                <p><span className="text-slate-300">Low (0.1–0.5):</span> Near-deterministic. Top token almost always chosen. Factual answers.</p>
                <p><span className="text-slate-300">Mid (0.7–1.0):</span> Balanced. Creative but coherent.</p>
                <p><span className="text-slate-300">High (1.5+):</span> Chaotic. Low-probability tokens get sampled often.</p>
              </div>
            </div>

            {/* Top-k */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Top-K</p>
              <div className="flex gap-2">
                {TOPK_OPTIONS.map(k => (
                  <button key={k} onClick={() => { setTopK(k); setChosen(null) }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono border transition-all ${topK === k ? 'bg-rose-500/20 border-rose-500/40 text-rose-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                    {k}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Only sample from the top-K tokens. Lower = more focused, less surprising.
              </p>
            </div>

            {/* How it works */}
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
              <p className="text-rose-400 font-semibold text-xs mb-2">The pipeline</p>
              <div className="space-y-1.5 font-mono text-xs">
                {[
                  ['hidden state', '#94a3b8'],
                  ['× W_vocab', '#f59e0b'],
                  ['= logits (50k)', '#64748b'],
                  ['÷ temperature', '#f97316'],
                  ['softmax →', '#a855f7'],
                  ['sample token', '#22c55e'],
                ].map(([s, c]) => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c }} />
                    <span style={{ color: c }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Autoregressive', body: 'Each generated token is appended to the context, and the model runs again to predict the next. A 500-token response requires 500 forward passes.' },
            { title: 'Top-p (Nucleus)', body: 'An alternative to top-k: sample from the smallest set of tokens whose cumulative probability exceeds p (e.g. 0.9). Adapts to the distribution\'s shape.' },
            { title: 'Temperature = 0', body: 'At temperature → 0, softmax concentrates all mass on the highest-logit token. This is "greedy decoding" — deterministic but sometimes repetitive.' },
          ].map(c => (
            <div key={c.title} className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4">
              <p className="text-rose-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
