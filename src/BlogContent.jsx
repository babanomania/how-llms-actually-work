import TokenizationSection from './sections/TokenizationSection'
import EmbeddingsSection from './sections/EmbeddingsSection'
import PositionalEncodingSection from './sections/PositionalEncodingSection'
import AttentionSection from './sections/AttentionSection'
import MultiHeadSection from './sections/MultiHeadSection'
import FeedForwardSection from './sections/FeedForwardSection'
import ResidualSection from './sections/ResidualSection'
import NextTokenSection from './sections/NextTokenSection'
import ArchitectureSection from './sections/ArchitectureSection'
import TrainingSection from './sections/TrainingSection'
import ScalingSection from './sections/ScalingSection'
import RLHFSection from './sections/RLHFSection'
import InContextSection from './sections/InContextSection'
import MoESection from './sections/MoESection'
import KVCacheSection from './sections/KVCacheSection'
import QuantizationSection from './sections/QuantizationSection'
import HallucinationSection from './sections/HallucinationSection'

// ---- small prose primitives ----------------------------------------------
const P = ({ children }) => <p className="text-slate-300 leading-relaxed mb-5 max-w-3xl">{children}</p>
const Lead = ({ children }) => <p className="text-lg text-slate-300 leading-relaxed mb-6 max-w-3xl">{children}</p>
const S = ({ children }) => <strong className="text-white font-semibold">{children}</strong>
const Em = ({ children }) => <em className="text-slate-200">{children}</em>

function A({ to, children }) {
  return (
    <a href={`#${to}`}
      className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/30 hover:decoration-indigo-400 underline-offset-2">
      {children}
    </a>
  )
}

function PartHeader({ part, title, accent }) {
  return (
    <header className="mt-20 mb-8 pb-4 border-b border-slate-800">
      <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>{part}</span>
      <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1.5 tracking-tight">{title}</h2>
    </header>
  )
}

function Concept({ id, num, dot, title }) {
  return (
    <h3 id={id} className="scroll-mt-24 flex items-center gap-3 text-xl sm:text-2xl font-bold text-white mt-12 mb-4">
      <span className="font-mono text-sm font-bold flex-shrink-0" style={{ color: dot }}>{num}</span>
      <span>{title}</span>
    </h3>
  )
}

// Wraps an inline interactive demo lifted from the original explorer.
function Demo({ children }) {
  return <div className="my-8 -mx-1 sm:mx-0">{children}</div>
}

const UL = ({ children }) => <ul className="mb-5 max-w-3xl space-y-2 text-slate-300 leading-relaxed list-none">{children}</ul>
const LI = ({ children }) => (
  <li className="flex gap-2.5">
    <span className="text-indigo-500 mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500" />
    <span>{children}</span>
  </li>
)

