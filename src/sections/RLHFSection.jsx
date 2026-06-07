import { useState } from 'react'
import { SectionShell, SectionHeader, Panel, ConceptCards } from '../components/ui'

const ACCENT = 'emerald'

const STAGES = [
  {
    name: '1 · Pretraining',
    short: 'Base model',
    color: '#64748b',
    what: 'Next-token prediction on trillions of words of internet text.',
    gives: 'A model that completes text — but only completes. Ask it a question and it might reply with more questions, because that\'s what web text looks like.',
    data: 'Raw internet (no labels)',
  },
  {
    name: '2 · Supervised Fine-Tuning',
    short: 'SFT',
    color: '#06b6d4',
    what: 'Fine-tune on thousands of human-written (instruction → ideal answer) demonstrations.',
    gives: 'A model that follows instructions and adopts the helpful-assistant format. This is the single biggest behavioural jump.',
    data: 'Human demonstrations',
  },
  {
    name: '3 · Reward Modeling',
    short: 'RM',
    color: '#a855f7',
    what: 'Humans rank several model answers best-to-worst. A separate model learns to predict those preferences as a scalar reward.',
    gives: 'An automated judge that scores any response the way humans would — scalable preference signal.',
    data: 'Human rankings',
  },
  {
    name: '4 · RLHF / DPO',
    short: 'Aligned',
    color: '#10b981',
    what: 'Optimize the model to maximize reward while a KL penalty keeps it close to the SFT model.',
    gives: 'A helpful, harmless, honest assistant. This is what you talk to in ChatGPT or Claude.',
    data: 'Reward signal',
  },
]

const PROMPTS = [
  {
    prompt: 'How do I make a website?',
    base: 'How do I make a mobile app? How do I make money online? How do I make friends as an adult? How do I make sourdough...',
    baseNote: 'The base model pattern-matches to a list of similar questions — that\'s what FAQ pages look like in its training data.',
    aligned: 'Great question! Here\'s a simple path:\n1. Pick a tool (start with HTML/CSS, or a builder like Wix)\n2. Get hosting (GitHub Pages is free)\n3. Build one page, then iterate...',
    alignedNote: 'The aligned model recognises an instruction and responds helpfully and directly.',
  },
  {
    prompt: 'Write a haiku about autumn.',
    base: ' Write a haiku about winter. Write a haiku about a dog. Submit your haiku below. Haiku is a Japanese poetry form with...',
    baseNote: 'It continues as if copying a worksheet — never actually performing the task.',
    aligned: 'Crisp leaves drift downward —\nthe maple lets go of red,\nbare branches exhale.',
    alignedNote: 'SFT taught it that "write X" means produce X, now.',
  },
  {
    prompt: 'Tell me how to pick a lock I\'m locked out of my own house.',
    base: ' Step 1: Insert a tension wrench into the bottom of the keyhole. Step 2: Apply light pressure. Step 3: Use a pick to...',
    baseNote: 'The base model has no notion of safety — it just completes the most likely text.',
    aligned: 'I can share general info for your own home. Safest first steps: check other doors/windows, call your landlord, or a licensed locksmith (bring ID). For the lock itself, raking with a tension wrench is the common technique — but a locksmith avoids damaging the cylinder.',
    alignedNote: 'Alignment adds judgment: helpful for a legitimate case, while staying responsible.',
  },
]

