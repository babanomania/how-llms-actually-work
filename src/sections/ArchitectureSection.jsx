import { useState } from 'react'

const BLOCKS = [
  {
    id: 'input',
    label: 'Input Text',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.3)',
    section: null,
    desc: 'Raw text string: "The cat sat on the mat"',
  },
  {
    id: 'tokenizer',
    label: 'Tokenizer',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.1)',
    border: 'rgba(59,130,246,0.3)',
    section: 'tokenization',
    desc: 'BPE splits text → integer token IDs: [262, 3797, 7531, 402, 262, 17664]',
  },
  {
    id: 'embedding',
    label: 'Token + Positional Embedding',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.3)',
    section: 'embeddings',
    desc: 'Lookup token embeddings (d=4096), add sinusoidal or RoPE positional encodings.',
  },
  {
    id: 'transformer',
    label: 'Transformer Block × N',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    section: 'attention',
    desc: 'Repeated N times (e.g. 32× for 7B model). Each block = RMSNorm → Attention → Residual → RMSNorm → FFN → Residual.',
    children: [
      { id: 'rmsnorm1', label: 'RMSNorm', color: '#14b8a6', section: 'residual' },
      { id: 'mhsa',     label: 'Multi-Head Self-Attention', color: '#f59e0b', section: 'attention' },
      { id: 'res1',     label: '+ Residual',  color: '#64748b', section: 'residual' },
      { id: 'rmsnorm2', label: 'RMSNorm', color: '#14b8a6', section: 'residual' },
      { id: 'ffn',      label: 'Feed-Forward Network',  color: '#f97316', section: 'feed-forward' },
      { id: 'res2',     label: '+ Residual',  color: '#64748b', section: 'residual' },
    ],
  },
  {
    id: 'norm',
    label: 'Final RMSNorm',
    color: '#14b8a6',
    bg: 'rgba(20,184,166,0.1)',
    border: 'rgba(20,184,166,0.3)',
    section: 'residual',
    desc: 'Normalise the final hidden states before projecting to vocabulary.',
  },
  {
    id: 'lm_head',
    label: 'LM Head (Linear)',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.3)',
    section: 'next-token',
    desc: 'W_vocab (d × vocab_size) projects each hidden state to raw logits — one per vocabulary token.',
  },
  {
    id: 'softmax',
    label: 'Softmax → Sample',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    section: 'next-token',
    desc: 'Softmax + temperature/top-k sampling picks the next token. Repeat until EOS.',
  },
]

const MODELS = [
  { name: 'GPT-2 (small)', params: '117M', layers: 12, heads: 12, d: 768,  vocab: '50k',   ctx: '1k' },
  { name: 'LLaMA 3 8B',   params: '8B',   layers: 32, heads: 32, d: 4096, vocab: '128k',  ctx: '128k' },
  { name: 'LLaMA 3 70B',  params: '70B',  layers: 80, heads: 64, d: 8192, vocab: '128k',  ctx: '128k' },
  { name: 'GPT-4 (est.)', params: '~1.8T',layers: 120,heads: 96, d: 12288,vocab: '~100k', ctx: '128k' },
]

