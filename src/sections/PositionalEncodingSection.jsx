import { useState, useMemo } from 'react'

const D_MODEL = 32
const MAX_POS = 20

function pe(pos, dim) {
  const i = Math.floor(dim / 2)
  const angle = pos / Math.pow(10000, (2 * i) / D_MODEL)
  return dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle)
}

function valToColor(v) {
  // -1 → dark blue, 0 → slate, +1 → bright indigo
  const t = (v + 1) / 2
  const r = Math.round(15 + t * 60)
  const g = Math.round(23 + t * 60)
  const b = Math.round(42 + t * 160)
  return `rgb(${r},${g},${b})`
}

export default function PositionalEncodingSection({ embedded = false }) {
  const [hoverPos, setHoverPos] = useState(null)
  const [hoverDim, setHoverDim] = useState(null)
  const [selPos, setSelPos] = useState(5)

  const grid = useMemo(() =>
    Array.from({ length: MAX_POS }, (_, pos) =>
      Array.from({ length: D_MODEL }, (_, dim) => pe(pos, dim))
    ), [])

  const CELL = 18

  return (
    <section className={embedded ? '' : 'px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50'}>
      <div className="max-w-4xl mx-auto">
        <div className={embedded ? 'hidden' : 'mb-10'}>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-xs">03</span>
            <h2 className="text-2xl font-bold text-white">Positional Encoding</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            Transformers process all tokens in parallel — they have no built-in sense of order.
            <strong className="text-slate-200"> Positional encodings</strong> add a unique pattern to each position's
            embedding so the model knows where each token sits in the sequence.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Heatmap */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
              Encoding values — {MAX_POS} positions × {D_MODEL} dimensions (click a row)
            </p>
            <div className="overflow-x-auto">
              <div>
                {/* dim header */}
                <div className="flex mb-1" style={{ paddingLeft: 40 }}>
                  {Array.from({ length: D_MODEL / 4 }, (_, i) => (
                    <div key={i} style={{ width: CELL * 4, fontSize: 10, color: '#475569', textAlign: 'center' }}>{i * 4}</div>
                  ))}
                </div>
                {grid.map((row, pos) => (
                  <div key={pos} className="flex items-center mb-0.5">
                    <div style={{ width: 36, fontSize: 10, color: pos === selPos ? '#34d399' : '#475569', textAlign: 'right', paddingRight: 6, flexShrink: 0 }}>
                      {pos}
                    </div>
                    {row.map((val, dim) => {
                      const isRow = hoverPos === pos
                      const isCol = hoverDim === dim
                      const isSel = pos === selPos
                      return (
                        <div
                          key={dim}
                          style={{
                            width: CELL - 2, height: CELL - 2,
                            background: valToColor(val),
                            marginRight: 2,
                            borderRadius: 3,
                            opacity: hoverPos !== null && !isRow && !isCol ? 0.35 : 1,
                            outline: isSel && isRow ? '2px solid #34d399' : isRow || isSel ? '1.5px solid #6366f1' : 'none',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          onMouseEnter={() => { setHoverPos(pos); setHoverDim(dim) }}
                          onMouseLeave={() => { setHoverPos(null); setHoverDim(null) }}
                          onClick={() => setSelPos(pos)}
                          title={`pos=${pos} dim=${dim}: ${val.toFixed(3)}`}
                        />
                      )
                    })}
                  </div>
                ))}
                {/* colour scale */}
                <div className="flex items-center gap-2 mt-3">
                  <span style={{ fontSize: 10, color: '#475569' }}>−1</span>
                  <div className="flex h-2.5 rounded overflow-hidden" style={{ width: 80 }}>
                    {Array.from({ length: 20 }, (_, i) => (
                      <div key={i} style={{ flex: 1, background: valToColor(-1 + (i / 19) * 2) }} />
                    ))}
                  </div>
                  <span style={{ fontSize: 10, color: '#475569' }}>+1</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4">
            {/* Formula */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Formula</p>
              <div className="space-y-2">
                <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs">
                  <span className="text-green-400">PE</span>(pos, 2i) =<br />
                  <span className="ml-2 text-yellow-400">sin</span>(pos / 10000^(2i/d))
                </div>
                <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs">
                  <span className="text-green-400">PE</span>(pos, 2i+1) =<br />
                  <span className="ml-2 text-yellow-400">cos</span>(pos / 10000^(2i/d))
                </div>
              </div>
            </div>

            {/* Selected row */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                Position {selPos} — first 8 dims
              </p>
              <div className="grid grid-cols-4 gap-1">
                {grid[selPos]?.slice(0, 8).map((val, i) => (
                  <div key={i} className="rounded p-1.5 text-center" style={{ background: valToColor(val) }}>
                    <div className="text-xs font-mono text-slate-300">{val.toFixed(2)}</div>
                    <div className="text-xs text-slate-600">d{i}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hovered cell */}
            {hoverPos !== null && hoverDim !== null && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-400 font-semibold text-xs mb-2">Cell</p>
                <div className="font-mono text-xs space-y-1">
                  <div className="text-slate-400">pos <span className="text-white">{hoverPos}</span></div>
                  <div className="text-slate-400">dim <span className="text-white">{hoverDim}</span></div>
                  <div className="text-slate-400">val <span className="text-emerald-400">{pe(hoverPos, hoverDim).toFixed(4)}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={embedded ? 'hidden' : 'grid grid-cols-1 md:grid-cols-3 gap-4'}>
          {[
            { title: 'Why Sinusoidal?', body: 'Each dimension oscillates at a different frequency, creating a unique fingerprint per position. Low dims = slow waves (global); high dims = fast waves (local).' },
            { title: 'Modern: RoPE', body: 'Most current LLMs (LLaMA, Mistral, GPT-4) use Rotary Position Embeddings. RoPE rotates the Q and K vectors by position, encoding relative distance naturally.' },
            { title: 'Added, Not Stacked', body: 'The positional vector is added element-wise to the token embedding — same dimensionality, no extra parameters, position and meaning live in the same space.' },
          ].map(c => (
            <div key={c.title} className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
              <p className="text-green-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
