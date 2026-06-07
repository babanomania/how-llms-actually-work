import { useState } from 'react'

const WORDS = [
  { word: 'king',      x: 78, y: 18, group: 'royalty', dim: [0.9, 0.8,-0.2, 0.7, 0.1, 0.6,-0.3, 0.8] },
  { word: 'queen',     x: 72, y: 24, group: 'royalty', dim: [0.8, 0.7, 0.3, 0.6, 0.2, 0.5, 0.4, 0.7] },
  { word: 'prince',    x: 83, y: 30, group: 'royalty', dim: [0.7,0.75,-0.1,0.65,0.15,0.55,-0.2,0.75] },
  { word: 'throne',    x: 74, y: 34, group: 'royalty', dim: [0.6,0.65,-0.3,0.55,0.05,0.45,-0.5,0.65] },
  { word: 'crown',     x: 68, y: 26, group: 'royalty', dim: [0.65,0.6,-0.1, 0.5, 0.0, 0.4,-0.4, 0.6] },

  { word: 'cat',       x: 20, y: 20, group: 'animals', dim: [-0.7, 0.3, 0.8,-0.2, 0.6,-0.4, 0.5, 0.2] },
  { word: 'dog',       x: 16, y: 28, group: 'animals', dim: [-0.8, 0.2, 0.9,-0.3, 0.7,-0.5, 0.4, 0.1] },
  { word: 'horse',     x: 12, y: 21, group: 'animals', dim: [-0.75,0.25,0.85,-0.25,0.65,-0.45,0.45,0.15] },
  { word: 'bird',      x: 23, y: 13, group: 'animals', dim: [-0.65,0.35,0.75,-0.15,0.55,-0.35,0.55,0.25] },
  { word: 'fish',      x: 14, y: 35, group: 'animals', dim: [-0.6, 0.2, 0.7,-0.3, 0.5,-0.5, 0.4, 0.1] },

  { word: 'python',    x: 82, y: 72, group: 'tech',    dim: [0.3,-0.7, 0.2, 0.8,-0.5, 0.6, 0.7,-0.3] },
  { word: 'code',      x: 76, y: 79, group: 'tech',    dim: [0.2,-0.8, 0.3, 0.9,-0.4, 0.7, 0.6,-0.4] },
  { word: 'algorithm', x: 87, y: 65, group: 'tech',    dim: [0.25,-0.75,0.25,0.85,-0.45,0.65,0.65,-0.35] },
  { word: 'data',      x: 71, y: 75, group: 'tech',    dim: [0.15,-0.85,0.2, 0.95,-0.35,0.75,0.55,-0.45] },
  { word: 'neural',    x: 80, y: 83, group: 'tech',    dim: [0.35,-0.65,0.35,0.75,-0.55,0.55,0.75,-0.25] },

  { word: 'pizza',     x: 18, y: 73, group: 'food',    dim: [-0.5,-0.6,-0.4,-0.3, 0.8, 0.7,-0.5,-0.6] },
  { word: 'bread',     x: 24, y: 79, group: 'food',    dim: [-0.4,-0.7,-0.3,-0.4, 0.7, 0.8,-0.4,-0.7] },
  { word: 'apple',     x: 13, y: 65, group: 'food',    dim: [-0.45,-0.65,-0.35,-0.35,0.75,0.75,-0.45,-0.65] },
  { word: 'rice',      x: 28, y: 83, group: 'food',    dim: [-0.35,-0.75,-0.25,-0.45,0.65,0.85,-0.35,-0.75] },
  { word: 'coffee',    x: 20, y: 87, group: 'food',    dim: [-0.3,-0.8,-0.2,-0.5, 0.6, 0.9,-0.3,-0.8] },

  { word: 'happy',     x: 50, y: 40, group: 'emotion', dim: [0.1, 0.1,-0.1, 0.1,-0.1, 0.9, 0.8, 0.1] },
  { word: 'sad',       x: 44, y: 48, group: 'emotion', dim: [0.0, 0.0,-0.2, 0.0,-0.2,-0.9,-0.8, 0.0] },
  { word: 'angry',     x: 57, y: 44, group: 'emotion', dim: [0.15,0.05,-0.15,0.15,-0.15,-0.7,0.75,0.05] },
  { word: 'love',      x: 48, y: 55, group: 'emotion', dim: [0.05,0.15,-0.05,0.05,-0.05,0.85, 0.9,0.15] },
  { word: 'fear',      x: 53, y: 63, group: 'emotion', dim: [-0.05,-0.1,-0.2,-0.05,-0.2,-0.6,0.7,-0.1] },
]

const GROUPS = {
  royalty: { dot: '#f59e0b', label: 'Royalty' },
  animals: { dot: '#22c55e', label: 'Animals' },
  tech:    { dot: '#3b82f6', label: 'Technology' },
  food:    { dot: '#ef4444', label: 'Food' },
  emotion: { dot: '#a855f7', label: 'Emotions' },
}

function cosineSim(a, b) {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0)
  const ma  = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
  const mb  = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
  return dot / (ma * mb)
}

