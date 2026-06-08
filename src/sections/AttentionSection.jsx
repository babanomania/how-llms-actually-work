import { useState } from 'react'

const EXAMPLES = {
  'The cat sat on the mat': {
    tokens: ['The', 'cat', 'sat', 'on', 'the', 'mat'],
    matrix: [
      [0.40, 0.25, 0.10, 0.08, 0.10, 0.07],
      [0.12, 0.48, 0.18, 0.05, 0.08, 0.09],
      [0.06, 0.30, 0.35, 0.10, 0.06, 0.13],
      [0.08, 0.10, 0.12, 0.40, 0.12, 0.18],
      [0.22, 0.15, 0.08, 0.10, 0.35, 0.10],
      [0.06, 0.18, 0.15, 0.22, 0.08, 0.31],
    ],
    insight: '"sat" attends strongly to "cat" (its subject). "mat" attends to "on" (its preposition).',
  },
  'She gave him the book': {
    tokens: ['She', 'gave', 'him', 'the', 'book'],
    matrix: [
      [0.45, 0.20, 0.08, 0.12, 0.15],
      [0.25, 0.28, 0.18, 0.12, 0.17],
      [0.12, 0.22, 0.40, 0.12, 0.14],
      [0.10, 0.08, 0.08, 0.32, 0.42],
      [0.08, 0.22, 0.10, 0.25, 0.35],
    ],
    insight: '"gave" attends to both "She" (subject) and "him" (indirect object). "the" attends to "book" it modifies.',
  },
  'The dog chased its tail': {
    tokens: ['The', 'dog', 'chased', 'its', 'tail'],
    matrix: [
      [0.42, 0.28, 0.10, 0.08, 0.12],
      [0.20, 0.42, 0.18, 0.10, 0.10],
      [0.08, 0.28, 0.32, 0.12, 0.20],
      [0.10, 0.38, 0.12, 0.25, 0.15],
      [0.06, 0.14, 0.18, 0.22, 0.40],
    ],
    insight: '"its" attends strongly to "dog" — the model resolves the possessive pronoun to its referent!',
  },
}

export default function AttentionSection({ embedded = false }) {
  const [exKey, setExKey] = useState(Object.keys(EXAMPLES)[0])
  const [selRow, setSelRow] = useState(null)
  const { tokens, matrix, insight } = EXAMPLES[exKey]

  const getColor = (w, row) => {
    if (selRow === null) return `rgba(99,102,241,${w * 0.85 + 0.05})`
    if (selRow === row) return `rgba(99,102,241,${w * 0.9 + 0.05})`
    return `rgba(99,102,241,${w * 0.25 + 0.03})`
  }

  return (
    <section className={embedded ? '' : 'px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50'}>
      <div className="max-w-4xl mx-auto">
        <div className={embedded ? 'hidden' : 'mb-10'}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">04</span>
            <h2 className="text-2xl font-bold text-white">Attention Mechanism</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            Every token produces three vectors — a <strong className="text-slate-200">Query</strong> ("what am I looking for?"),
            a <strong className="text-slate-200">Key</strong> ("what do I offer?"), and
            a <strong className="text-slate-200">Value</strong> ("what I pass when matched").
            Dot products between Q and K determine how much each token attends to every other.
          </p>
        </div>

        {/* Q K V explainer */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Query (Q)', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', desc: 'What this token is searching for in others' },
            { label: 'Key (K)',   color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',    desc: 'What this token advertises about itself' },
            { label: 'Value (V)', color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',   desc: 'The information passed when Q·K score is high' },
          ].map(c => (
            <div key={c.label} className={`border rounded-xl p-4 ${c.color}`}>
              <p className="font-semibold text-sm mb-1">{c.label}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Heatmap */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Attention weights — click a row token</p>
              <select
                value={exKey}
                onChange={e => { setExKey(e.target.value); setSelRow(null) }}
                className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
              >
                {Object.keys(EXAMPLES).map(k => <option key={k}>{k}</option>)}
              </select>
            </div>

            {/* Column headers (Keys) */}
            <div className="flex mb-1 ml-16">
              {tokens.map((t, i) => (
                <div key={i} className={`flex-1 text-center text-xs font-mono py-1 ${selRow !== null && matrix[selRow][i] > 0.15 ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                  {t}
                </div>
              ))}
            </div>

            {/* Rows */}
            {tokens.map((tok, row) => (
              <div key={row} className="flex items-center mb-1">
                <div
                  onClick={() => setSelRow(r => r === row ? null : row)}
                  className={`w-14 text-right pr-2 text-xs font-mono cursor-pointer transition-colors select-none ${selRow === row ? 'text-amber-300 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tok}
                </div>
                {matrix[row].map((w, col) => (
                  <div key={col}
                    className="flex-1 mx-0.5 rounded flex items-center justify-center text-xs font-mono transition-all cursor-pointer hover:scale-105"
                    style={{ height: 36, background: getColor(w, row), color: w > 0.3 ? '#fff' : '#64748b' }}
                    onClick={() => setSelRow(r => r === row ? null : row)}
                    title={`${tok} → ${tokens[col]}: ${(w * 100).toFixed(0)}%`}
                  >
                    {(w * 100).toFixed(0)}%
                  </div>
                ))}
              </div>
            ))}

            <p className="text-xs text-slate-600 mt-3 italic">Each row = where that token directs its attention (sums to 100%)</p>
          </div>

          {/* Info panel */}
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">How it works</p>
              <div className="space-y-3">
                {[
                  { step: '1', label: 'Project', desc: 'Each embedding → Q, K, V via learned weight matrices' },
                  { step: '2', label: 'Score',   desc: 'score(i,j) = Qᵢ · Kⱼ / √dₖ' },
                  { step: '3', label: 'Soften',  desc: 'softmax(scores) → attention weights (sum = 1)' },
                  { step: '4', label: 'Mix',     desc: 'output = Σ weight × Value' },
                ].map(s => (
                  <div key={s.step} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{s.step}</span>
                    <div>
                      <span className="text-slate-300 text-xs font-semibold">{s.label} </span>
                      <span className="text-slate-500 text-xs">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 font-semibold text-xs mb-2">Insight</p>
              <p className="text-slate-400 text-xs leading-relaxed">{insight}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Causal masking</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                During generation, future tokens are masked to −∞ before softmax — a token at position 3 cannot attend to position 4+. This preserves autoregressive order.
              </p>
            </div>
          </div>
        </div>

        <div className={embedded ? 'hidden' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
          {[
            { title: 'O(n²) Cost', body: 'Every token attends to every other token — quadratic in sequence length. A 4k-token sequence has 16M attention pairs. This is why long context is expensive.' },
            { title: 'Scaled Dot-Product', body: 'Dividing by √dₖ prevents dot products from growing too large in high dimensions, keeping softmax gradients healthy during training.' },
            { title: 'KV Cache', body: 'During inference, Key and Value vectors for past tokens are cached. Each new token only needs to compute its own Q, then attend to the cached K/V pairs.' },
          ].map(c => (
            <div key={c.title} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <p className="text-amber-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
