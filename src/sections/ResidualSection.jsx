import { useState, useEffect, useRef } from 'react'

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

export default function ResidualSection({ embedded = false }) {
  const [hovered, setHovered] = useState(null)
  const [step, setStep] = useState(0)        // how many layers have written to the stream
  const [playing, setPlaying] = useState(false)
  const stepRef = useRef(0)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      stepRef.current += 1
      setStep(stepRef.current)
      if (stepRef.current >= LAYERS.length) { setPlaying(false) }
    }, 700)
    return () => clearInterval(id)
  }, [playing])

  const reset = () => { setPlaying(false); stepRef.current = 0; setStep(0) }
  const toggle = () => {
    if (step >= LAYERS.length) { stepRef.current = 0; setStep(0) }
    setPlaying(p => !p)
  }

  // during playback the "active" layer is the one currently writing; otherwise hover wins
  const playingIdx = step > 0 ? step - 1 : null
  const active = playingIdx != null ? playingIdx : hovered
  const done = step >= LAYERS.length

  return (
    <section className={embedded ? '' : 'px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50'}>
      <div className="max-w-4xl mx-auto">
        <div className={embedded ? 'hidden' : 'mb-10'}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xs">07</span>
            <h2 className="text-2xl font-bold text-white">Residual Stream</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            Each sub-layer <em>adds</em> its output to its input rather than replacing it.
            This <strong className="text-slate-200">residual connection</strong> lets information flow
            unimpeded through all layers — and gives gradients a direct path back during training,
            enabling very deep networks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Animated accumulation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">Watch the stream accumulate</p>
              <div className="flex gap-2">
                <button onClick={toggle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all active:scale-95"
                  style={{ background: '#14b8a6' }}>
                  {playing ? (
                    <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg> Pause</>
                  ) : (
                    <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg> {done ? 'Replay' : 'Play'}</>
                  )}
                </button>
                <button onClick={reset}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-all active:scale-95">
                  Reset
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {/* layer column */}
              <div className="flex-1 flex flex-col gap-1.5">
                {LAYERS.map((layer, i) => {
                  const processed = i < step
                  const isActive = i === active
                  const isCurrent = playing && i === step - 1
                  return (
                    <div key={i} className="flex items-center gap-2"
                      onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                      <div
                        className="w-10 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer transition-all border flex-shrink-0"
                        style={{
                          background: processed || isActive ? layer.color + '22' : '#1e293b',
                          borderColor: processed || isActive ? layer.color : '#334155',
                          color: processed || isActive ? layer.color : '#64748b',
                          boxShadow: isCurrent ? `0 0 12px ${layer.color}` : 'none',
                          transform: isCurrent ? 'scale(1.05)' : 'scale(1)',
                        }}>
                        L{i}
                      </div>
                      <span className="text-xs truncate transition-colors flex-1"
                        style={{ color: processed || isActive ? '#cbd5e1' : '#475569' }}>
                        {layer.name}
                      </span>
                      <span className="text-xs font-mono transition-opacity flex-shrink-0"
                        style={{ color: layer.color, opacity: processed ? 1 : 0.2 }}>
                        +Δ
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* accumulation bar — each band persists, nothing overwritten */}
              <div className="flex flex-col gap-1.5 w-16 flex-shrink-0">
                {LAYERS.map((layer, i) => {
                  const filled = i < step
                  return (
                    <div key={i} className="h-8 rounded-lg transition-all duration-300 flex items-center justify-center"
                      style={{
                        background: filled ? layer.color : 'transparent',
                        opacity: filled ? 0.35 + 0.55 * ((i + 1) / LAYERS.length) : 1,
                        border: filled ? 'none' : '1px dashed #1e293b',
                      }}>
                      {filled && <span className="text-[10px] font-mono text-white/80">+{i}</span>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* status / desc */}
            <div className="mt-3 p-3 rounded-lg border text-xs transition-all min-h-[3.5rem]"
              style={{
                borderColor: active != null ? LAYERS[active].color + '40' : '#1e293b',
                background: active != null ? LAYERS[active].color + '10' : 'rgba(15,23,42,0.4)',
              }}>
              {active != null ? (
                <span className="text-slate-400">
                  <span style={{ color: LAYERS[active].color }} className="font-semibold">{LAYERS[active].name}: </span>
                  {LAYERS[active].desc}
                </span>
              ) : (
                <span className="text-slate-500">Press play, or hover a layer. Each one <strong className="text-slate-300">adds</strong> to the stream — the bands on the right pile up and none is ever erased.</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {done
                ? 'All 8 contributions still present in the stream — nothing was overwritten, only added.'
                : step > 0
                  ? `Stream now carries ${step} layer${step > 1 ? 's' : ''} of contributions. The original token embedding is still in there.`
                  : 'The stream starts as the token embedding and grows by addition at every layer.'}
            </p>
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

        <div className={embedded ? 'hidden' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
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