export default function BlogContent() {
  return (
    <article className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pb-24">

      {/* ---- intro ---- */}
      <Lead>
        You type a question into ChatGPT, Claude, or Gemini, press enter, and a moment later words come
        streaming back. It feels like talking to something that gets you. Under the hood there is no
        "getting you" in the human sense. There is a very large pile of numbers and a fixed sequence of
        multiplications, run start to finish until one word pops out, then run again for the next word, and
        again, until the model decides to stop.
      </Lead>
      <P>
        That is the honest version of what a large language model is. The interesting part is how such a
        plain mechanism produces something that can write code, explain tax law, and argue with you about
        football. This post follows one sentence all the way through the machine, then steps back to show how
        the machine got built, how a raw model becomes the polite assistant you actually talk to, how it runs
        fast enough to be useful, and why it confidently makes things up.
      </P>
      <P>
        Every concept below has a live demo you can play with, right where it is explained. You do not need
        any math to follow along. If you can read a bar chart in your head, you are fine. The tour runs in
        five parts, in the order things actually happen. It builds on{' '}
        <a href="https://www.0xkato.xyz/how-llms-actually-work/" target="_blank" rel="noreferrer"
          className="text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/30 underline-offset-2">
          0xkato's original essay
        </a>{' '}of the same name.
      </P>

      {/* ===================== PART I ===================== */}
      <PartHeader part="Part I" title="The forward pass" accent="#6366f1" />
      <P>
        One trip through the model, from your raw text to a single predicted next word. Everything in this
        part happens every single time the model produces one token.
      </P>

      <Concept id="tokenization" num="01" dot="#3b82f6" title="Tokenization: turning text into numbers" />
      <P>
        The model cannot read letters. Before anything else happens, your text gets chopped into <S>tokens</S>,
        and each token is swapped for an integer ID. That list of integers is the only thing the model ever
        actually sees.
      </P>
      <P>
        A token is usually a chunk of a word, not a whole word and not a single character. Common words like
        "the" or "cat" get their own token. Rarer words get split into pieces. "Tokenization" might come apart
        into "token" and "ization." The split is not arbitrary: a method called byte pair encoding looks at a
        huge amount of text during setup and learns which character sequences show up together often enough to
        deserve their own token. Frequent patterns stay whole, rare ones get broken down into known parts, and
        nothing ever falls outside the vocabulary because the worst case is splitting down to individual
        characters.
      </P>
      <P>
        Type into the box below and watch the split happen live. Every chip is one token, and the number under
        it is the integer the model receives. It sees those numbers and nothing else. No spelling, no letters,
        just indices.
      </P>
      <Demo><TokenizationSection embedded /></Demo>
      <P>
        Two practical things fall out of this. First, vocabulary size is a real design choice. GPT-4 uses
        roughly 100,000 distinct tokens, LLaMA around 32,000. A bigger vocabulary means fewer tokens per
        sentence, which is faster, but it also means a larger lookup table to store and learn. Second, English
        is unusually cheap to tokenize because the vocabularies are trained mostly on English text. The same
        sentence in Hindi or Thai often costs two or three times as many tokens, which is part of why models
        can feel weaker, slower, and more expensive in other languages.
      </P>
      <P>
        Those integer IDs are just row numbers. The next step is to look up what each row actually means, which
        brings us to <A to="embeddings">embeddings</A>.
      </P>

      <Concept id="embeddings" num="02" dot="#8b5cf6" title="Embeddings: turning numbers into meaning" />
      <P>
        A token ID like 3797 carries no meaning on its own. It is just an index. The meaning comes from an{' '}
        <S>embedding matrix</S>, a giant table where every token ID points to one row, and each row is a long
        list of numbers called a vector.
      </P>
      <P>
        Picture a spreadsheet with one row per token and a few thousand columns. Token 3797 always reads the
        same row, every time, no computation required. That row, maybe 4,096 numbers long, is the token's
        embedding: its starting representation inside the model. The magic is what those numbers come to mean.
        Nobody assigns them. They start random and get shaped during <A to="training">training</A>, and the
        shape that emerges is geometric. Tokens used in similar contexts drift close together.
      </P>
      <P>
        Hover the words in the map below. "Cat," "dog," and "horse" sit near each other. "Python," "code," and
        "algorithm" cluster somewhere else entirely. Distance in this space is a stand-in for similarity in
        meaning, and the panel shows each word's nearest neighbors.
      </P>
      <Demo><EmbeddingsSection embedded /></Demo>
      <P>
        The classic demonstration is vector arithmetic. Take the vector for "king," subtract "man," add
        "woman," and you land almost exactly on "queen." The direction you travel to go from "man" to "woman"
        is roughly the same direction that takes "king" to "queen." Relationships became geometry. The model
        learned that gender is a direction you can move in, never having been told gender exists.
      </P>
      <P>
        Real embeddings live in 4,000 to 8,000 dimensions, far too many to picture, so the 2D map above is a
        flattened shadow of the real thing. One thing these vectors still do not capture: the embedding for
        "cat" is identical whether it is the first word or the last. Fixing that is the job of{' '}
        <A to="positional-encoding">positional encoding</A>.
      </P>

      <Concept id="positional-encoding" num="03" dot="#22c55e" title="Positional encoding: adding a sense of order" />
      <P>
        Here is a surprise about transformers: they look at every token in your input at the same time, in
        parallel. That parallelism is exactly why they are fast to train. It is also a problem, because it
        means the raw model has no built-in notion of order. To it, "the dog bit the man" and "the man bit the
        dog" are the same bag of tokens.
      </P>
      <P>
        <S>Positional encoding</S> fixes that by stamping each position with a distinctive pattern and adding
        it directly to the token's <A to="embeddings">embedding</A>. Same length vector, no new parameters,
        just addition. The original transformer built the stamp out of sine and cosine waves. Each dimension
        oscillates at its own frequency: low dimensions are slow waves that change gradually across the whole
        sentence, high dimensions are fast waves that flip from one position to the next. Stack enough waves at
        different speeds and every position gets a unique fingerprint, the way a set of clock hands moving at
        different rates marks every second of the day uniquely. Each row in the heatmap below is one position's
        fingerprint.
      </P>
      <Demo><PositionalEncodingSection embedded /></Demo>
      <P>
        Most current models, including LLaMA, Mistral, and GPT-4, have moved to a newer scheme called rotary
        position embeddings, or RoPE. Instead of adding a pattern up front, RoPE rotates each token's vectors
        by an amount that depends on position. The neat consequence is that when two tokens later compare
        themselves during <A to="attention">attention</A>, what falls out of the math is their relative
        distance rather than their absolute slots. Either way, by the end of this step every token vector
        carries two things at once: what the token means, and where it sits. Now the tokens are finally ready
        to start talking to each other.
      </P>

      <Concept id="attention" num="04" dot="#f59e0b" title="Attention: how tokens look at each other" />
      <P>
        Attention is the heart of the whole design, and it is worth slowing down for. So far every token has
        been processed in isolation. Attention is the step where tokens look at each other and pull in context.
        The mechanism gives every token three vectors, each made by multiplying the token's current vector by a
        learned weight matrix: a <S>query</S> (what this token is looking for), a <S>key</S> (what this token
        offers to others), and a <S>value</S> (the information it hands over if someone attends to it).
      </P>
      <P>
        A good analogy is a room full of people. Your query is the question on your mind. Everyone else is
        wearing a name tag, which is their key. You glance around, see whose tag best matches your question,
        and listen hardest to those people. What they tell you is their value. Mechanically, each token's query
        is compared against every token's key with a dot product, those scores get scaled and run through a
        softmax so they turn into percentages that add up to 100, and each token builds its new representation
        as a blend of everyone's values, weighted by those percentages. Click a row in the grid to see where
        one token sends its attention.
      </P>
      <Demo><AttentionSection embedded /></Demo>
      <P>
        The payoff is that grammar and reference resolve themselves. In "the cat sat on the mat," the token
        "sat" attends strongly back to "cat," its subject. In "the dog chased its tail," the word "its"
        attends to "dog," because the model has effectively figured out what the pronoun refers to. Nobody
        wrote a grammar rule. It is all learned dot products.
      </P>
      <P>
        Two consequences matter for everything later. During generation the model uses <S>causal masking</S>:
        a token can only attend to tokens before it, never after, because it cannot peek at words it has not
        generated yet. And attention is expensive: every token compares against every other token, so cost
        grows with the square of the input length. A 4,000-token input means 16 million attention pairs. That
        quadratic cost is the reason long context is slow and pricey, and it is the problem the{' '}
        <A to="kv-cache">KV cache</A> later exists to soften. One attention pass captures one kind of
        relationship. Real models want many at once, which is the idea behind{' '}
        <A to="multi-head">multi-head attention</A>.
      </P>

      <Concept id="multi-head" num="05" dot="#ec4899" title="Multi-head attention: many views at once" />
      <P>
        A single round of <A to="attention">attention</A> can only track one type of relationship at a time.
        Language has many running in parallel. The grammar that links a verb to its subject is a different
        thread from the meaning that links "doctor" to "hospital," which is different again from simply
        attending to the word right next door. So instead of one attention pass, the model runs several side
        by side, each called a <S>head</S>, and each one learns to look for something different.
      </P>
      <P>
        What is striking is that nobody assigns the heads their jobs. The specialization emerges on its own
        from <A to="training">training</A>. The four heads below were picked to show the pattern: one tracks
        grammatical structure, one resolves which noun a "the" points back to, one just watches adjacent
        words, and one links related words across the whole sentence. Eight or ninety-six heads, all reading
        the same sentence, each noticing its own pattern.
      </P>
      <Demo><MultiHeadSection embedded /></Demo>
      <P>
        This design also has a known soft spot that later efficiency tricks target. Many heads turn out to be
        redundant: you can often delete twenty or thirty percent of them with barely any drop in quality. And
        during generation, the keys and values for every head are what get stored, so they dominate memory.
        That pressure led to grouped-query attention, where several query heads share one set of keys and
        values. LLaMA 2 and 3 use it specifically to shrink the <A to="kv-cache">KV cache</A>. Keep
        grouped-query attention in mind, because it shows up again. Attention only ever mixes information
        between tokens. The deep per-token thinking happens next, and it is where most of the model's
        knowledge sits.
      </P>

      <Concept id="feed-forward" num="06" dot="#f97316" title="The feed-forward network: where knowledge lives" />
      <P>
        After <A to="multi-head">attention</A> has let the tokens share context, each token goes through a{' '}
        <S>feed-forward network</S> on its own. No information moves between tokens here. The network does three
        things in a row. It expands, multiplying the vector up to about four times its size, so a
        4,096-dimensional vector briefly becomes 16,384. Then it applies a non-linear activation, a simple
        function that lets some of those expanded neurons fire and dampens others. Then it compresses back
        down. Expand, gate, compress. Step through it below.
      </P>
      <Demo><FeedForwardSection embedded /></Demo>
      <P>
        The activation function is what makes the whole model more than a stack of plain multiplications. Early
        models used ReLU, which clips everything negative to zero. GPT-2 and GPT-3 used a smoother version
        called GELU. Most current models, including LLaMA, Mistral, and Gemma, use SwiGLU, a gated variant that
        tends to train a little better. The shape of all of them is the same: pass strong signals through,
        suppress weak ones.
      </P>
      <P>
        Two facts make this section more important than it first looks. First, this is where most of the
        parameters live. In a standard dense transformer the feed-forward layers hold roughly two-thirds of
        all the weights, more than attention. A 7-billion-parameter model has around 5 billion of them here.
        Second, this is where facts seem to be stored. Interpretability research has traced specific neurons
        that activate for specific associations, the kind of neuron that lights up to connect "Rome" with
        "Italy." That weight of parameters is exactly what <A to="moe">mixture of experts</A> later
        reorganizes to save money. But first: how does a token vector survive being rewritten dozens of times
        without getting scrambled?
      </P>

      <Concept id="residual" num="07" dot="#14b8a6" title="The residual stream: the shared highway" />
      <P>
        Here is the design choice that makes deep transformers possible at all, and it is almost embarrassingly
        simple. Each sub-layer, whether <A to="attention">attention</A> or the{' '}
        <A to="feed-forward">feed-forward network</A>, does not replace the vector it receives. It computes a
        small change and adds it on top. The running vector that flows up through the whole model, getting
        added to at every step, is called the <S>residual stream</S>. Hover the layers below to see information
        flow straight up it.
      </P>
      <Demo><ResidualSection embedded /></Demo>
      <P>
        This buys two things that turn out to be essential. The first is memory. Because every layer adds
        rather than overwrites, nothing is ever truly lost. A fact written into the stream in layer 2 is still
        readable in layer 40. The second is trainable depth, and this is the reason the trick was invented.
        During <A to="training">training</A>, the learning signal has to travel backward through every layer.
        In a deep stack without these connections, that signal fades to almost nothing by the time it reaches
        the early layers. The addition creates a direct path for it to flow straight back. It is a highway with
        on-ramps, not a series of locked gates. The idea came from image models (ResNet, 2016) and transformers
        borrowed it wholesale.
      </P>
      <P>
        A small helper rides alongside the stream: normalization. After many additions the numbers can drift to
        wildly different scales, so just before each sub-layer the vector gets rescaled. Older models used
        LayerNorm; most current ones use a lighter version called RMSNorm. The residual stream is also why
        mechanistic interpretability exists: researchers read it like a ledger, tracing where a fact gets
        written and where it gets read back. The last question is how all this turns back into a word.
      </P>

      <Concept id="next-token" num="08" dot="#f43f5e" title="Next-token prediction: turning vectors back into words" />
      <P>
        After the token vectors have ridden up through every layer of the{' '}
        <A to="residual">residual stream</A>, the model converts the final vector back into an actual word. It
        gets multiplied by one more big matrix, the output projection, producing one raw score for every token
        in the vocabulary. These raw scores are called <S>logits</S>. A softmax turns the whole list into a
        proper probability distribution: every option gets a percentage, and the percentages add up to 100.
      </P>
      <P>
        For "the capital of France is," a trained model puts almost all the probability on " Paris." For
        "2 + 2 =," it piles onto " 4." But the model still has to pick one token, and how it picks is a knob
        you control. Drag the temperature and top-k below and watch the distribution change.
      </P>
      <Demo><NextTokenSection embedded /></Demo>
      <P>
        <S>Temperature</S> rescales the distribution before sampling. Low temperature, near zero, makes the
        sharp peaks even sharper, so the top token almost always wins, which is what you want for factual
        answers. High temperature flattens things out, giving unlikely tokens a real chance, which is how you
        get more surprising, sometimes incoherent text. <S>Top-k</S> simply throws away the long tail first, so
        the model only ever samples from, say, the top 5 candidates, never the outright absurd ones.
      </P>
      <P>
        The thing to take away here is that this is the only thing the model does. It predicts one next token.
        To write a paragraph, it predicts a token, appends it to the input, and runs the entire forward pass
        again from the top. A 500-token reply is 500 complete trips through the model. This is what{' '}
        <S>autoregressive</S> means, and it is why output streams one word at a time. It is also, as we will
        see in Part V, the root reason models <A to="hallucination">hallucinate</A>: the machinery has to emit
        a plausible next token whether or not it actually knows the answer.
      </P>

      <Concept id="architecture" num="09" dot="#6366f1" title="The full architecture: putting it together" />
      <P>
        Everything in Part I stacks into one clean pipeline. Text becomes{' '}
        <A to="tokenization">tokens</A>. Tokens become <A to="embeddings">embeddings</A> with{' '}
        <A to="positional-encoding">positions</A> added. Then the stack repeats one block, N times: normalize,
        run <A to="multi-head">multi-head attention</A>, add it back to the{' '}
        <A to="residual">residual stream</A>, normalize again, run the{' '}
        <A to="feed-forward">feed-forward network</A>, add that back too. After the last block, one final
        normalization, then the <A to="next-token">output projection and softmax</A> pick the next token.
        Repeat until done. Click through the stack below, and note how real models differ only in how big each
        piece is and how many times the block repeats.
      </P>
      <Demo><ArchitectureSection embedded /></Demo>
      <P>
        The recipe most models settled on between 2023 and 2025 is remarkably consistent: pre-normalization
        with RMSNorm, RoPE for position, SwiGLU in the feed-forward layers, grouped-query attention to keep the{' '}
        <A to="kv-cache">KV cache</A> small, and no bias terms in the linear layers. Different labs, nearly the
        same blueprint. And here is the catch that sets up the rest of this post. You now understand the
        machine completely, and a freshly built version of it is useless. Its weights are random noise. Feed it
        "the capital of France is" and it produces gibberish, because nothing in the structure knows anything
        yet. Everything the model knows has to be poured in. That pouring is{' '}
        <A to="training">training</A>.
      </P>

      {/* ===================== PART II ===================== */}
      <PartHeader part="Part II" title="How models learn" accent="#06b6d4" />
      <P>
        Part I assumed the weights were already good. They are not, not at first. A new model is random. This
        part is how it stops being random.
      </P>

      <Concept id="training" num="10" dot="#ef4444" title="Training and backpropagation" />
      <P>
        A fresh model's billions of weights are noise. Training nudges every one of them, over and over, until
        the model gets good at predicting the next token. Take a chunk of real text. Hide the next word. Run
        the <A to="architecture">forward pass</A> and let the model predict it. Measure how wrong it was. Then
        adjust every weight a tiny amount in the direction that would have made the correct word more likely.
        Repeat, for trillions of words. Press play below to watch a single weight roll downhill toward its best
        value, and drag the learning rate to see what happens when the steps are too big.
      </P>
      <Demo><TrainingSection embedded /></Demo>
      <P>
        The "how wrong" number is the <S>loss</S>, specifically cross-entropy: the negative log of the
        probability the model gave the correct word. If it put 99 percent on the right word the loss is about
        0.01. At 50 percent it is around 0.69. At 1 percent it jumps to 4.6. Being confidently wrong is
        punished savagely, which pushes the model toward honest probabilities. The step that makes this
        possible is <S>backpropagation</S>: after computing the loss, the model works backward through every
        layer using the chain rule, computing for each weight how much it contributed to the error, then
        nudges them all at once.
      </P>
      <P>
        Three things make this remarkable rather than routine. It is self-supervised, so nobody labels
        anything: the right answer is just the next word that was already in the text, which makes the whole
        internet free training data. It adjusts every weight simultaneously, so a 70-billion-parameter model
        tunes 70 billion knobs per step. And real training uses an optimizer called Adam that adapts the step
        size per weight, far more stable at scale. So training works. The obvious next question is how far it
        goes if you simply do more of it.
      </P>

      <Concept id="scaling" num="11" dot="#06b6d4" title="Scaling laws and emergence" />
      <P>
        Why did models suddenly get so good around 2020 to 2023? They got bigger, and bigger reliably means
        better in a way you can graph. Plot a model's <A to="training">loss</A> against training compute on
        logarithmic axes and you get a straight line that holds across more than eight orders of magnitude.
        This is precise enough that labs fit the curve on small, cheap runs and predict the quality of a model
        that will cost a hundred million dollars, before spending the money. Drag the compute slider below and
        watch the predicted loss fall along the curve.
      </P>
      <Demo><ScalingSection embedded /></Demo>
      <P>
        There is a second finding about how to spend a fixed budget. The Chinchilla result showed the sweet
        spot is roughly 20 training tokens for every parameter. By that measure GPT-3, with 175 billion
        parameters trained on only 300 billion tokens, was badly undertrained. A 70-billion-parameter model
        called Chinchilla, trained on 1.4 trillion tokens using the same compute, beat it. The lesson has an
        uncomfortable corollary: high-quality text is finite, and we are starting to run out.
      </P>
      <P>
        Then the strange part: <S>emergence</S>. Some abilities do not improve smoothly. They sit at near-zero
        accuracy as the model grows, then past some size threshold they switch on. Three-digit arithmetic,
        unscrambling words, multi-step reasoning. Whether this is a truly sudden phase change or partly an
        artifact of strict grading is debated, but the practical effect is real: scale up far enough and
        capabilities you did not train for start appearing. Which makes it all the more surprising that the
        model you actually talk to is not the model this training produces.
      </P>

      {/* ===================== PART III ===================== */}
      <PartHeader part="Part III" title="From base model to assistant" accent="#10b981" />
      <P>
        Here is the secret most architecture explainers skip. What training gives you is not ChatGPT. It is a
        strange, rambling text-completer. Turning it into a helpful assistant is a whole separate process, and
        it is where the model becomes a product.
      </P>

      <Concept id="rlhf" num="12" dot="#10b981" title="RLHF and alignment" />
      <P>
        A model fresh out of <A to="training">pretraining</A> is called a base model, and talking to one is
        peculiar. It only completes text. Ask it "how do I make a website?" and it might reply with "how do I
        make a mobile app? how do I make money online?" because that is what a page full of questions looks
        like in its training data. Flip between the base and aligned model below on the same prompt and the
        difference is night and day.
      </P>
      <Demo><RLHFSection embedded /></Demo>
      <P>
        Getting from there to a useful assistant takes three more stages on top of pretraining. First,{' '}
        <S>supervised fine-tuning</S>: show the model thousands of human-written examples, each an instruction
        paired with an ideal response. This single stage is the biggest behavioral jump. Second,{' '}
        <S>reward modeling</S>: have humans rank several responses best to worst, and train a separate model to
        predict those rankings as a score, giving you an automated judge. Third,{' '}
        <S>reinforcement learning from human feedback</S>: tune the model to score high with that judge, with a
        penalty that keeps it from drifting too far from the supervised version and reward-hacking into
        gibberish.
      </P>
      <P>
        A few details. Classic RLHF uses an algorithm called PPO, but a simpler newer method called DPO
        optimizes directly on the preference data, and most models since 2024 use a DPO-style approach. There
        is also a cost, the alignment tax: heavy safety training can make a model more cautious and slightly
        weaker on raw benchmarks. Labs constantly balance helpfulness, harmlessness, and honesty, three goals
        that pull against each other in practice. There is a second kind of learning that needs no training at
        all, and it is the reason prompting works.
      </P>

      <Concept id="in-context" num="13" dot="#eab308" title="In-context learning" />
      <P>
        Something surprising happens at inference time. You can teach a model a brand-new task inside the
        prompt, with a few examples, and it will pick up the pattern, without a single weight changing. The
        learning happens entirely inside one <A to="architecture">forward pass</A>. Try it below: the rule is
        "output the number of letters in the word," which the model has never seen. With zero examples it
        guesses blind. Add two or three and it locks onto the rule.
      </P>
      <Demo><InContextSection embedded /></Demo>
      <P>
        Erase the examples and the skill is gone, which tells you it was never stored anywhere. This is the
        opposite of <A to="rlhf">fine-tuning</A>, where the change is permanent and lives in the weights. The
        other half of this idea is chain-of-thought, and it has a real mechanical explanation. A transformer
        does a fixed amount of computation per token. A hard problem may need more reasoning steps than fit in
        one token's worth of compute. Asking the model to "think step by step" lets it write its reasoning
        out, and because each token it writes feeds back in as context, the written steps become scratch
        space. The model is literally buying itself more computation by talking through the problem. Toggle the
        reasoning switch above on the bat-and-ball problem to see it flip from the wrong intuitive answer to
        the right one.
      </P>
      <P>
        This insight grew into a category of its own. Reasoning models like o1 and DeepSeek-R1 are trained to
        generate long internal chains of thought before answering, then tuned with reinforcement learning to
        make that reasoning pay off. Chain-of-thought stopped being a prompting trick and became part of how
        the models are built.
      </P>

      {/* ===================== PART IV ===================== */}
      <PartHeader part="Part IV" title="Running the model" accent="#d946ef" />
      <P>
        Building a good model is one thing. Serving it to millions of people without going bankrupt is another,
        and it has shaped the architecture as much as anything in Part I. These three ideas are about cost: of
        compute, of time, and of memory.
      </P>

      <Concept id="moe" num="14" dot="#d946ef" title="Mixture of experts" />
      <P>
        There is a tension baked into Part I. More <A to="feed-forward">feed-forward</A> parameters mean a
        model that knows more, but every token has to be pushed through all of them, which is slow.{' '}
        <S>Mixture of experts</S>, reportedly used in GPT-4, Mixtral, DeepSeek, and Gemini, breaks that tension
        with a simple idea: do not run all the parameters every time. Instead of one big feed-forward network,
        the model holds many smaller ones, called experts, plus a small <S>router</S> that picks just a couple
        per token. Watch the router send each token below to its top two experts.
      </P>
      <Demo><MoESection embedded /></Demo>
      <P>
        The numbers make the appeal obvious. Mixtral holds about 47 billion total parameters but activates only
        around 13 billion for any given token. You get the knowledge of a 47-billion-parameter model at close
        to the running cost of a 13-billion one. There is no free lunch, though. The router has to be trained
        carefully, because a naive one collapses into sending almost everything to its favorite few experts, so
        training adds a load-balancing penalty. And the memory bill does not go down: every expert sits loaded
        even when idle. Mixture of experts saves compute, not memory, which is why it shines in datacenter
        serving. Routing cuts how much work each token triggers. The next trick cuts how much work gets
        repeated.
      </P>

      <Concept id="kv-cache" num="15" dot="#0ea5e9" title="KV cache and inference" />
      <P>
        Generation is <A to="next-token">autoregressive</A>: one token, append, run again. Done naively this is
        wildly wasteful, because to generate the tenth token you would recompute the keys and values for all
        nine previous tokens, even though they have not changed. The <S>KV cache</S> stores every token's key
        and value vectors once, so each new token only computes its own and attends against the cache. Press
        play below and toggle the cache off to watch the recomputed work explode.
      </P>
      <Demo><KVCacheSection embedded /></Demo>
      <P>
        The cache also explains why generation has two phases that feel different. First is prefill: your whole
        prompt is processed in parallel in one pass, filling the cache. That is the "time to first token," and
        a long prompt makes you wait longer before anything appears. Second is decode: the reply comes out one
        token per forward pass, in order, which is why output streams at a steady pace.
      </P>
      <P>
        This is where earlier threads pay off. The cache grows linearly with context length, and at something
        like 100,000 tokens it can take more memory than the model's own weights. That is the real reason long
        context windows are expensive to serve. And it is why grouped-query attention, from{' '}
        <A to="multi-head">multi-head attention</A>, matters so much: by having many query heads share one set
        of keys and values, it shrinks the cache directly. Routing and caching cut compute and time. The last
        trick goes after memory itself.
      </P>

      <Concept id="quantization" num="16" dot="#84cc16" title="Quantization" />
      <P>
        How does a 70-billion-parameter model run on a gaming laptop instead of a datacenter? You store each
        weight in fewer bits. A model is, at the end of the day, a giant pile of numbers, and you get to choose
        how precisely to write each one down. <S>Quantization</S> writes them down more coarsely on purpose.
        Slide the precision below from 32-bit down to 4-bit and watch the model size collapse.
      </P>
      <Demo><QuantizationSection embedded /></Demo>
      <P>
        Sixteen-bit is the standard for serving and is essentially lossless. Eight-bit halves the size again
        with a tiny dip. Four-bit goes further, and that is the level that fits a 70-billion-parameter model on
        a single GPU: about 280 GB at full precision becomes roughly 35 GB. What gets lost is precision, in a
        literal sense. Four-bit allows only 16 possible values, so every weight rounds to the nearest one. The
        surprising thing is how little it hurts. Averaged across billions of weights, those tiny rounding
        errors mostly wash out.
      </P>
      <P>
        Three things make quantization more than a storage hack. Inference speed is mostly limited by how fast
        you can read weights out of memory, so halving the bits roughly doubles the speed. Modern methods
        (GPTQ, AWQ, the GGUF k-quants) protect the handful of weights that matter most and compress the rest
        harder. And a technique called QLoRA lets you fine-tune a frozen 4-bit model by training small add-on
        adapters, putting customization of a 65-billion-parameter model within reach of a single consumer GPU.
      </P>

      {/* ===================== PART V ===================== */}
      <PartHeader part="Part V" title="The catch" accent="#a855f7" />
      <P>
        You now have every piece needed to understand the most misunderstood thing LLMs do. It is not a bug
        bolted on. It falls directly out of everything above.
      </P>

      <Concept id="hallucination" num="17" dot="#a855f7" title="Why hallucinations happen" />
      <P>
        A model does not look facts up. It predicts the next plausible token. That sentence is the whole
        explanation, and the rest is consequences. Step through the three cases below. "The chemical symbol for
        gold is" produces " Au" with 96 percent confidence, and that is correct, because the model saw the fact
        thousands of times. "The CEO of Acme Quantum Dynamics is" names a confident-sounding person for a
        company that does not exist. And a fake novel gets a fabricated author, often a real author's name.
        From the outside, the confident wrong answers look exactly like the confident right one.
      </P>
      <Demo><HallucinationSection embedded /></Demo>
      <P>
        The reason the model cannot just say "I don't know" comes straight from the earlier parts:
      </P>
      <UL>
        <LI><A to="training">Training</A> only ever rewarded predicting the next word. It never rewarded admitting uncertainty, so the model never learned to.</LI>
        <LI>There is no internal database. As we saw in the <A to="feed-forward">feed-forward network</A>, knowledge is smeared across billions of weights, not stored as lookup-able facts.</LI>
        <LI>The <A to="next-token">softmax</A> always sums to 100 percent. Some token always wins, even when the honest answer is "no idea."</LI>
        <LI>Fluency was learned far more thoroughly than factuality. A wrong answer reads exactly as smoothly as a right one.</LI>
      </UL>
      <P>
        The uncomfortable conclusion is that hallucination is the same ability that makes the model useful. The
        capacity to fill in a plausible continuation is what lets it write poems, brainstorm, and complete your
        code. You cannot fully remove the failure without removing the feature. So the fixes do not try to make
        the model "smarter." They connect it to something real: retrieval pulls in actual documents and grounds
        the answer, tool use lets the model call a calculator or a search engine instead of guessing,{' '}
        <A to="rlhf">preference tuning</A> can reward hedging, and citations force claims to link to a
        verifiable source. The reliable pattern is not a smarter model but a connected one.
      </P>

      {/* ---- outro ---- */}
      <header className="mt-20 mb-8 pb-4 border-b border-slate-800">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Where this leaves you</h2>
      </header>
      <P>
        Step back and the whole thing is one loop wrapped in some preparation. Your text becomes{' '}
        <A to="tokenization">numbers</A>, those numbers get <A to="embeddings">meaning</A> and{' '}
        <A to="positional-encoding">order</A>, the tokens <A to="attention">look at each other</A> from{' '}
        <A to="multi-head">many angles</A>, each one <A to="feed-forward">thinks privately</A> along a{' '}
        <A to="residual">shared highway</A>, and the result becomes{' '}
        <A to="next-token">one predicted word</A>. Run that loop once per word.
      </P>
      <P>
        The weights came from <A to="training">training</A> at a scale that{' '}
        <A to="scaling">pays off predictably</A>. The assistant you talk to is a base model{' '}
        <A to="rlhf">taught to be helpful</A>, able to{' '}
        <A to="in-context">pick up new tasks from the prompt alone</A>. It runs at a price anyone can afford
        because of <A to="moe">selective routing</A>, a <A to="kv-cache">reused cache</A>, and{' '}
        <A to="quantization">coarser numbers</A>. The same prediction machinery that makes all of this
        possible is also why it <A to="hallucination">makes things up</A>.
      </P>
      <P>
        No understanding in the human sense. Just a very large pile of numbers, multiplied in a fixed order,
        one token at a time. That it works as well as it does is the genuinely strange and wonderful part.
      </P>
    </article>
  )
}
