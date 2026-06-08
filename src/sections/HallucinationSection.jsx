import { useState } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards } from '../components/ui'

const ACCENT = 'purple'

const CASES = [
  {
    label: 'Known fact',
    prompt: 'The chemical symbol for gold is',
    tokens: [['Au', 0.96], ['Gold', 0.02], ['Ag', 0.01], ['G', 0.01]],
    truth: 'correct',
    verdict: 'Au is right. The model saw this fact thousands of times — the distribution is sharp and accurate.',
  },
  {
    label: 'Unknown entity',
    prompt: 'The CEO of Acme Quantum Dynamics is',
    tokens: [['Dr', 0.31], ['John', 0.24], ['Sarah', 0.19], ['Michael', 0.15], ['a', 0.11]],
    truth: 'fabricated',
    verdict: 'This company is fictional — there is no fact to recall. But the model still must output a token, so it confidently invents a plausible name.',
  },
  {
    label: 'Plausible trap',
    prompt: "The author of the novel 'The Midnight Library of Zorthab' is",
    tokens: [['Matt', 0.28], ['Neil', 0.22], ['a', 0.18], ['James', 0.17], ['Ursula', 0.15]],
    truth: 'fabricated',
    verdict: 'A fake book that sounds real. The model pattern-matches to author-name shapes from similar titles and fabricates an attribution — often with a real author\'s name.',
  },
]

export default function HallucinationSection({ embedded = false }) {
  const [cIdx, setCIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const c = CASES[cIdx]

  return (
    <SectionShell last embedded={embedded}>
      <SectionHeader num="17" title="Why Hallucinations Happen" accent={ACCENT}>
        Now you have the pieces to understand the most misunderstood LLM behaviour. A model doesn't <em>look up</em> facts — it{' '}
        <strong className="text-slate-200">predicts the next plausible token</strong>. When it knows the answer, plausible and
        true line up. When it doesn't, the machinery is identical: it still produces a confident, fluent, completely made-up answer.
      </SectionHeader>

      <Panel
        label="The model never says 'I don't know' on its own"
        right={
          <button onClick={() => setRevealed(r => !r)}
            className="text-xs px-3 py-1 rounded-lg border border-purple-500/40 bg-purple-500/20 text-purple-300">
            {revealed ? 'hide' : 'reveal'} verdict
          </button>
        }
        className="mb-5"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {CASES.map((cc, i) => (
            <button key={i} onClick={() => { setCIdx(i); setRevealed(false) }}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${cIdx === i ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              {cc.label}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-lg px-4 py-2.5 mb-4 font-mono text-sm text-slate-300">
          {c.prompt} <span className="inline-block w-0.5 h-4 bg-purple-400 animate-pulse align-middle" />
        </div>

        {/* probability bars */}
        <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Next-token distribution</p>
        <div className="space-y-2 mb-4">
          {c.tokens.map(([tok, p], i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="font-mono text-sm text-slate-200 w-20 truncate">{tok}</span>
              <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                  style={{ width: `${p * 100}%`, background: i === 0 ? (c.truth === 'correct' ? '#10b981' : '#a855f7') : '#475569' }}>
                  <span className="text-xs font-mono text-white/90">{(p * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* verdict */}
        <div className={`rounded-lg p-4 border transition-all ${revealed ? (c.truth === 'correct' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-purple-500/30 bg-purple-500/5') : 'border-slate-800 bg-slate-900/50'}`}>
          {revealed ? (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${c.truth === 'correct' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'}`}>
                  {c.truth === 'correct' ? '✓ Genuinely correct' : '✺ Confidently hallucinated'}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{c.verdict}</p>
            </>
          ) : (
            <p className="text-sm text-slate-600 italic">Is the top answer real or invented? Reveal the verdict — the distribution alone can't tell you.</p>
          )}
        </div>
      </Panel>

      {/* confidence != correctness */}
      <Panel label="The core problem: confidence ≠ correctness" className="mb-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg p-4 border border-slate-700 bg-slate-800/40">
            <p className="text-sm font-semibold text-slate-200 mb-2">Why it can't just abstain</p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• Training rewards predicting the <em>next word</em>, never "admit uncertainty."</li>
              <li>• There's no internal database to check against — knowledge is smeared across billions of weights.</li>
              <li>• Softmax always sums to 1: <em>some</em> token wins, even when the right answer is "no idea."</li>
              <li>• Fluency is learned far better than factuality — wrong answers read just as smoothly as right ones.</li>
            </ul>
          </div>
          <div className="rounded-lg p-4 border border-emerald-500/20 bg-emerald-500/5">
            <p className="text-sm font-semibold text-emerald-300 mb-2">How systems fight back</p>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>• <strong className="text-slate-300">RAG</strong> — retrieve real documents and ground the answer in them.</li>
              <li>• <strong className="text-slate-300">Tool use</strong> — call a calculator, search, or database instead of guessing.</li>
              <li>• <strong className="text-slate-300">Preference tuning</strong> — reward "I'm not sure" so the model learns to hedge.</li>
              <li>• <strong className="text-slate-300">Citations</strong> — force claims to link to a verifiable source.</li>
            </ul>
          </div>
        </div>
      </Panel>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'A feature, not a bug', body: 'The same "fill in the plausible continuation" ability that lets a model write poems, brainstorm, and code is exactly what makes it fabricate facts. You can\'t fully remove one without the other.' },
        { title: 'It doesn\'t know it\'s wrong', body: 'There\'s no separate "truth signal" inside. Confidence (token probability) reflects how typical the text is, not whether it\'s factually true.' },
        { title: 'Grounding is the fix', body: 'The reliable pattern isn\'t "smarter model" but "connected model" — give it real sources at answer time. That\'s why search, RAG, and tools dominate production systems.' },
      ]} />
    </SectionShell>
  )
}
