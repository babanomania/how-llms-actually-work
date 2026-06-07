import { useState } from 'react'

const LAYERS = [
  { name: 'Token Embedding', color: '#6366f1', desc: 'Raw token + positional embedding. Carries basic lexical meaning.' },
  { name: 'Attention L1',    color: '#a855f7', desc: 'Layer 1 attention refines context. Residual preserves original embedding.' },
  { name: 'FFN L1',          color: '#ec4899', desc: 'Feed-forward enriches token. Residual carries both old and new information.' },
  { name: 'Attention L2',    color: '#f59e0b', desc: 'Deeper syntactic relationships emerge. Earlier meaning still in the stream.' },
  { name: 'FFN L2',          color: '#f97316', desc: 'Higher-level semantics. Knowledge accumulates additively.' },
  { name: 'Attention L3',    color: '#22c55e', desc: 'Long-range dependencies resolved. Stream carries full context.' },
  { name: 'FFN L3',          color: '#14b8a6', desc: 'Task-specific features emerge. Ready for final prediction.' },
  { name: 'Final Output',    color: '#3b82f6', desc: 'Logits computed over vocabulary. All layers contributed additively.' },
]

export default function ResidualSection() {
  const [hovered, setHovered] = useState(null)
  const [animated, setAnimated] = useState(false)

  return (
    <section className="px-8 py-16 border-b border-slate-800/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">07</span>
            <h2 className="text-2xl font-bold text-white">Residual Stream</h2>
          </div>
          <p className="text-slate-400 leading-relaxed ml-11 max-w-2xl">
            Each sub-layer <em>adds</em> its output to its input rather than replacing it.
            This <strong className="text-slate-200">residual connection</strong> lets information flow
            unimpeded through all layers — and gives gradients a direct path back during training,
            enabling very deep networks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Residual flow diagram */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Information flow — hover a layer</p>
            <div className="flex gap-4">
              {/* Main stream */}
              <div className="flex flex-col items-center relative">
                <div className="text-xs text-slate-500 mb-2">stream</div>
                {LAYERS.map((layer, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-12 h-10 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all border"
                      style={{
                        background: hovered === i ? layer.color + '33' : '#1e293b',
                        borderColor: hovered === i ? layer.color : '#334155',
                        color: hovered === i ? layer.color : '#64748b',
                      }}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      L{i}
                    </div>
                    {i < LAYERS.length - 1 && (
                      <div className="w-0.5 h-4 bg-slate-700 relative">
                        <div
                          className="absolute inset-0 transition-all duration-300"
                          style={{ background: hovered !== null && hovered >= i ? LAYERS[i].color : 'transparent' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Residual bypass lines */}
              <div className="relative flex-1 flex flex-col justify-between py-5">
                {LAYERS.map((layer, i) => (
                  <div key={i} className="flex items-center gap-2 h-10 mb-4">
                    <div
                      className="h-0.5 flex-1 transition-all duration-300"
                      style={{ background: hovered === i ? layer.color : '#1e293b' }}
                    />
                    <div
                      className="flex-1 rounded-lg px-2 py-1 text-xs cursor-pointer transition-all border"
                      style={{
                        background: hovered === i ? layer.color + '15' : 'transparent',
                        borderColor: hovered === i ? layer.color + '60' : '#1e293b',
                        color: hovered === i ? '#e2e8f0' : '#475569',
                      }}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {layer.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {hovered !== null && (
              <div className="mt-3 p-3 rounded-lg border text-xs text-slate-400 transition-all"
                style={{ borderColor: LAYERS[hovered].color + '40', background: LAYERS[hovered].color + '10' }}>
                <span style={{ color: LAYERS[hovered].color }} className="font-semibold">{LAYERS[hovered].name}: </span>
                {LAYERS[hovered].desc}
              </div>
            )}
          </div>

          {/* Equation + explanation */}
          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">The residual equation</p>
              <div className="bg-slate-800 rounded-xl p-4 font-mono text-sm text-center space-y-3">
                <div>
                  <span className="text-red-400">x</span>
                  <span className="text-slate-500"> → attention → </span>
                  <span className="text-amber-400">Δx</span>
                </div>
                <div className="text-slate-600 text-lg">↓</div>
                <div className="text-xl">
                  <span className="text-emerald-400">x</span>
                  <span className="text-slate-400"> = </span>
                  <span className="text-red-400">x</span>
                  <span className="text-slate-400"> + </span>
                  <span className="text-amber-400">Δx</span>
                </div>
                <div className="text-xs text-slate-500 pt-1">same for FFN — always additive</div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Why it matters</p>
              <div className="space-y-3">
                {[
                  { icon: '🔀', title: 'Gradient highway', body: 'Loss gradients flow back through the "+" connection, bypassing saturated sub-layers. Enables 96-layer models to train.' },
                  { icon: '📦', title: 'Additive memory', body: 'The stream accumulates contributions. Layer 40 can "remember" the original token — nothing is lost, only added.' },
                  { icon: '⚡', title: 'Pre-norm placement', body: 'Modern models normalise before each sub-layer (Pre-LN), not after. This stabilises training at large scale.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-slate-200 text-xs font-semibold">{item.title}</p>
                      <p className="text-slate-500 text-xs leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LayerNorm explainer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Layer Normalisation (applied before each sub-layer)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                After residual addition, vectors can have very different scales, making training unstable.
                LayerNorm rescales each vector to unit variance.
              </p>
              <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
                <span className="text-green-400">RMSNorm</span>(x) =<br />
                <span className="ml-2">x / RMS(x) × γ</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: 'LayerNorm', desc: 'Original — subtracts mean, divides by std. Used in GPT-2.' },
                { label: 'RMSNorm', desc: 'Modern standard (LLaMA, Mistral). Skips the mean subtraction — faster, equally effective.' },
              ].map(n => (
                <div key={n.label} className="flex gap-3 items-start">
                  <span className="text-teal-400 text-xs font-mono font-bold flex-shrink-0 w-20">{n.label}</span>
                  <span className="text-slate-500 text-xs">{n.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Introduced in ResNet', body: 'Residual connections were first used in computer vision (He et al., 2016). Transformers adopted them directly — one of the key design choices that scales.' },
            { title: 'Information Bottleneck', body: 'Without residuals, each layer must compress and reconstruct all relevant information. Residuals free layers to specialise in refinements only.' },
            { title: 'Interpretability', body: 'The residual stream is a key concept in mechanistic interpretability — researchers trace how specific facts are written to and read from it.' },
          ].map(c => (
            <div key={c.title} className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-4">
              <p className="text-teal-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
