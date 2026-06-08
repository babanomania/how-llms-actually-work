import { useState } from 'react'

const SENTENCE = ['The', 'cat', 'sat', 'on', 'the', 'mat']

const HEADS = [
  {
    name: 'Head 1 — Syntax',
    color: { ring: '#f59e0b', bg: 'rgba(245,158,11,', text: 'text-amber-400', border: 'border-amber-500/30', card: 'bg-amber-500/5' },
    desc: 'Tracks grammatical structure: subject → verb → object relationships.',
    matrix: [
      [0.50, 0.18, 0.10, 0.08, 0.08, 0.06],
      [0.15, 0.45, 0.22, 0.06, 0.07, 0.05],
      [0.08, 0.35, 0.38, 0.06, 0.07, 0.06],
      [0.06, 0.08, 0.12, 0.48, 0.12, 0.14],
      [0.20, 0.12, 0.06, 0.10, 0.42, 0.10],
      [0.05, 0.12, 0.10, 0.28, 0.08, 0.37],
    ],
  },
  {
    name: 'Head 2 — Coreference',
    color: { ring: '#a855f7', bg: 'rgba(168,85,247,', text: 'text-purple-400', border: 'border-purple-500/30', card: 'bg-purple-500/5' },
    desc: 'Resolves "the" references — links determiners back to their nouns.',
    matrix: [
      [0.20, 0.06, 0.05, 0.05, 0.55, 0.09],
      [0.08, 0.55, 0.15, 0.05, 0.08, 0.09],
      [0.05, 0.20, 0.48, 0.08, 0.05, 0.14],
      [0.05, 0.06, 0.10, 0.42, 0.10, 0.27],
      [0.52, 0.10, 0.05, 0.06, 0.18, 0.09],
      [0.05, 0.10, 0.12, 0.30, 0.05, 0.38],
    ],
  },
  {
    name: 'Head 3 — Positional',
    color: { ring: '#22c55e', bg: 'rgba(34,197,94,', text: 'text-emerald-400', border: 'border-emerald-500/30', card: 'bg-emerald-500/5' },
    desc: 'Attends to adjacent tokens — captures local n-gram context.',
    matrix: [
      [0.35, 0.40, 0.12, 0.05, 0.05, 0.03],
      [0.32, 0.25, 0.32, 0.06, 0.03, 0.02],
      [0.04, 0.35, 0.25, 0.28, 0.05, 0.03],
      [0.03, 0.05, 0.32, 0.28, 0.28, 0.04],
      [0.03, 0.04, 0.05, 0.32, 0.28, 0.28],
      [0.02, 0.03, 0.04, 0.08, 0.38, 0.45],
    ],
  },
  {
    name: 'Head 4 — Semantic',
    color: { ring: '#3b82f6', bg: 'rgba(59,130,246,', text: 'text-blue-400', border: 'border-blue-500/30', card: 'bg-blue-500/5' },
    desc: 'Finds semantically related pairs across the full sentence.',
    matrix: [
      [0.28, 0.14, 0.08, 0.12, 0.28, 0.10],
      [0.10, 0.38, 0.12, 0.08, 0.12, 0.20],
      [0.06, 0.22, 0.30, 0.14, 0.08, 0.20],
      [0.10, 0.08, 0.14, 0.32, 0.10, 0.26],
      [0.28, 0.12, 0.08, 0.10, 0.28, 0.14],
      [0.08, 0.18, 0.14, 0.22, 0.10, 0.28],
    ],
  },
]