export default function RLHFSection() {
  const [stage, setStage] = useState(1)
  const [pIdx, setPIdx] = useState(0)
  const [mode, setMode] = useState('aligned')
  const p = PROMPTS[pIdx]

  return (
    <SectionShell>
      <SectionHeader num="12" title="RLHF & Alignment" accent={ACCENT}>
        Here's the secret almost no architecture article tells you: <strong className="text-slate-200">ChatGPT is not GPT</strong>.
        A freshly pretrained model is a strange, rambling text-completer. Turning it into a helpful assistant takes three more
        stages of training on <em>human preferences</em>. This is where "the model" becomes "the product."
      </SectionHeader>

      {/* Stage pipeline */}
      <Panel label="The post-training pipeline — click a stage" className="mb-5">
        <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
          {STAGES.map((s, i) => (
            <button key={s.name} onClick={() => setStage(i)}
              className="flex-1 min-w-[130px] rounded-lg px-3 py-2.5 border text-left transition-all"
              style={{
                background: stage === i ? s.color + '18' : 'rgba(15,23,42,0.5)',
                borderColor: stage === i ? s.color : '#1e293b',
              }}>
              <div className="text-xs font-semibold mb-0.5" style={{ color: s.color }}>{s.name}</div>
              <div className="text-xs text-slate-500">{s.data}</div>
              {i < STAGES.length - 1 && <span className="hidden sm:block text-slate-700 text-right">→</span>}
            </button>
          ))}
        </div>
        <div className="mt-3 rounded-lg p-4 border" style={{ borderColor: STAGES[stage].color + '40', background: STAGES[stage].color + '0d' }}>
          <p className="font-semibold text-sm mb-1.5" style={{ color: STAGES[stage].color }}>{STAGES[stage].name} → {STAGES[stage].short}</p>
          <p className="text-slate-300 text-sm leading-relaxed mb-2"><span className="text-slate-500">What happens: </span>{STAGES[stage].what}</p>
          <p className="text-slate-400 text-sm leading-relaxed"><span className="text-slate-500">Result: </span>{STAGES[stage].gives}</p>
        </div>
      </Panel>

      {/* Base vs aligned comparison */}
      <Panel
        label="Same prompt — base model vs aligned model"
        right={
          <div className="flex rounded-lg overflow-hidden border border-slate-700 text-xs">
            <button onClick={() => setMode('base')} className={`px-3 py-1 ${mode === 'base' ? 'bg-slate-700 text-slate-200' : 'text-slate-500'}`}>Base</button>
            <button onClick={() => setMode('aligned')} className={`px-3 py-1 ${mode === 'aligned' ? 'bg-emerald-500/30 text-emerald-300' : 'text-slate-500'}`}>Aligned</button>
          </div>
        }
        className="mb-5"
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {PROMPTS.map((pp, i) => (
            <button key={i} onClick={() => setPIdx(i)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${pIdx === i ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'}`}>
              Prompt {i + 1}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-lg px-4 py-2.5 mb-3 font-mono text-sm text-slate-300">
          <span className="text-slate-500 text-xs">user: </span>{p.prompt}
        </div>

        <div className={`rounded-lg p-4 border transition-all ${mode === 'aligned' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700 bg-slate-800/40'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${mode === 'aligned' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'}`}>
              {mode === 'aligned' ? '✓ Aligned model' : '○ Base model (raw)'}
            </span>
          </div>
          <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed font-mono">
            {mode === 'aligned' ? p.aligned : p.base}
          </p>
        </div>
        <p className="text-xs text-slate-500 mt-2 italic">{mode === 'aligned' ? p.alignedNote : p.baseNote}</p>
      </Panel>

      <ConceptCards accent={ACCENT} cards={[
        { title: 'PPO vs DPO', body: 'Classic RLHF uses PPO (reinforcement learning against the reward model). DPO is a newer shortcut that optimizes preferences directly with a simple loss — no separate RL loop. Most 2024+ models use DPO-style methods.' },
        { title: 'The KL leash', body: 'Without a penalty keeping it near the SFT model, RL would "reward-hack" into gibberish that scores high. The KL term keeps outputs fluent and on-distribution.' },
        { title: 'Alignment tax', body: 'Heavy safety tuning can make a model more cautious and slightly less capable on raw benchmarks. Labs balance helpfulness, harmlessness, and honesty — often in tension.' },
      ]} />
    </SectionShell>
  )
}
