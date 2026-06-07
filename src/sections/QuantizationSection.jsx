import { useState } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards } from '../components/ui'

const ACCENT = 'lime'

const FORMATS = [
  { name: 'FP32', bits: 32, levels: 4.3e9,  quality: 1.00, label: 'full precision', note: 'Original training precision. Reference quality, biggest footprint.' },
  { name: 'FP16', bits: 16, levels: 65504,  quality: 0.999, label: 'half precision', note: 'The standard for serving. Essentially lossless vs FP32.' },
  { name: 'INT8', bits: 8,  levels: 256,    quality: 0.99,  label: '8-bit', note: 'Big savings, tiny quality dip. Common on consumer GPUs.' },
  { name: 'INT4', bits: 4,  levels: 16,     quality: 0.96,  label: '4-bit', note: 'Runs 70B models on a single GPU / laptop. Small but real quality loss.' },
]

const MODELS = [
  { name: '7B', params: 7e9 },
  { name: '13B', params: 13e9 },
  { name: '70B', params: 70e9 },
  { name: '405B', params: 405e9 },
]

const fmtGB = (bytes) => {
  const gb = bytes / 1e9
  if (gb >= 100) return gb.toFixed(0) + ' GB'
  return gb.toFixed(1) + ' GB'
}

// sample weights to visualise quantization snapping
const SAMPLE = [-0.82, -0.43, -0.11, 0.07, 0.29, 0.51, 0.68, 0.94]

// quantize a value in [-1,1] to N levels
const quantize = (v, levels) => {
  if (levels > 1000) return v
  const step = 2 / (levels - 1)
  return Math.round((v + 1) / step) * step - 1
}

export default function QuantizationSection() {
  const [fmtIdx, setFmtIdx] = useState(2)
  const [modelIdx, setModelIdx] = useState(2)

  const fmt = FORMATS[fmtIdx]
  const model = MODELS[modelIdx]
  const sizeBytes = model.params * (fmt.bits / 8)
  const fp32Bytes = model.params * 4

  return (
    <SectionShell>
      <SectionHeader num="16" title="Quantization" accent={ACCENT}>
        How does a 70-billion-parameter model run on a gaming laptop? Each weight is stored in <em>fewer bits</em>. A model is
        just a giant pile of numbers — store them at lower precision and the whole thing shrinks dramatically, with surprisingly
        little quality loss. Slide the precision and watch the size collapse.
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* precision selector + size */}
        <Panel label="Precision → model size">
          <div className="flex gap-2 mb-4">
            {FORMATS.map((f, i) => (
              <button key={f.name} onClick={() => setFmtIdx(i)}
                className={`flex-1 py-2 rounded-lg text-sm font-mono border transition-all ${fmtIdx === i ? 'bg-lime-500/20 border-lime-500/40 text-lime-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                {f.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500">model:</span>
            {MODELS.map((m, i) => (
              <button key={m.name} onClick={() => setModelIdx(i)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${modelIdx === i ? 'bg-slate-700 text-slate-200 border-slate-600' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                {m.name}
              </button>
            ))}
          </div>

          <div className="bg-slate-950/60 rounded-lg p-4 text-center mb-3">
            <div className="text-4xl font-bold text-lime-400">{fmtGB(sizeBytes)}</div>
            <div className="text-xs text-slate-500 mt-1">{model.name} model at {fmt.bits}-bit</div>
          </div>

          {/* shrink bar vs fp32 */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>vs FP32 ({fmtGB(fp32Bytes)})</span>
              <span className="text-lime-400 font-mono">{(fp32Bytes / sizeBytes).toFixed(0)}× smaller</span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-lime-500 rounded-full transition-all duration-500" style={{ width: `${(sizeBytes / fp32Bytes) * 100}%` }} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">{fmt.note}</p>
        </Panel>

        {/* quantization snapping viz */}
        <Panel label="What gets lost — snapping to a grid">
          <p className="text-xs text-slate-500 mb-3">
            Lower precision = fewer representable values. Each weight rounds to the nearest available level (
            <span className="font-mono text-lime-400">{fmt.levels > 1000 ? fmt.levels.toExponential(0) : fmt.levels}</span> of them).
          </p>

          {/* number line with levels */}
          <div className="relative h-10 mb-4">
            <div className="absolute top-5 left-0 right-0 h-px bg-slate-700" />
            {fmt.levels <= 256 && Array.from({ length: Math.min(fmt.levels, 33) }, (_, i) => {
              const x = (i / (Math.min(fmt.levels, 33) - 1)) * 100
              return <div key={i} className="absolute top-3.5 w-px h-3 bg-slate-600" style={{ left: `${x}%` }} />
            })}
            {fmt.levels > 256 && <div className="absolute top-4 left-0 right-0 text-center text-xs text-slate-600">≈ continuous</div>}
          </div>

          {/* weights: original vs quantized */}
          <div className="space-y-1.5">
            {SAMPLE.map((v, i) => {
              const q = quantize(v, fmt.levels)
              const err = Math.abs(v - q)
              return (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500 w-12 text-right">{v.toFixed(2)}</span>
                  <span className="text-slate-600">→</span>
                  <span className="w-12" style={{ color: err > 0.02 ? '#fbbf24' : '#84cc16' }}>{q.toFixed(2)}</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${err * 300}%`, background: err > 0.02 ? '#fbbf24' : '#84cc16' }} />
                  </div>
                  <span className="text-slate-600 w-10">{err > 0.001 ? '±' + err.toFixed(2) : '0'}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-600 mt-3">Yellow = rounding error introduced. At 4-bit the grid is coarse, but averaged over billions of weights the model still works.</p>
        </Panel>
      </div>

      {/* quality tradeoff */}
      <Panel label="The tradeoff — size vs quality" className="mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FORMATS.map((f, i) => (
            <button key={f.name} onClick={() => setFmtIdx(i)}
              className={`rounded-lg p-3 border text-center transition-all ${fmtIdx === i ? 'border-lime-500/50 bg-lime-500/5' : 'border-slate-800 bg-slate-900 hover:border-slate-700'}`}>
              <div className="text-sm font-mono font-bold text-slate-200">{f.name}</div>
              <div className="text-xs text-slate-500 mb-2">{f.bits}-bit · {f.label}</div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-lime-500 rounded-full" style={{ width: `${f.quality * 100}%` }} />
              </div>
              <div className="text-xs font-mono text-lime-400">{(f.quality * 100).toFixed(1)}% quality</div>
            </button>
          ))}
        </div>
      </Panel>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'Memory ≈ throughput', body: 'Inference speed is mostly bound by reading weights from memory. Half the bits ≈ half the memory traffic ≈ roughly double the speed — quantization buys speed, not just space.' },
        { title: 'Not all bits are equal', body: 'Modern methods (GPTQ, AWQ, GGUF k-quants) protect the most important weights and quantize the rest harder — squeezing to 4-bit with far less damage than naive rounding.' },
        { title: 'QLoRA', body: 'You can even fine-tune a frozen 4-bit model by training tiny add-on adapters. It put fine-tuning 65B models within reach of a single consumer GPU.' },
      ]} />
    </SectionShell>
  )
}