function MiniHeatmap({ matrix, color, selRow, onRowClick }) {
  return (
    <div>
      <div className="flex mb-0.5 ml-10">
        {SENTENCE.map((t, i) => (
          <div key={i} className="flex-1 text-center" style={{ fontSize: 9, color: '#475569' }}>{t}</div>
        ))}
      </div>
      {SENTENCE.map((tok, row) => (
        <div key={row} className="flex items-center mb-0.5">
          <div
            className="text-right pr-1.5 cursor-pointer select-none"
            style={{ width: 36, fontSize: 9, color: selRow === row ? '#e2e8f0' : '#475569' }}
            onClick={() => onRowClick(selRow === row ? null : row)}
          >
            {tok}
          </div>
          {matrix[row].map((w, col) => (
            <div key={col} className="flex-1 mx-px rounded-sm transition-all"
              style={{ height: 22, background: `${color.bg}${selRow === null || selRow === row ? w * 0.85 + 0.08 : w * 0.2 + 0.02})` }}
              title={`${tok}→${SENTENCE[col]}: ${(w * 100).toFixed(0)}%`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function MultiHeadSection({ embedded = false }) {
  const [selRows, setSelRows] = useState([null, null, null, null])
  const [activeHead, setActiveHead] = useState(0)

  const setRow = (hi, row) => setSelRows(prev => prev.map((r, i) => i === hi ? row : r))

  return (
    <section className={embedded ? '' : 'px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50'}>
      <div className="max-w-4xl mx-auto">
        <div className={embedded ? 'hidden' : 'mb-10'}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 font-bold text-xs">05</span>
            <h2 className="text-2xl font-bold text-white">Multi-Head Attention</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            Instead of one attention pass, the model runs <strong className="text-slate-200">multiple heads in parallel</strong>,
            each with its own Q, K, V projections. Heads specialize spontaneously during training —
            some track grammar, others resolve references, others capture position.
          </p>
        </div>

        {/* Four heatmaps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {HEADS.map((h, hi) => (
            <div
              key={hi}
              onClick={() => setActiveHead(hi)}
              className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${activeHead === hi ? h.color.border + ' ring-1' : 'border-slate-800 hover:border-slate-700'}`}
              style={{ ringColor: h.color.ring }}
            >
              <p className={`text-xs font-semibold mb-3 ${h.color.text}`}>{h.name}</p>
              <MiniHeatmap
                matrix={h.matrix}
                color={h.color}
                selRow={selRows[hi]}
                onRowClick={row => setRow(hi, row)}
              />
            </div>
          ))}
        </div>

        {/* Active head detail */}
        <div className={`${HEADS[activeHead].color.card} border ${HEADS[activeHead].color.border} rounded-xl p-5 mb-6`}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: HEADS[activeHead].color.bg + '0.2)' }}>
              <span className={`text-sm font-bold ${HEADS[activeHead].color.text}`}>{activeHead + 1}</span>
            </div>
            <div>
              <p className={`font-semibold text-sm mb-1 ${HEADS[activeHead].color.text}`}>{HEADS[activeHead].name}</p>
              <p className="text-slate-400 text-sm leading-relaxed">{HEADS[activeHead].desc}</p>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">How multi-head works</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono">x</div>
            <span className="text-slate-600">→</span>
            {HEADS.map((h, i) => (
              <div key={i} className={`rounded-lg px-3 py-2 text-xs font-mono ${h.color.text}`} style={{ background: h.color.bg + '0.1)' }}>
                head_{i + 1}(Q, K, V)
              </div>
            ))}
            <span className="text-slate-600">→</span>
            <div className="bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 font-mono">concat + W_O</div>
            <span className="text-slate-600">→</span>
            <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg px-3 py-2 text-sm text-indigo-300 font-mono">output</div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Outputs from all heads are concatenated and projected back to model dimension via W_O.</p>
        </div>

        <div className={embedded ? 'hidden' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
          {[
            { title: 'Emergent Specialization', body: 'Heads aren\'t told what to learn. Syntactic, semantic, and positional heads emerge purely from minimizing prediction loss during training.' },
            { title: 'GQA for Efficiency', body: 'Grouped-Query Attention (used in LLaMA 2/3) shares K and V heads across multiple Q heads — reducing memory for the KV cache during inference.' },
            { title: 'Head Pruning', body: 'Research shows many heads are redundant. Models can lose 20–30% of heads with negligible quality loss, suggesting significant redundancy.' },
          ].map(c => (
            <div key={c.title} className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4">
              <p className="text-pink-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