function nearest(word, n = 3) {
  const t = WORDS.find(w => w.word === word)
  if (!t) return []
  return WORDS.filter(w => w.word !== word)
    .map(w => ({ ...w, sim: cosineSim(t.dim, w.dim) }))
    .sort((a, b) => b.sim - a.sim).slice(0, n)
}

const W = 500, H = 380, PAD = 28
const sx = pct => PAD + (pct / 100) * (W - 2 * PAD)
const sy = pct => PAD + (pct / 100) * (H - 2 * PAD)

export default function EmbeddingsSection() {
  const [hovered, setHovered] = useState(null)
  const [selected, setSelected] = useState(null)

  const active = hovered || selected
  const nbrs = active ? nearest(active) : []
  const activeW = WORDS.find(w => w.word === active)

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-xs">02</span>
            <h2 className="text-2xl font-bold text-white">Embeddings</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            Token IDs are just row-indexes into an <strong className="text-slate-200">embedding matrix</strong>. Each row is a learned
            high-dimensional vector — words used in similar contexts end up geometrically close together. Hover any word below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Scatter plot */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">2D Embedding Space (PCA projection)</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-slate-950/60" style={{ maxHeight: 340 }}>
              {/* grid */}
              {[25,50,75].map(p => (
                <g key={p}>
                  <line x1={sx(p)} y1={PAD} x2={sx(p)} y2={H-PAD} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,4" />
                  <line x1={PAD} y1={sy(p)} x2={W-PAD} y2={sy(p)} stroke="#1e293b" strokeWidth="1" strokeDasharray="3,4" />
                </g>
              ))}
              {/* neighbour lines */}
              {activeW && nbrs.map(n => (
                <line key={n.word}
                  x1={sx(activeW.x)} y1={sy(activeW.y)} x2={sx(n.x)} y2={sy(n.y)}
                  stroke="#818cf8" strokeWidth="1.5" strokeDasharray="5,4" opacity="0.6" />
              ))}
              {WORDS.map(w => {
                const isActive   = w.word === active
                const isNeighbor = nbrs.some(n => n.word === w.word)
                const g = GROUPS[w.group]
                const fade = active && !isActive && !isNeighbor
                return (
                  <g key={w.word} transform={`translate(${sx(w.x)},${sy(w.y)})`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHovered(w.word)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => setSelected(s => s === w.word ? null : w.word)}>
                    <circle r={isActive ? 9 : isNeighbor ? 7 : 5}
                      fill={g.dot} opacity={fade ? 0.2 : 0.85}
                      stroke={isActive ? '#fff' : 'none'} strokeWidth="2" />
                    <text dy={isActive ? -14 : -10} textAnchor="middle"
                      fill={isActive ? '#fff' : isNeighbor ? g.dot : '#94a3b8'}
                      fontSize={isActive ? 12 : 10}
                      fontWeight={isActive || isNeighbor ? 'bold' : 'normal'}
                      opacity={fade ? 0.3 : 1}>
                      {w.word}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Side panel */}
          <div className="flex flex-col gap-4">
            {/* Legend */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Clusters</p>
              {Object.entries(GROUPS).map(([k, g]) => (
                <div key={k} className="flex items-center gap-2 mb-1.5">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: g.dot }} />
                  <span className="text-xs text-slate-400">{g.label}</span>
                </div>
              ))}
            </div>

            {/* Nearest neighbours */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex-1">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">
                {active ? `Nearest to "${active}"` : 'Hover a word'}
              </p>
              {active ? nbrs.map((n, i) => (
                <div key={n.word} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-xs w-4">{i + 1}.</span>
                    <div className="w-2 h-2 rounded-full" style={{ background: GROUPS[n.group].dot }} />
                    <span className="text-slate-300 text-sm">{n.word}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{n.sim.toFixed(2)}</span>
                </div>
              )) : (
                <p className="text-xs text-slate-600 italic">Click or hover any word to see its nearest semantic neighbours</p>
              )}
            </div>

            {/* Vector arithmetic */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
              <p className="text-indigo-400 font-semibold text-xs mb-2">Vector Arithmetic</p>
              <div className="font-mono text-sm space-y-0.5">
                <div className="text-slate-300">king <span className="text-slate-600">−</span> man</div>
                <div className="text-slate-500 text-xs pl-2">+ woman</div>
                <div className="text-slate-600">≈</div>
                <div className="text-emerald-400 font-bold">queen ✓</div>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Semantic relationships are geometric directions in the space.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Lookup Table', body: 'The embedding matrix is a giant table. Token ID 3967 always maps to the same 4,096-dimensional vector — no computation, just a read.' },
            { title: 'Learned, Not Designed', body: 'Vectors aren\'t hand-crafted. They emerge from training: similar words must share structure for the model to predict well.' },
            { title: 'High Dimensional', body: 'Real embeddings are 4,096–8,192 dimensional. The 2D plot is a PCA-compressed illustration — the actual geometry is far richer.' },
          ].map(c => (
            <div key={c.title} className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
              <p className="text-violet-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