export default function ArchitectureSection({ embedded = false }) {
  const [activeBlock, setActiveBlock] = useState(null)
  const [expandedBlock, setExpandedBlock] = useState('transformer')

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <section className={embedded ? '' : 'px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50'}>
      <div className="max-w-4xl mx-auto">
        <div className={embedded ? 'hidden' : 'mb-10'}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">09</span>
            <h2 className="text-2xl font-bold text-white">Full Architecture</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            Every component you've explored fits into this stack. Click any block to revisit that section.
            Modern LLMs share this blueprint — differences live in scale, training data, and fine-tuning.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Architecture diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Transformer stack — click to explore</p>
            <div className="flex flex-col gap-2">
              {BLOCKS.map((block, i) => (
                <div key={block.id}>
                  {/* Connector arrow */}
                  {i > 0 && (
                    <div className="flex justify-center my-0.5">
                      <div className="w-0.5 h-4 bg-slate-700" />
                    </div>
                  )}

                  {block.id === 'transformer' ? (
                    /* Transformer block with children */
                    <div className="border rounded-xl overflow-hidden" style={{ borderColor: block.border }}>
                      <button
                        onClick={() => { setExpandedBlock(b => b === 'transformer' ? null : 'transformer'); setActiveBlock(block) }}
                        className="w-full flex items-center justify-between px-4 py-3 transition-all text-left"
                        style={{ background: activeBlock?.id === 'transformer' ? block.bg : 'transparent' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: block.color }} />
                          <span className="text-sm font-semibold" style={{ color: block.color }}>{block.label}</span>
                        </div>
                        <span className="text-slate-600 text-xs">{expandedBlock === 'transformer' ? '▲' : '▼'}</span>
                      </button>

                      {expandedBlock === 'transformer' && (
                        <div className="px-4 pb-3 space-y-1.5 border-t" style={{ borderColor: block.border }}>
                          {block.children.map(child => (
                            <button
                              key={child.id}
                              onClick={() => child.section && scrollTo(child.section)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all hover:bg-slate-800/80 text-left"
                            >
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: child.color }} />
                              <span style={{ color: child.color }}>{child.label}</span>
                              {child.section && <span className="ml-auto text-slate-700 text-xs">↗</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setActiveBlock(block); if (block.section) scrollTo(block.section) }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:opacity-90"
                      style={{
                        background: activeBlock?.id === block.id ? block.bg : 'rgba(15,23,42,0.5)',
                        borderColor: activeBlock?.id === block.id ? block.border : '#1e293b',
                      }}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: block.color }} />
                      <span className="text-sm font-medium" style={{ color: block.color }}>{block.label}</span>
                      {block.section && <span className="ml-auto text-slate-700 text-xs">↗</span>}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info + model comparison */}
          <div className="flex flex-col gap-4">
            {/* Selected block details */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" style={{ minHeight: 140 }}>
              {activeBlock ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeBlock.color }} />
                    <p className="font-semibold text-sm" style={{ color: activeBlock.color }}>{activeBlock.label}</p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3">{activeBlock.desc}</p>
                  {activeBlock.section && (
                    <button onClick={() => scrollTo(activeBlock.section)}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                      style={{ borderColor: activeBlock.color + '60', color: activeBlock.color, background: activeBlock.bg }}>
                      ↑ Jump to {activeBlock.section} section
                    </button>
                  )}
                </>
              ) : (
                <p className="text-slate-600 text-sm italic">Click any block to see details</p>
              )}
            </div>

            {/* Model comparison */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Real model configs</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-600">
                      <th className="text-left pb-2 font-medium">Model</th>
                      <th className="text-right pb-2 font-medium">Params</th>
                      <th className="text-right pb-2 font-medium">Layers</th>
                      <th className="text-right pb-2 font-medium">d_model</th>
                      <th className="text-right pb-2 font-medium">Context</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODELS.map((m, i) => (
                      <tr key={m.name} className={`border-t border-slate-800 ${i === 0 ? 'text-slate-500' : 'text-slate-300'}`}>
                        <td className="py-2 font-medium">{m.name}</td>
                        <td className="text-right py-2 font-mono text-indigo-400">{m.params}</td>
                        <td className="text-right py-2 font-mono">{m.layers}</td>
                        <td className="text-right py-2 font-mono">{m.d}</td>
                        <td className="text-right py-2 font-mono text-emerald-400">{m.ctx}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2023-2025 consensus */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <p className="text-indigo-400 font-semibold text-xs mb-2">2023–2025 Architecture Consensus</p>
              <div className="space-y-1.5">
                {[
                  ['Pre-norm',  'RMSNorm before each sub-layer'],
                  ['RoPE',      'Rotary positional embeddings'],
                  ['SwiGLU',    'Feed-forward activation'],
                  ['GQA',       'Grouped-query attention'],
                  ['No biases', 'Linear layers without bias terms'],
                ].map(([feat, desc]) => (
                  <div key={feat} className="flex items-start gap-2">
                    <span className="text-emerald-400 text-xs font-mono font-bold w-20 flex-shrink-0">{feat}</span>
                    <span className="text-slate-500 text-xs">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Final summary */}
        <div className={embedded ? 'hidden' : 'bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-xl p-6'}>
          <h3 className="text-lg font-bold text-white mb-3">That's the forward pass — the core loop</h3>
          <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-2xl">
            Text → tokens → embeddings + positions → N × (attention + FFN + residuals) → logits → softmax → next token.
            You now understand the machinery. But a freshly built transformer is useless — it has random weights.
            Keep going to see how it <strong className="text-slate-300">learns</strong>, how it becomes an <strong className="text-slate-300">assistant</strong>,
            how it actually <strong className="text-slate-300">runs</strong>, and why it <strong className="text-slate-300">hallucinates</strong>.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Tokenization', id: 'tokenization' },
              { label: 'Embeddings', id: 'embeddings' },
              { label: 'Attention', id: 'attention' },
              { label: 'FFN', id: 'feed-forward' },
              { label: 'Next-Token', id: 'next-token' },
            ].map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition-all">
                ↑ Review {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
