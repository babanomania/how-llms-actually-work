import { useState } from 'react'

const VOCAB = new Map([
  ['the',262],['a',264],['an',459],['is',374],['are',526],['was',373],['were',547],
  ['in',287],['on',402],['at',388],['to',284],['of',286],['for',347],['with',351],
  ['and',285],['or',441],['but',475],['not',466],['if',513],['as',390],
  ['this',456],['that',484],['i',357],['you',345],['he',383],['she',679],['it',372],
  ['we',394],['they',484],['my',523],['your',634],['its',663],
  ['have',452],['has',496],['had',501],['will',481],['can',431],['do',422],
  ['cat',3797],['dog',2564],['house',2299],['car',2318],['book',2084],
  ['time',640],['day',881],['world',995],['life',1146],['way',845],['man',919],
  ['text',1016],['word',1196],['data',1366],['model',1317],['code',2438],
  ['token',3967],['vector',3925],['matrix',12382],['layer',3270],
  ['attention',9276],['weight',3865],['embed',11626],['network',3313],
  ['neural',15317],['language',4221],['transform',5070],['head',2233],
  ['train',3492],['predict',10863],['output',2534],['input',5512],
  ['query',7495],['key',1994],['value',3119],['score',4203],
  ['make',787],['get',765],['take',680],['know',867],['think',892],
  ['see',799],['come',753],['want',854],['look',917],['use',836],
  ['good',1359],['new',1183],['first',1243],['last',1218],['long',1527],
  ['great',1602],['large',1588],['small',1789],['high',1578],['real',1903],
  ['actually',1556],['work',1087],['how',593],['what',496],['large',1588],
  ['ing',278],['tion',343],['er',263],['ed',264],['ly',453],
  ['ize',1096],['ness',1525],['ment',1656],['able',1603],['ful',2080],
  ['less',1503],['al',435],['ous',786],['ive',628],['ent',604],
  ['ation',590],['un',443],['re',260],['pre',716],['dis',821],
])

function hashStr(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0 }
  return 10000 + (h % 40000)
}

function tokenizeWord(word) {
  const low = word.toLowerCase()
  if (VOCAB.has(low)) return [{ text: word, id: VOCAB.get(low) }]
  const suffixes = ['ation','izing','ness','ment','able','tion','ing','ful','less','ize','ous','ive','ent','al','er','ed','ly','s']
  for (const sfx of suffixes) {
    if (low.endsWith(sfx) && low.length > sfx.length + 2) {
      const base = word.slice(0, -sfx.length)
      return [...tokenizeWord(base), { text: sfx, id: VOCAB.get(sfx) ?? hashStr(sfx) }]
    }
  }
  const prefixes = ['inter','trans','super','under','over','pre','dis','mis','un','re','sub','out']
  for (const pfx of prefixes) {
    if (low.startsWith(pfx) && low.length > pfx.length + 2) {
      return [{ text: pfx, id: VOCAB.get(pfx) ?? hashStr(pfx) }, ...tokenizeWord(word.slice(pfx.length))]
    }
  }
  const chunks = []
  for (let i = 0; i < word.length; i += 3)
    chunks.push({ text: word.slice(i, i + 3), id: hashStr(word.slice(i, i + 3).toLowerCase()) })
  return chunks
}

function tokenize(text) {
  if (!text.trim()) return []
  const tokens = []
  const parts = text.match(/[a-zA-Z]+|[^a-zA-Z\s]+|\s+/g) || []
  for (const p of parts) {
    if (/^\s+$/.test(p)) continue
    if (/^[a-zA-Z]+$/.test(p)) tokens.push(...tokenizeWord(p))
    else for (const ch of p) if (ch.trim()) tokens.push({ text: ch, id: hashStr(ch) })
  }
  return tokens
}

const COLORS = [
  'bg-blue-500/20 border-blue-500/40 text-blue-300',
  'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  'bg-amber-500/20 border-amber-500/40 text-amber-300',
  'bg-rose-500/20 border-rose-500/40 text-rose-300',
  'bg-purple-500/20 border-purple-500/40 text-purple-300',
  'bg-pink-500/20 border-pink-500/40 text-pink-300',
  'bg-orange-500/20 border-orange-500/40 text-orange-300',
  'bg-cyan-500/20 border-cyan-500/40 text-cyan-300',
]

const EXAMPLES = [
  'Tokenization is fascinating!',
  'The attention mechanism transforms embeddings.',
  'How do large language models actually work?',
  'Neural networks learn from training data.',
]

export default function TokenizationSection() {
  const [text, setText] = useState(EXAMPLES[0])
  const [hovered, setHovered] = useState(null)

  const tokens = tokenize(text)
  const words = text.trim().split(/\s+/).filter(Boolean)

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-b border-slate-800/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">01</span>
            <h2 className="text-2xl font-bold text-white">Tokenization</h2>
          </div>
          <p className="text-slate-400 leading-relaxed sm:ml-11 max-w-2xl text-sm sm:text-base">
            Before an LLM reads your text, it converts it into <strong className="text-slate-200">tokens</strong> — integer IDs representing subword pieces.
            The model <em>never sees letters</em>; it only processes these numbers. Type anything below to see it in action.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-3">Your text</p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full h-28 bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 font-mono text-sm resize-none focus:outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="Type something..."
            />
            <div className="flex flex-wrap gap-1.5 mt-3">
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setText(ex)}
                  className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all">
                  Example {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Stats</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'tokens', value: tokens.length, color: 'text-blue-400' },
                { label: 'characters', value: text.trim().length, color: 'text-violet-400' },
                { label: 'words', value: words.length, color: 'text-emerald-400' },
                { label: 'tok / word', value: words.length ? (tokens.length / words.length).toFixed(1) : 0, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/60 rounded-lg p-4 text-center">
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Token chips */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-5">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">Tokens — hover to see ID</p>
          <div className="flex flex-wrap gap-2 min-h-10">
            {tokens.map((tok, i) => (
              <div key={i} className="relative" onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                <div className={`px-2.5 py-1.5 rounded-md border font-mono text-sm cursor-default transition-transform select-none ${COLORS[i % COLORS.length]} ${hovered === i ? 'scale-110' : ''}`}>
                  {tok.text}
                </div>
                {hovered === i && (
                  <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-400 whitespace-nowrap bg-slate-800 px-2 py-0.5 rounded z-10">
                    #{tok.id}
                  </div>
                )}
              </div>
            ))}
            {!tokens.length && <span className="text-slate-600 text-sm italic">Start typing…</span>}
          </div>

          {tokens.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-800">
              <p className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Token ID sequence fed to the model</p>
              <code className="text-xs text-slate-400 bg-slate-800/60 rounded-lg px-3 py-2 block overflow-x-auto">
                [{tokens.map(t => t.id).join(', ')}]
              </code>
            </div>
          )}
        </div>

        {/* Concept cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { color: 'blue', title: 'Byte Pair Encoding', body: 'BPE learns which character pairs to merge based on training data frequency. Common words stay whole; rare words split into known pieces.' },
            { color: 'blue', title: 'Vocabulary Size', body: 'GPT-4 ≈ 100k tokens. LLaMA ≈ 32k. Larger vocabularies need fewer tokens per sentence, but a bigger (heavier) embedding matrix.' },
            { color: 'blue', title: 'Multilingual Impact', body: 'English is token-efficient. Non-English languages often need more tokens for the same meaning — a key factor in multilingual model quality.' },
          ].map(c => (
            <div key={c.title} className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-blue-400 font-semibold text-sm mb-1.5">{c.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
