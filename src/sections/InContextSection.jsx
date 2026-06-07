import { useState } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards } from '../components/ui'

const ACCENT = 'yellow'

// Few-shot demo: a novel rule the model can only infer from examples.
// Rule: output = number of letters in the word.
const SHOTS = [
  { word: 'cat', out: '3' },
  { word: 'tiger', out: '5' },
  { word: 'ox', out: '2' },
]
const TEST_WORD = 'panda'   // 5 letters
const TEST_ANSWER = '5'

// model "confidence" in the correct answer grows with #examples
const CONF_BY_SHOTS = [0.18, 0.41, 0.78, 0.96]
// what it guesses with few/no examples (it doesn't know the rule yet)
const GUESS_BY_SHOTS = ['"animal"', '"5 letters"', '5', '5']

// Chain-of-thought demo
const COT_STEPS = [
  'Let the ball cost x dollars.',
  'The bat costs $1.00 more, so the bat = x + 1.00.',
  'Together: x + (x + 1.00) = 1.10.',
  'So 2x + 1.00 = 1.10  →  2x = 0.10  →  x = 0.05.',
]

export default function InContextSection() {
  const [shots, setShots] = useState(0)
  const [cot, setCot] = useState(false)

  const conf = CONF_BY_SHOTS[shots]
  const guess = GUESS_BY_SHOTS[shots]
  const correct = shots >= 2

  return (
    <SectionShell>
      <SectionHeader num="13" title="In-Context Learning" accent={ACCENT}>
        Something remarkable: an LLM can learn a brand-new task from a few examples in your prompt —{' '}
        <strong className="text-slate-200">without changing a single weight</strong>. The "learning" happens entirely inside
        the forward pass. This is why prompting works, and why <em>how</em> you ask changes what you get.
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        {/* Few-shot */}
        <Panel label="Few-shot — teach a rule by example">
          <p className="text-xs text-slate-500 mb-3">
            This is a made-up task the model has never seen. Add examples and watch it figure out the hidden rule.
          </p>

          <div className="bg-slate-950/60 rounded-lg p-3 font-mono text-xs space-y-1 mb-3 min-h-[120px]">
            {SHOTS.slice(0, shots).map((s, i) => (
              <div key={i} className="text-slate-400 animate-fade-in-up">
                <span className="text-slate-500">Input:</span> {s.word}  <span className="text-slate-500">→ Output:</span> <span className="text-yellow-400">{s.out}</span>
              </div>
            ))}
            {shots === 0 && <div className="text-slate-600 italic">no examples yet — model is guessing blind</div>}
            <div className="text-slate-200 pt-1 border-t border-slate-800 mt-1">
              <span className="text-slate-500">Input:</span> {TEST_WORD}  <span className="text-slate-500">→ Output:</span>{' '}
              <span className={correct ? 'text-emerald-400 font-bold' : 'text-rose-400'}>{guess}{correct ? ' ✓' : ' ?'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500">examples:</span>
            {[0, 1, 2, 3].map(n => (
              <button key={n} onClick={() => setShots(n)}
                className={`w-8 h-8 rounded-lg text-sm font-mono border transition-all ${shots === n ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'}`}>
                {n}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">confidence in correct answer</span>
            <span className="font-mono font-bold text-yellow-400">{(conf * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${conf * 100}%`, background: correct ? '#10b981' : '#eab308' }} />
          </div>
          <p className="text-xs text-slate-600 mt-2">{
            shots === 0 ? 'With zero examples it can\'t know the rule (count the letters).'
            : shots === 1 ? 'One example is ambiguous — many rules fit "tiger → 5".'
            : 'Two+ examples pin down the rule: output = letter count. No weights changed!'
          }</p>
        </Panel>

        {/* Chain of thought */}
        <Panel
          label="Chain-of-thought — let it think"
          right={
            <button onClick={() => setCot(c => !c)}
              className={`text-xs px-3 py-1 rounded-lg border transition-all ${cot ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {cot ? 'reasoning ON' : 'reasoning OFF'}
            </button>
          }
        >
          <div className="bg-slate-800 rounded-lg px-3 py-2.5 mb-3 text-sm text-slate-300">
            A bat and a ball cost <span className="font-mono text-yellow-300">$1.10</span> total. The bat costs <span className="font-mono text-yellow-300">$1.00</span> more than the ball. How much is the ball?
          </div>

          {!cot ? (
            <div className="rounded-lg p-4 border border-rose-500/30 bg-rose-500/5">
              <p className="text-xs text-slate-500 mb-1">Answer directly:</p>
              <p className="text-2xl font-bold text-rose-400 font-mono">$0.10 ✗</p>
              <p className="text-xs text-slate-500 mt-2">The "obvious" answer fires first. Forced to answer in one step, the model blurts the intuitive-but-wrong response — exactly like humans do.</p>
            </div>
          ) : (
            <div className="rounded-lg p-4 border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-xs text-slate-500 mb-2">Think step by step:</p>
              <div className="space-y-1.5">
                {COT_STEPS.map((s, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-300 animate-fade-in-up" style={{ animationDelay: `${i * 90}ms` }}>
                    <span className="text-emerald-500 font-mono">{i + 1}.</span>
                    <span className="font-mono">{s}</span>
                  </div>
                ))}
              </div>
              <p className="text-xl font-bold text-emerald-400 font-mono mt-3">ball = $0.05 ✓</p>
            </div>
          )}
          <p className="text-xs text-slate-600 mt-2">
            Each generated token feeds back as context. Writing the steps gives the model "scratch space" to compute — turning a one-shot guess into a multi-step calculation.
          </p>
        </Panel>
      </div>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'No weights change', body: 'Unlike fine-tuning, in-context learning leaves the model frozen. The examples become part of the input, and attention does the rest at inference time. Erase the prompt and the "skill" is gone.' },
        { title: 'Why CoT works', body: 'A transformer does a fixed amount of compute per token. Hard problems need more steps than one token allows — so writing intermediate reasoning literally buys more computation.' },
        { title: 'Reasoning models', body: 'Models like o1 and DeepSeek-R1 are trained to generate long internal chains-of-thought before answering, then RL-tuned to make that reasoning effective. CoT became the architecture, not just a prompt trick.' },
      ]} />
    </SectionShell>
  )
}
