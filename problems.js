/*
 * Intuition Trainer — problem bank.
 *
 * To add a problem, append an object to PROBLEMS with:
 *   id        unique string
 *   title     short name
 *   category  one of the category strings (drives the filter chips)
 *   difficulty "Easy" | "Medium" | "Hard"
 *   prompt    HTML string (the question)
 *   diagram   optional inline SVG string
 *   hints     array of 1–3 strings, escalating
 *   solution  HTML string (full worked answer)
 *   probe     the single question you could have asked yourself
 *   lesson    the transferable takeaway
 */

const PROBLEMS = [
  {
    id: "two-sum",
    title: "Find two numbers that add to a target",
    category: "Algorithms",
    difficulty: "Easy",
    prompt: `<p>Given an array of integers and a target <code>T</code>, return the indices of the two numbers that add up to <code>T</code>. The obvious approach checks every pair in <code>O(n²)</code>. Can you do it in one pass?</p>`,
    diagram: `<svg viewBox="0 0 460 120" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="13">
      <text x="0" y="18" fill="#9fb0c9">array:</text>
      <g fill="#182233" stroke="#24314a">
        <rect x="60" y="6" width="46" height="30"/><rect x="106" y="6" width="46" height="30"/>
        <rect x="152" y="6" width="46" height="30"/><rect x="198" y="6" width="46" height="30"/>
        <rect x="244" y="6" width="46" height="30"/>
      </g>
      <g fill="#e7ecf5" text-anchor="middle">
        <text x="83" y="26">2</text><text x="129" y="26">7</text><text x="175" y="26">11</text>
        <text x="221" y="26">15</text><text x="267" y="26">3</text>
      </g>
      <text x="0" y="78" fill="#9fb0c9">seen so far</text>
      <text x="0" y="94" fill="#9fb0c9">(value → index):</text>
      <g fill="#7ef0c0" font-size="12"><text x="150" y="86">{ 2:0, 7:1, 11:2, 15:3 }</text></g>
      <text x="150" y="108" fill="#ffcf7a">now at 3, target 5 → need 2 → found at index 0 ✓</text>
    </svg>`,
    hints: [
      "You don't need to compare pairs — for each number, there's exactly one partner it needs. What is that partner?",
      "As you scan, ask of each element: \"have I already seen the number that completes me?\" What data structure answers \"have I seen X\" in O(1)?",
      "Keep a hash map of value → index. For the current element x, look up T − x. If it's in the map, you're done; otherwise store x and move on."
    ],
    solution: `<p>Walk the array once, keeping a hash map of every value you've already seen mapped to its index. For each new element <code>x</code>, compute the complement <code>T − x</code> and check the map:</p>
      <ul>
        <li>If <code>T − x</code> is present, return its stored index and the current index.</li>
        <li>Otherwise store <code>x → index</code> and continue.</li>
      </ul>
      <p>This is <code>O(n)</code> time and <code>O(n)</code> space. The trick is reframing "find a pair" as "for each element, has its unique partner already appeared?" — which turns a search over pairs into a series of constant-time lookups.</p>`,
    probe: "Instead of asking \"which pairs sum to T?\", what if I ask \"for this one element, what single value would complete it — and have I seen it already?\"",
    lesson: "Many O(n²) pair-search problems collapse to O(n) once you trade the search for memory: precompute what you'd need and check membership in constant time. When you see nested loops comparing elements, ask whether a hash set/map can remember the other half."
  },

  {
    id: "linked-list-cycle",
    title: "Detect a cycle in a linked list",
    category: "Algorithms",
    difficulty: "Medium",
    prompt: `<p>You're given the head of a singly linked list. It might loop back on itself. Determine whether it contains a cycle — using <strong>O(1)</strong> extra memory (so no hash set of visited nodes).</p>`,
    diagram: `<svg viewBox="0 0 440 130" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="13">
      <g fill="#182233" stroke="#24314a">
        <circle cx="40" cy="40" r="18"/><circle cx="130" cy="40" r="18"/>
        <circle cx="220" cy="40" r="18"/><circle cx="310" cy="40" r="18"/><circle cx="400" cy="40" r="18"/>
      </g>
      <g fill="#e7ecf5" text-anchor="middle">
        <text x="40" y="45">A</text><text x="130" y="45">B</text><text x="220" y="45">C</text><text x="310" y="45">D</text><text x="400" y="45">E</text>
      </g>
      <g stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#ar)">
        <line x1="58" y1="40" x2="110" y2="40"/><line x1="148" y1="40" x2="200" y2="40"/>
        <line x1="238" y1="40" x2="290" y2="40"/><line x1="328" y1="40" x2="380" y2="40"/>
      </g>
      <path d="M400 58 Q 400 110 130 110 Q 128 78 128 60" fill="none" stroke="#ffcf7a" stroke-width="1.5" marker-end="url(#ar2)"/>
      <defs>
        <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#6ea8fe"/></marker>
        <marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#ffcf7a"/></marker>
      </defs>
      <text x="220" y="126" fill="#9fb0c9" text-anchor="middle">E points back to B — a cycle</text>
    </svg>`,
    hints: [
      "With O(1) memory you can't record where you've been. So the only thing you can compare is where two things are right now.",
      "Imagine two runners on a circular track moving at different speeds. What is guaranteed to eventually happen?",
      "Move one pointer 1 step and another 2 steps per iteration. On a cycle the fast one laps the slow one and they collide; with no cycle the fast one hits the end (null)."
    ],
    solution: `<p>Use Floyd's tortoise-and-hare: a <code>slow</code> pointer advancing one node per step and a <code>fast</code> pointer advancing two.</p>
      <ul>
        <li>If there's no cycle, <code>fast</code> reaches <code>null</code> — return false.</li>
        <li>If there is a cycle, both pointers are trapped inside the loop. Each step the gap between them shrinks by exactly one, so they are guaranteed to land on the same node — return true.</li>
      </ul>
      <p>O(1) space, O(n) time. The insight is that on a loop, relative speed guarantees a meeting; absolute position is irrelevant.</p>`,
    probe: "If I'm not allowed to remember where I've been, what could two pointers moving at different speeds tell me that one pointer can't?",
    lesson: "When a memory constraint blocks the obvious \"remember everything\" approach, look for an invariant that emerges from relative motion or comparison between two probes. Two-pointer and fast/slow techniques exploit relationships, not storage."
  },

  {
    id: "two-egg-drop",
    title: "The two-egg drop puzzle",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You have <strong>2 identical eggs</strong> and a 100-floor building. There's some floor <code>f</code> at and above which an egg breaks when dropped, and below which it survives. A broken egg can't be reused. Find the strategy that minimizes the number of drops <em>in the worst case</em>. How many drops do you need?</p>`,
    hints: [
      "With only 1 egg you'd be forced to go floor-by-floor from the bottom (100 drops worst case). Why? Because a break ends your search. So the last egg is precious.",
      "With the first egg you can \"jump\" by intervals. But every jump you make raises how far the second egg must crawl. What if you made each successive jump a little shorter to keep the total constant?",
      "Suppose your first drop is floor k, then k−1 higher, then k−2 higher… so total worst case is the same whether the first egg breaks early or late. Solve k + (k−1) + … + 1 ≥ 100."
    ],
    solution: `<p>The answer is <strong>14 drops</strong>. Drop the first egg from floor 14, then 27, then 39, and so on — each interval one smaller than the last (14, +13, +12, …).</p>
      <p>Here's why this balances the worst case: if the first egg breaks on drop number <code>i</code>, you've used <code>i</code> drops and the second egg must crawl through at most the <code>(14 − i)</code> floors in that interval — for a total of <code>i + (14 − i) = 14</code> no matter when it breaks. We pick the smallest <code>k</code> with <code>k(k+1)/2 ≥ 100</code>, and <code>14·15/2 = 105 ≥ 100</code>.</p>`,
    probe: "What if I made every possible outcome cost the same? — i.e., \"how do I choose steps so that an early break and a late break take equally many drops?\"",
    lesson: "Worst-case optimization is often about equalizing costs across outcomes. When one branch (early break) is cheap and another (late break) is expensive, rebalance the plan so no single branch dominates. This 'flatten the worst case' framing recurs in load balancing, search, and game trees."
  },

  {
    id: "birthday-paradox",
    title: "The birthday collision",
    category: "Probability",
    difficulty: "Medium",
    prompt: `<p>In a room of just <strong>23 people</strong>, the probability that two share a birthday is already over 50%. Most people guess you'd need ~183 (half of 365). Why is the real number so much smaller?</p>`,
    hints: [
      "You're not looking for someone who matches YOUR birthday. You're looking for ANY match among all people. How many pairs are there among 23 people?",
      "Count comparisons, not people. 23 people form C(23,2) = 253 distinct pairs — each a chance at a collision.",
      "Compute the complement: probability that all birthdays differ is (365/365)(364/365)(363/365)… After 23 terms this drops below 0.5."
    ],
    solution: `<p>The intuition trap is anchoring on <em>your</em> birthday. The question is about any collision among everyone. With 23 people there are <code>C(23,2) = 253</code> pairs, each an independent-ish chance to match.</p>
      <p>Formally, compute the probability everyone is different: <code>P(all distinct) = 365/365 × 364/365 × … × 343/365 ≈ 0.492</code>. So <code>P(at least one match) ≈ 0.507</code> — just over half. The count of <em>pairs</em> grows quadratically with people, which is why the threshold is so low.</p>`,
    probe: "Am I counting the right thing — matches against one fixed birthday, or matches among all possible pairs? How many pairs actually exist?",
    lesson: "When estimating collision or coincidence probabilities, count the number of opportunities (pairs, comparisons), which often grows quadratically, not linearly. This same 'n² pairs' reasoning underlies hash collisions, the load on distributed systems, and why cryptographic birthday attacks work."
  },

  {
    id: "bias-variance",
    title: "Why your model aces training but fails in the wild",
    category: "ML / AI",
    difficulty: "Medium",
    prompt: `<p>You train a model. Training accuracy is 99%, but on held-out test data it's 72%. A colleague suggests adding more layers and training longer. Another suggests the opposite. Who's right, and what is actually going on?</p>`,
    hints: [
      "A large train/test gap is a specific symptom, not generic 'bad model'. What does it tell you about whether the model learned the signal or the noise?",
      "Think of two failure modes: too simple to capture the pattern, versus so flexible it memorized the training set's quirks. Which one shows high train + low test?",
      "This is high variance (overfitting). More capacity/longer training usually makes it worse. Remedies reduce variance: more data, regularization, dropout, early stopping, simpler model."
    ],
    solution: `<p>A near-perfect train score with a large drop on test is the signature of <strong>overfitting — high variance</strong>. The model has enough capacity to memorize idiosyncrasies (noise) of the training set that don't generalize.</p>
      <p>Adding layers and training longer increases capacity and typically <em>widens</em> the gap. The right moves reduce variance: get more/augmented data, add regularization (L2, dropout), use early stopping, or reduce model complexity. If instead <em>both</em> train and test were low, that would be high bias (underfitting), and <em>then</em> more capacity would help.</p>`,
    probe: "Before choosing a fix, ask: \"is this a bias problem or a variance problem?\" — i.e., is the model failing to learn the pattern, or learning too much of the noise? The train-vs-test gap tells me which.",
    lesson: "Always diagnose before prescribing. In ML the bias/variance split turns a vague 'model is bad' into a decision: high bias → add capacity/features; high variance → add data/regularization. The general skill is reading a symptom precisely enough that it names its own cure."
  },

  {
    id: "learning-rate",
    title: "Choosing a learning rate",
    category: "ML / AI",
    difficulty: "Medium",
    prompt: `<p>You're training with gradient descent. With one learning rate the loss explodes to NaN; with another it barely moves after thousands of steps. What is each symptom telling you, and how should you reason about picking the rate?</p>`,
    diagram: `<svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="12">
      <path d="M30 150 Q 230 -20 430 150" fill="none" stroke="#24314a" stroke-width="1.5"/>
      <text x="220" y="165" fill="#9fb0c9" text-anchor="middle">loss surface (minimum at center)</text>
      <!-- too small -->
      <g fill="#7ef0c0"><circle cx="80" cy="118" r="4"/><circle cx="100" cy="104" r="4"/><circle cx="118" cy="92" r="4"/></g>
      <text x="60" y="80" fill="#7ef0c0">too small: crawls</text>
      <!-- too big -->
      <g fill="#ff8f8f"><circle cx="360" cy="112" r="4"/><circle cx="150" cy="70" r="4"/><circle cx="420" cy="140" r="4"/></g>
      <text x="300" y="60" fill="#ff8f8f">too big: overshoots / diverges</text>
      <!-- good -->
      <g fill="#6ea8fe"><circle cx="360" cy="112" r="4"/><circle cx="270" cy="60" r="4"/><circle cx="228" cy="42" r="4"/></g>
    </svg>`,
    hints: [
      "The learning rate is a step size on the loss surface. What happens to a step that's larger than the valley you're trying to descend into?",
      "NaN/exploding loss = steps so big you leap past the minimum and climb the far wall, higher each time. Near-zero progress = steps too small to make headway in reasonable time.",
      "Sweep rates on a log scale (1e-1, 1e-2, 1e-3, …), watch the loss curve, and pick the largest rate that still decreases smoothly. Then consider a schedule/warmup."
    ],
    solution: `<p>The learning rate is the size of each downhill step on the loss surface. Too large and each step overshoots the valley and lands higher on the opposite wall — successive steps grow, loss diverges to NaN. Too small and you descend, but so slowly you'll never arrive in a practical number of steps.</p>
      <p>Reason about it as a search on a log scale: try rates like <code>1e-1, 1e-2, 1e-3</code>, plot the loss, and choose the largest one that still decreases smoothly and stably. Then refine with warmup (start small to stabilize) and decay (shrink as you near the minimum). Adaptive optimizers like Adam reduce, but don't eliminate, this sensitivity.</p>`,
    probe: "What physical thing does this hyperparameter control? — here, \"how big is my step relative to the shape of the valley I'm descending?\" Once it's a step size, 'explodes' and 'crawls' explain themselves.",
    lesson: "Turn abstract hyperparameters into physical/geometric pictures before tuning them. A learning rate is a step size; temperature is how peaked a distribution is; regularization strength is how much you distrust the data. Concrete mental models tell you which direction to move a knob and why."
  },

  {
    id: "poisoned-wine",
    title: "1000 bottles, one poisoned",
    category: "Puzzles",
    difficulty: "Hard",
    prompt: `<p>You have <strong>1000 bottles</strong> of wine, exactly one of which is poisoned. Poison is lethal but takes ~24 hours to act. You have test strips... no — you have <strong>taster prisoners</strong> and only 24 hours before a banquet. What is the minimum number of tasters needed to guarantee you identify the poisoned bottle?</p>`,
    hints: [
      "Each taster, after 24 hours, is a single bit: alive (0) or dead (1). How much information is in one bit? How many bottles can k bits distinguish?",
      "You can make each taster drink from many bottles at once. Assign each bottle a unique pattern of which tasters sip it.",
      "Number bottles 0–999 in binary. Taster i drinks from every bottle whose i-th bit is 1. The pattern of who dies spells out the poisoned bottle's number. Need enough bits for 1000 values."
    ],
    solution: `<p>You need just <strong>10 tasters</strong>. Write each bottle's index in binary (0 to 999 needs 10 bits, since <code>2¹⁰ = 1024 ≥ 1000</code>). Assign taster <code>i</code> to drink a drop from every bottle whose <code>i</code>-th bit is 1.</p>
      <p>After 24 hours, read the tasters as a binary number: a dead taster is a 1, a living taster is a 0. That 10-bit number is exactly the index of the poisoned bottle, because only the poisoned bottle contributes to the death pattern.</p>`,
    probe: "What's the most information a single taster can give me after the test — and how do I encode a bottle's identity into those units?",
    lesson: "When outputs are binary and you can query many items per test, think in bits: k yes/no probes distinguish up to 2^k possibilities. Binary encoding of identity turns 'test 1000 things' into '10 parallel bit-tests'. The same idea underlies error-correcting codes, group testing, and hashing."
  },

  {
    id: "reservoir-sampling",
    title: "Sample from a stream you can't store",
    category: "Algorithms",
    difficulty: "Hard",
    prompt: `<p>A stream of items flows past — you don't know how many there'll be (could be billions) and you can't store them all. Pick exactly one item <strong>uniformly at random</strong>, so every item seen has an equal chance, using O(1) memory. How?</p>`,
    hints: [
      "You can't wait until the end to count n, then pick. You must maintain a valid random choice at every moment, updating as items arrive.",
      "When the k-th item arrives, with what probability should it replace your current pick so that all k items are equally likely so far?",
      "Keep the current pick. For the k-th item, replace the pick with probability 1/k. Prove by induction that after n items every item has probability 1/n."
    ],
    solution: `<p>Keep one slot. Store item 1. When item <code>k</code> arrives, replace the stored item with probability <code>1/k</code> (otherwise keep the old one).</p>
      <p>Why it's uniform: item <code>k</code> is chosen with probability <code>1/k</code>. An earlier item survives to the end if it was chosen and never replaced: <code>(1/k) × (k/(k+1)) × … × ((n−1)/n) = 1/n</code>. So every item ends with probability exactly <code>1/n</code>, and we never stored more than one item. (For k samples, keep k slots — reservoir sampling.)</p>`,
    probe: "Since I can't know the total in advance, can I keep my answer correct-so-far at every step, and ask what replacement probability preserves uniformity as n grows?",
    lesson: "For unbounded or streaming data, seek algorithms that maintain a correct invariant online rather than needing the whole input. 'What update rule keeps my answer valid as one more element arrives?' is the core streaming/online-algorithm question, and it shows up in monitoring, analytics, and training on data too large to hold in memory."
  },

  {
    id: "medical-test-bayes",
    title: "The 99%-accurate test that's usually wrong",
    category: "Biology",
    difficulty: "Medium",
    prompt: `<p>A disease affects <strong>1 in 10,000</strong> people. A test is 99% accurate (99% sensitivity, 99% specificity). You test positive. What's the probability you actually have the disease? Most people say ~99%. The real answer is under 1%. Why?</p>`,
    diagram: `<svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="12">
      <text x="0" y="16" fill="#9fb0c9">Imagine 1,000,000 people tested:</text>
      <rect x="10" y="30" width="200" height="40" fill="#182233" stroke="#24314a"/>
      <text x="110" y="54" fill="#7ef0c0" text-anchor="middle">100 sick</text>
      <rect x="220" y="30" width="230" height="40" fill="#182233" stroke="#24314a"/>
      <text x="335" y="54" fill="#9fb0c9" text-anchor="middle">999,900 healthy</text>
      <text x="10" y="96" fill="#ffcf7a">≈ 99 true positives</text>
      <text x="220" y="96" fill="#ff8f8f">≈ 9,999 false positives</text>
      <text x="10" y="128" fill="#e7ecf5">P(sick | positive) ≈ 99 / (99 + 9999) ≈ 0.98%</text>
    </svg>`,
    hints: [
      "Accuracy percentages are conditional on your true status. But you want the reverse: given a positive result, how likely are you sick? These are not the same.",
      "Picture a concrete population of 1,000,000. How many are actually sick? Of the huge healthy majority, how many test positive by error?",
      "False positives come from the enormous healthy pool, and swamp the tiny number of true positives. Compare 99 true positives to ~9,999 false positives."
    ],
    solution: `<p>The test's 99% figures are <code>P(positive | sick)</code> and <code>P(negative | healthy)</code>. You want <code>P(sick | positive)</code> — the reverse — and Bayes' theorem connects them through the base rate.</p>
      <p>In 1,000,000 people: ~100 are sick, of whom ~99 test positive. The other 999,900 are healthy, and 1% of them — ~9,999 — falsely test positive. So among all ~10,098 positives, only 99 are truly sick: <code>P(sick | positive) ≈ 99 / 10,098 ≈ 0.98%</code>. The rare disease means false positives from the vast healthy majority dominate.</p>`,
    probe: "Am I confusing P(positive given sick) with P(sick given positive)? What does the base rate do to a positive result when the condition is rare?",
    lesson: "Base rates dominate when events are rare — always ask which direction a conditional probability runs, and reason over a concrete imagined population. This is central to diagnostics, screening genomic variants, anomaly detection, and evaluating any classifier on imbalanced data (why precision collapses at low prevalence)."
  },

  {
    id: "sequence-alignment",
    title: "Aligning two DNA sequences",
    category: "Biology",
    difficulty: "Hard",
    prompt: `<p>You want to align two DNA sequences (say <code>GATTACA</code> and <code>GCATGCU</code>) to measure similarity, allowing matches, mismatches, and gaps (insertions/deletions). Trying every possible alignment is exponential. How do you find the best-scoring alignment efficiently?</p>`,
    hints: [
      "The best alignment of the full strings must contain, as a piece, the best alignment of their prefixes. Does the problem break into overlapping subproblems?",
      "Define the best score to align the first i letters of A with the first j letters of B. How does that value relate to the three smaller cases: (i−1,j−1), (i−1,j), (i,j−1)?",
      "Build a table. Each cell = best of: diagonal + match/mismatch score, up + gap penalty, left + gap penalty. This is Needleman–Wunsch dynamic programming: O(mn)."
    ],
    solution: `<p>This is <strong>dynamic programming</strong> (Needleman–Wunsch). Let <code>S[i][j]</code> be the best alignment score of the first <code>i</code> letters of A with the first <code>j</code> of B. Each cell depends on three neighbors:</p>
      <ul>
        <li><code>S[i−1][j−1] +</code> match/mismatch score (align the two letters),</li>
        <li><code>S[i−1][j] +</code> gap penalty (a gap in B),</li>
        <li><code>S[i][j−1] +</code> gap penalty (a gap in A).</li>
      </ul>
      <p>Take the max, fill the table row by row in <code>O(mn)</code>, then trace back from the corner to recover the alignment. Exponentially many alignments, but only <code>m×n</code> subproblems — because each optimal alignment is built from optimal alignments of prefixes.</p>`,
    probe: "Does the optimal answer for the whole input decompose into optimal answers for smaller prefixes that I'd be recomputing? If so, can I store each subproblem once?",
    lesson: "When a problem has optimal substructure and overlapping subproblems, dynamic programming turns exponential brute force into polynomial time by solving each subproblem once. Recognizing 'the best full solution is made of best partial solutions' is the trigger — it powers alignment, edit distance, RNA folding, and much of computational biology and NLP."
  },

  {
    id: "attention-softmax",
    title: "Why attention uses a softmax",
    category: "ML / AI",
    difficulty: "Hard",
    prompt: `<p>In a transformer, each token computes a similarity score with every other token, then those scores are passed through a <strong>softmax</strong> before being used to weight a sum of values. Why softmax specifically — why not just use the raw scores, or normalize by dividing by the sum?</p>`,
    hints: [
      "The goal is to produce a weighted average of value vectors. What must the weights satisfy for 'weighted average' to make sense?",
      "Raw scores can be negative or huge; you need non-negative weights that sum to 1 (a probability distribution over tokens). What smooth function maps arbitrary reals to exactly that?",
      "Softmax exponentiates (making everything positive and amplifying the largest) then normalizes. It's a differentiable soft-argmax — a temperature-controlled way to 'mostly attend to the best match' while staying trainable by gradient descent."
    ],
    solution: `<p>Attention outputs a weighted sum of value vectors, so the weights must be non-negative and sum to 1 — a probability distribution over positions. Softmax, <code>wᵢ = e^{sᵢ} / Σⱼ e^{sⱼ}</code>, is the natural map from arbitrary real scores to exactly such a distribution.</p>
      <p>It also exponentiates, which sharpens differences: the highest-scoring token gets disproportionate weight — a <em>soft, differentiable</em> version of "pick the best match" (argmax). Plain normalization fails on negative scores and doesn't sharpen; a hard argmax isn't differentiable, so gradients couldn't flow. Softmax gives smooth gradients everywhere and a temperature knob to control how peaked the attention is.</p>`,
    probe: "What do these numbers need to become before I use them as weights — and what's the smooth, differentiable function that turns any real scores into a peaked distribution I can still backprop through?",
    lesson: "Design choices in ML architectures usually answer a constraint ('outputs must be a differentiable probability distribution'), not an aesthetic preference. Ask what properties the next step requires (non-negativity, normalization, differentiability, sharpening) and the component that provides them stops looking arbitrary. This reasoning generalizes to why we use log-losses, residual connections, and normalization layers."
  },

  {
    id: "fermi-gpu",
    title: "Estimate: GPUs to train a large model",
    category: "Estimation",
    difficulty: "Medium",
    prompt: `<p>Roughly how many high-end GPUs, running for how long, would it take to train a model that requires about <strong>10²⁴ floating-point operations</strong> (FLOPs)? You won't have exact numbers — the skill is a defensible estimate from first principles.</p>`,
    hints: [
      "You need two numbers: the total work (given, ~1e24 FLOPs) and the rate one GPU delivers in practice. What's a realistic sustained throughput per GPU?",
      "A modern GPU has a peak of a few hundred teraFLOP/s (~1e15) for the relevant precision, but real training utilization is often 30–50%. Use ~1e14 effective FLOP/s per GPU.",
      "Time = work / (num_GPUs × per_GPU_rate). Pick a fleet size (say 1000 GPUs) and solve, then sanity-check against a target training duration."
    ],
    solution: `<p>Total work ≈ <code>1e24</code> FLOPs. A high-end GPU peaks around <code>1e15</code> FLOP/s, but sustained training utilization is realistically ~10–50%, so use an effective <code>~1e14</code> FLOP/s per GPU.</p>
      <p>One GPU alone: <code>1e24 / 1e14 = 1e10</code> seconds ≈ 300 years. With <strong>1,000 GPUs</strong>: <code>1e10 / 1e3 = 1e7</code> seconds ≈ <strong>~4 months</strong>. Want it in ~3 weeks (~2e6 s)? You'd need <code>1e24 / (1e14 × 2e6) ≈ 5,000 GPUs</code>. The estimate is a division once you separate total work from realized per-unit rate — and it lands in the right order of magnitude for real frontier runs.</p>`,
    probe: "Can I split this into 'how much total work' and 'how much work per unit time per device', then let time = work ÷ (devices × rate)? And what's the realistic — not peak — rate?",
    lesson: "Fermi estimation is decomposition plus honest per-unit rates. Break a scary quantity into a product/quotient of factors you can each bound within an order of magnitude, and always discount theoretical peaks to realized performance. This skill — sizing compute, cost, latency, or data — is used constantly in research planning and systems design."
  },

  {
    id: "exponential-growth",
    title: "The bacteria that fill the jar at noon",
    category: "Biology",
    difficulty: "Easy",
    prompt: `<p>A single bacterium is placed in a jar at 11:00 and divides every minute (1 → 2 → 4 → …). The jar is completely full at exactly 12:00. At what time was the jar <strong>half</strong> full? And at what time was it just <strong>1/8</strong> full?</p>`,
    hints: [
      "If the population doubles every minute, then going backward in time it halves every minute. Full at 12:00 means... how full one minute earlier?",
      "Half full is one doubling before full. 1/8 = 1/2 × 1/2 × 1/2, so three doublings before full.",
      "Half full at 11:59; 1/8 full at 11:57. Exponential growth means most of the action happens in the final moments."
    ],
    solution: `<p>Because the population doubles every minute, running time backward it <em>halves</em> every minute. If the jar is full at 12:00, it was half full one minute earlier at <strong>11:59</strong>. And <code>1/8 = (1/2)³</code>, so three minutes before full: <strong>11:57</strong>.</p>
      <p>The striking part: the jar goes from 1/8 full to completely full in the last 3 minutes of a full hour. Exponential processes stay deceptively small for almost the entire time and then complete explosively — the opposite of linear intuition.</p>`,
    probe: "Is this quantity growing by a constant amount each step, or by a constant factor? If it's a factor, what does it look like running the clock backwards?",
    lesson: "Distinguish additive from multiplicative growth immediately — exponential quantities spend most of their history looking negligible, then finish suddenly. This intuition governs epidemics, compounding, viral spread, chain reactions, and why 'it was fine until it wasn't' describes so many real systems. Reasoning in doublings (or half-lives) is faster than crunching the formula."
  },

  {
    id: "prisoners-boxes",
    title: "100 prisoners and the boxes",
    category: "Puzzles",
    difficulty: "Hard",
    prompt: `<p>100 prisoners are numbered 1–100. A room holds 100 boxes, each containing a distinct prisoner's number in random order. One at a time, each prisoner may open <strong>50 boxes</strong> looking for their own number, then leaves the room exactly as they found it — no communication. If <em>every</em> prisoner finds their number, all go free; if even one fails, all are executed. Random guessing gives a survival chance of <code>(1/2)¹⁰⁰</code> — essentially zero. Is there a strategy that gives about a <strong>31%</strong> chance?</p>`,
    hints: [
      "Random opening makes each prisoner's success independent, and independent 1/2 chances multiply to nothing. You need to correlate their fates so they tend to succeed or fail together.",
      "The numbers in the boxes form a permutation of 1–100, and every permutation decomposes into cycles. What if each prisoner followed a cycle instead of guessing?",
      "Each prisoner starts at the box labeled with their own number, then goes to the box whose label equals the number they just found, and repeats. They succeed iff the cycle containing their number has length ≤ 50."
    ],
    solution: `<p>Each prisoner opens the box bearing their own number, then follows the chain: open the box whose label equals the number just discovered, and repeat. This traces the permutation cycle containing the prisoner's number and returns home — within 50 steps <em>iff</em> that cycle has length ≤ 50.</p>
      <p>So everyone succeeds precisely when the random permutation has <strong>no cycle longer than 50</strong>. The probability a random permutation of 100 elements has a cycle longer than 50 is <code>1/51 + 1/52 + … + 1/100 ≈ ln 2 ≈ 0.693</code>. Survival is therefore about <code>1 − 0.693 ≈ 30.7%</code> — astronomically better than independent guessing.</p>`,
    probe: "Instead of 'how do I improve one prisoner's odds?', ask 'how do I make everyone's fate correlated so they win or lose together?' — then look for hidden structure (cycles) in the random arrangement.",
    lesson: "When independent chances multiply to near-zero, the win is to correlate outcomes, not improve them individually. Exploiting hidden structure (here, permutation cycles) turns 2⁻¹⁰⁰ into ~1/3. This coupling idea recurs in coding theory, hashing, and distributed systems."
  },

  {
    id: "blue-eyed-islanders",
    title: "The blue-eyed islanders",
    category: "Logic",
    difficulty: "Hard",
    prompt: `<p>On an island live 100 blue-eyed and 100 brown-eyed people. There are no mirrors and no one may discuss eye color; each sees everyone else's eyes but not their own. The rule: the night you can logically <em>prove</em> your own eye color, you must leave at midnight. All are perfect logicians. One day a trusted visitor announces to everyone: <strong>"At least one of you has blue eyes."</strong> Everyone already knew that. So what, if anything, happens?</p>`,
    hints: [
      "Everyone could already see blue eyes, so the statement adds no first-order fact. Think instead about what each person knows about what others know about what others know…",
      "Shrink it. With 1 blue-eyed person, they see zero blue eyes, so the announcement tells them it's them — they leave night 1. With 2, each sees one other; when that person doesn't leave night 1, each deduces their own eyes.",
      "By induction, with n blue-eyed people, all n leave on night n. The announcement's real effect is to create common knowledge, which lets the induction begin."
    ],
    solution: `<p>All 100 blue-eyed people leave on <strong>night 100</strong>. Induction: with 1 blue-eyed person, they see no blue eyes and the announcement pins it on them — they leave night 1. With <code>n</code>, each blue-eyed person sees <code>n−1</code> others and reasons: "if I were brown-eyed, those <code>n−1</code> would leave on night <code>n−1</code>." When night <code>n−1</code> passes with nobody leaving, each concludes they must also be blue-eyed, and all <code>n</code> leave on night <code>n</code>.</p>
      <p>The visitor stated nothing new factually — everyone saw blue eyes. What the public announcement created is <strong>common knowledge</strong>: now everyone knows that everyone knows … that someone has blue eyes, to unlimited depth. That infinite tower is exactly what the induction requires to get off the ground.</p>`,
    probe: "Ask 'what does each person know about what others know about what others know?' — the puzzle turns on common knowledge, not on any fact someone was missing.",
    lesson: "There's a real difference between everyone knowing X and it being common knowledge that everyone knows X. Public announcements can change behavior even when they state the obvious. This underlies distributed protocols, coordination problems, and why saying something out loud sometimes matters."
  },

  {
    id: "twelve-coins",
    title: "Twelve coins, one fake, three weighings",
    category: "Puzzles",
    difficulty: "Hard",
    prompt: `<p>You have 12 identical-looking coins. Exactly one is counterfeit and differs in weight — but you don't know whether it's <em>heavier or lighter</em>. Using a balance scale only <strong>three times</strong>, identify the fake coin AND whether it is heavy or light.</p>`,
    hints: [
      "Each weighing has three outcomes (left down, balance, right down), so three weighings give 3³ = 27 signals. You must distinguish 24 cases (12 coins × heavy/light). It's tight — every weighing must split the possibilities as evenly as possible.",
      "Don't reuse the same groupings. Make later weighings depend on earlier results, and move coins across pans (not just add or remove) so a coin can be 'heavy-suspect' in one weighing and 'light-suspect' in another.",
      "Start 4 vs 4. If they balance, the fake is among the untouched 4 (easy in two more). If not, you have 8 suspects with known lean directions — swap coins between pans in weighing two to localize."
    ],
    solution: `<p>It's solvable in exactly three weighings. Label the coins 1–12. Weigh <code>{1,2,3,4}</code> vs <code>{5,6,7,8}</code>.</p>
      <ul>
        <li><strong>Balance:</strong> the fake is in <code>{9,10,11,12}</code>. Weigh <code>9,10,11</code> against three known-good coins; the tilt direction (or balance, meaning coin 12) plus a final weighing pins the coin and whether it's heavy or light.</li>
        <li><strong>Unbalanced</strong> (say left heavy): either one of <code>{1,2,3,4}</code> is heavy or one of <code>{5,6,7,8}</code> is light. Now weigh a mixed group such as <code>{1,2,5}</code> vs <code>{3,4,6}</code>; the pattern of tilts across the two unbalanced weighings uniquely identifies the coin and its direction via the standard decision tree.</li>
      </ul>
      <p>The design works because each of the 24 possible answers maps to a distinct sequence of three ternary readings.</p>`,
    probe: "Ask 'how much information does one weighing give (three outcomes), and how many outcomes must I tell apart (24)?' Then force every weighing to divide the remaining possibilities into near-equal thirds.",
    lesson: "Information theory sets the floor: k ternary weighings can distinguish 3ᵏ cases. Designing each test to maximize information (balanced splits) is the same principle behind decision trees, binary search, and optimal codes."
  },

  {
    id: "burning-ropes",
    title: "Burning ropes: measure 45 minutes",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You have two ropes and a lighter. Each rope takes exactly 60 minutes to burn from one end to the other, but burns <em>unevenly</em> — half the rope's length might burn in 5 minutes or in 55. Using only these ropes, measure out exactly <strong>45 minutes</strong>.</p>`,
    hints: [
      "You can't trust length, since burning is uneven. But one property is exact regardless of unevenness: total burn time from one end is 60 minutes. What if you lit a rope at both ends?",
      "Lighting a rope at both ends makes it burn out in exactly 30 minutes — the two flames together consume the whole 60-minutes-worth of rope, whatever the shape.",
      "Light rope A at both ends and rope B at one end at the same instant. When A finishes (30 min), light B's other end; B's remaining 30-minutes-worth now burns in 15. 30 + 15 = 45."
    ],
    solution: `<p>Light rope A at <em>both</em> ends and rope B at <em>one</em> end, simultaneously. Rope A burns out in exactly 30 minutes (two flames consume the entire 60-minutes-worth of rope). At that instant, rope B has exactly 30 minutes of burn left — so light B's other end too, and the remaining rope now burns from both ends in 15 minutes. Total: <code>30 + 15 = 45</code> minutes.</p>`,
    probe: "Ask 'what quantity stays exact despite the unevenness?' — it's total burn time, not length. Lighting both ends halves the time, and that's the lever you actually control.",
    lesson: "When a resource is irregular in one dimension (length) but fixed in another (total time), operate on the invariant. Combining operations — both ends, staggered starts — synthesizes values you can't measure directly, a trick common in clock, rate, and arithmetic puzzles."
  },

  {
    id: "bridge-torch",
    title: "The bridge and the torch",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>Four people must cross a rickety bridge at night. They share one torch, the bridge holds at most two at a time, and any crossing requires the torch. Their crossing times are 1, 2, 5, and 10 minutes; a pair moves at the <em>slower</em> person's pace. What is the minimum total time to get all four across?</p>`,
    hints: [
      "Someone must carry the torch back each time, so plan the return trips too. The tempting 'fastest person escorts everyone' wastes the slow people's crossings.",
      "The real cost is the slow people. Can you arrange for the two slowest to cross together, so their times overlap rather than add?",
      "Send 1&2 over (2), 1 returns (1), then 5&10 cross together (10), 2 returns (2), 1&2 cross (2). Total 17."
    ],
    solution: `<p>The minimum is <strong>17 minutes</strong>. Send the two fastest first: 1 and 2 cross (2 min), and 1 returns with the torch (1 min). Now the crucial move — the two slowest cross <em>together</em>: 5 and 10 (10 min), so you pay 10 instead of 5+10. Then 2 returns (2 min), and finally 1 and 2 cross (2 min). Total: <code>2 + 1 + 10 + 2 + 2 = 17</code>.</p>
      <p>The naive "1 escorts each person and runs back" gives 2+1+5+1+10 = 19; pairing the two slowest saves those minutes.</p>`,
    probe: "Ask 'which crossings dominate the total, and can I make the two most expensive ones happen at the same time?' — pair the slowest together rather than escorting each individually.",
    lesson: "In scheduling with a shared bottleneck resource, the win is overlapping the most expensive operations, not greedily minimizing each trip. The 'fastest helper' heuristic is a trap; the optimum batches the costly items — a core scheduling insight."
  },

  {
    id: "twenty-five-horses",
    title: "25 horses, 5 tracks",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You have 25 horses and a track that races exactly 5 at a time. You have no stopwatch — you only observe the finishing order within each race. What is the <strong>minimum number of races</strong> needed to identify the three fastest horses?</p>`,
    hints: [
      "You must race every horse at least once to learn anything: that's 5 races of 5.",
      "Race the 5 heat-winners to find the overall fastest — but the 2nd and 3rd fastest overall might be horses that placed behind a very strong horse in their heat, so keep them as candidates.",
      "After the winners' race, only a handful of horses can still be top-3. You can settle it in exactly one more race. Total: 7."
    ],
    solution: `<p><strong>7 races.</strong> Run 5 heats of 5 (races 1–5). Race the five heat-winners (race 6); label them <code>A > B > C > D > E</code>. Now <code>A</code> is the fastest overall, and only these can still be 2nd or 3rd: <code>B</code> and <code>C</code>; the horses that placed 2nd and 3rd in <em>A's</em> heat; and the horse that placed 2nd in <em>B's</em> heat — five horses in all. Race those five (race 7); its top two are the 2nd and 3rd fastest overall. Total <code>5 + 1 + 1 = 7</code>.</p>`,
    probe: "Ask 'after each race, exactly which horses are still eligible to be top-3, and which are provably eliminated?' — track the partial order instead of trying to fully sort.",
    lesson: "You rarely need a full sort to find the top-k — prune aggressively using the partial order you already have. This selection-versus-sorting distinction saves work in algorithms (tournament selection, medians) and in any ranking-under-constraints problem."
  },

  {
    id: "three-switches",
    title: "Three switches, one bulb",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>Outside a closed room are three on/off switches; inside is a single incandescent bulb. Exactly one switch controls it. You may toggle the switches freely while the door is shut, but you can <strong>enter the room only once</strong>, and you can't see the bulb from outside. Identify which switch controls the bulb.</p>`,
    hints: [
      "On/off is only two states, but you have three switches. A bulb carries more information than its on/off state if you use time. What else about a bulb changes when it's been on?",
      "Heat. A bulb that was recently on stays warm for a while even after you switch it off.",
      "Turn switch 1 on for several minutes, switch it off, turn switch 2 on, then enter. Lit → switch 2; off but warm → switch 1; off and cold → switch 3."
    ],
    solution: `<p>Turn switch 1 on and leave it for several minutes. Then turn it off, turn switch 2 on, and immediately enter. Read the bulb three ways: <strong>on</strong> → switch 2 controls it; <strong>off but warm</strong> → switch 1 (it was on long enough to heat up); <strong>off and cold</strong> → switch 3. You extracted three distinguishable states from a single observation by using temperature as a second channel.</p>`,
    probe: "Ask 'what extra signals does this system carry beyond its obvious on/off state?' — the bulb encodes its recent history as heat, giving you a third state for free.",
    lesson: "When limited to one observation, expand the state space by exploiting side channels — heat, timing, order. Real systems leak far more information than their nominal outputs, a mindset central to debugging, side-channel security, and clever experiment design."
  },

  {
    id: "pirates-gold",
    title: "The pirates and the gold",
    category: "Game Theory",
    difficulty: "Hard",
    prompt: `<p>Five rational, greedy pirates (ranked 5 = most senior down to 1) must split 100 gold coins. The most senior pirate proposes a division; then all pirates, including the proposer, vote. If at least half approve, it passes. Otherwise the proposer is thrown overboard and the next-most-senior proposes, and so on. Each pirate's priorities, in order: (1) stay alive, (2) get the most gold, (3) all else equal, prefer to throw others overboard. What should pirate 5 propose?</p>`,
    hints: [
      "Solve backwards. What happens with just 2 pirates? With 1? Establish the endgame first, then work up.",
      "With 2 pirates left, the senior keeps all 100 (his own vote is half). So pirate 1 dreads it getting down to 2 pirates — he'd accept a single coin to avoid that.",
      "Each proposer only needs to buy the cheapest votes: the pirates who'd get nothing in the next scenario. Trace {2: 100,0}, {3: 99,0,1}, {4: 99,0,1,0}, {5: 98,0,1,0,1}."
    ],
    solution: `<p>Pirate 5 proposes <strong>98 for himself, 0 to pirate 4, 1 to pirate 3, 0 to pirate 2, and 1 to pirate 1</strong> — and it passes. Reason backwards:</p>
      <ul>
        <li><strong>2 pirates:</strong> senior takes all 100 (his lone vote is half).</li>
        <li><strong>3 pirates:</strong> pirate 3 gives pirate 1 one coin (better than the 0 he'd get if it fell to 2 pirates) → {99, 0, 1}.</li>
        <li><strong>4 pirates:</strong> pirate 4 buys pirate 2 with one coin → {99, 0, 1, 0}.</li>
        <li><strong>5 pirates:</strong> pirate 5 needs two extra votes; he buys the pirates who'd get 0 in the 4-pirate case — pirates 3 and 1 — with one coin each → {98, 0, 1, 0, 1}.</li>
      </ul>
      <p>Votes from pirates 5, 3, and 1 are three of five — enough.</p>`,
    probe: "Ask 'what's the simplest end state, and what does each player get there?' Then work backward, bribing only the players for whom your offer beats their next-best outcome — and pay them the minimum.",
    lesson: "Backward induction solves sequential games: start from the terminal case and propagate. The proposer need only bribe those who fare worse in the next round, at the lowest price. This reasoning drives negotiations, auctions, and any multi-stage strategic decision."
  },

  {
    id: "mutilated-chessboard",
    title: "The mutilated chessboard",
    category: "Logic",
    difficulty: "Medium",
    prompt: `<p>Take a standard 8×8 chessboard and remove two <em>diagonally opposite</em> corner squares, leaving 62 squares. You have 31 dominoes, each covering exactly two orthogonally adjacent squares. Can you tile all 62 squares with the 31 dominoes? Prove your answer.</p>`,
    hints: [
      "You'll keep failing to tile it by trial — so instead of searching harder, look for a reason it's impossible: an invariant.",
      "Color the board in the usual alternating pattern. What two colors does any single domino always cover?",
      "Every domino covers one white and one black square. Now — what color are the two diagonally opposite corners?"
    ],
    solution: `<p>It is <strong>impossible</strong>. Color the board in the standard alternating pattern. Every domino, covering two adjacent squares, always covers exactly one white and one black square — so 31 dominoes must cover 31 white and 31 black squares. But two diagonally opposite corners are always the <em>same</em> color; removing them leaves 32 squares of one color and 30 of the other. Since <code>32 ≠ 30</code>, no tiling can exist. A single coloring argument settles it — no search required.</p>`,
    probe: "Ask 'is there a quantity every domino preserves that the mutilated board violates?' — hunt for an invariant instead of trying arrangements.",
    lesson: "To prove impossibility, find an invariant (here, color balance) that every legal move preserves but the goal state breaks. Coloring and parity arguments are powerful across combinatorics, algorithms, and reasoning about program state."
  },

  {
    id: "hundred-lockers",
    title: "The 100 lockers",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>There are 100 closed lockers in a row and 100 students. Student <code>k</code> walks by and toggles every <code>k</code>-th locker (student 1 toggles all; student 2 toggles 2, 4, 6, …; student 3 toggles 3, 6, 9, …; and so on). After all 100 students have passed, <strong>which lockers are open?</strong></p>`,
    hints: [
      "Locker n gets toggled once by each student whose number divides n. So its final state depends on the number of divisors of n.",
      "A locker ends open iff it's toggled an odd number of times — i.e. iff n has an odd number of divisors. Divisors usually come in pairs (d and n/d).",
      "The pairing breaks only when d = n/d, i.e. n is a perfect square. So perfect-square lockers have an odd divisor count and stay open."
    ],
    solution: `<p>Exactly the <strong>perfect-square lockers</strong> are open: 1, 4, 9, 16, 25, 36, 49, 64, 81, 100 — ten in total. Locker <code>n</code> is toggled once per divisor of <code>n</code>, so it ends open iff <code>n</code> has an odd number of divisors. Divisors normally pair up as <code>(d, n/d)</code>, giving an even count — except when <code>d = n/d</code>, i.e. <code>n</code> is a perfect square, where <code>√n</code> is its own partner. Those are the only lockers with an odd divisor count.</p>`,
    probe: "Ask 'what determines each locker's final state?' — the parity of its divisor count — then 'when is a divisor count odd?'",
    lesson: "Reframe a process by the property of each element that determines its fate (here, parity of divisor count), then characterize that property (perfect squares). Turning a simulation into a number-theoretic condition is faster and generalizes."
  },

  {
    id: "ants-on-a-stick",
    title: "Ants on a stick",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>Several ants are placed at arbitrary positions on a 1-meter stick, each facing left or right and walking at 1 m/min. Whenever two ants collide, they <em>both instantly reverse direction</em>. An ant that reaches either end falls off. Over all possible starting configurations, what is the <strong>longest time</strong> you might have to wait until every ant has fallen off?</p>`,
    hints: [
      "The collisions look like they make this hopelessly complex. Is there a way to view the situation in which the collisions disappear entirely?",
      "Two ants colliding and reversing is indistinguishable from two ants passing straight through each other — if the ants are anonymous, the set of positions and speeds is identical either way.",
      "So pretend they pass through. Each ant then just walks straight to an end, taking at most 1 minute (the stick's full length)."
    ],
    solution: `<p>The answer is <strong>1 minute</strong>. The key trick: when two identical ants collide and reverse, it is physically indistinguishable from the two ants <em>passing through each other</em> — since the ants are interchangeable, the collection of positions and velocities is the same. Ignoring collisions, every ant simply walks straight to one end. The longest any ant can walk is the full length of the stick, 1 meter, taking 1 minute. So regardless of how many ants there are or how they're arranged, all have fallen off within 1 minute.</p>`,
    probe: "Ask 'can I find an equivalent system in which the hard part — the collisions — simply vanishes?' Swapping the ants' identities turns every reversal into a harmless pass-through.",
    lesson: "Reframing to an equivalent, simpler system is one of the most powerful moves in problem-solving. When interactions are symmetric, relabeling can make them disappear. This 'quasi-particle' change of view recurs in physics, algorithms, and probability."
  },

  {
    id: "gold-bar-seven-days",
    title: "The gold bar and seven days",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You hire a worker for 7 days and pay with a gold bar divided into 7 equal connected segments. You must pay exactly one segment's worth of gold at the end of each day (the worker keeps what they've been paid, and you may make change by taking gold back). You want to make the <strong>fewest cuts</strong> to the bar. How many cuts do you need, and how does payment proceed?</p>`,
    hints: [
      "You're allowed to take gold back as change, so you don't need 7 separate one-segment pieces.",
      "Think in powers of two. What piece sizes let you represent every total from 1 to 7?",
      "Pieces of 1, 2, and 4 segments cover all values 1–7. Two cuts produce exactly those three pieces."
    ],
    solution: `<p>Only <strong>2 cuts</strong>, producing pieces of <strong>1, 2, and 4</strong> segments. Because change is allowed, these three pieces make every daily total by swapping:</p>
      <ul>
        <li>Day 1: give 1 → worker has 1.</li>
        <li>Day 2: give 2, take back 1 → has 2.</li>
        <li>Day 3: give the 1 back → has 3.</li>
        <li>Day 4: give 4, take back the 1 and 2 → has 4.</li>
        <li>Day 5: give 1 → 5. Day 6: give 2, take back 1 → 6. Day 7: give 1 → 7.</li>
      </ul>
      <p>The sizes 1, 2, 4 are powers of two, and powers of two represent every integer up to their sum.</p>`,
    probe: "Ask 'am I actually allowed to take change back?' — that reframes the task from 'partition into seven pieces' to 'represent every value 1–7', which binary (1, 2, 4) does with the fewest pieces.",
    lesson: "Question the constraint you assumed. Once returns are allowed, binary representation minimizes pieces: k pieces of sizes 1, 2, 4, …, 2ᵏ⁻¹ express every value up to 2ᵏ−1. Positional/binary thinking is a recurring key to encoding and change-making problems."
  },

  {
    id: "two-guards",
    title: "The two guards and one question",
    category: "Logic",
    difficulty: "Medium",
    prompt: `<p>You reach a fork in the road: one path leads to safety, the other to doom. Two guards stand there. One <em>always</em> tells the truth, the other <em>always</em> lies — but you don't know which is which. You may ask exactly <strong>one yes/no question to one guard</strong>. What do you ask to determine the safe path?</p>`,
    hints: [
      "Since you don't know which guard you're addressing, your question must yield equally useful information whether you happen to ask the liar or the truth-teller.",
      "Build the other guard's behavior into your question, so that the single lie in the chain cancels out.",
      "Ask either guard: 'If I asked the other guard whether the left path is safe, would they say yes?' Then do the opposite of the answer."
    ],
    solution: `<p>Ask either guard: <em>"If I asked the <strong>other</strong> guard whether the left path leads to safety, would they say 'yes'?"</em> Then take the <strong>opposite</strong> of whatever answer you get.</p>
      <p>Why it works: suppose left is safe. If you're asking the truth-teller, they truthfully report that the liar would say "no" → you hear "no". If you're asking the liar, the truth-teller would actually say "yes", but the liar lies about that → you again hear "no". Either way the answer is "no", so you go left (the opposite). The one lie in the chain always flips the truth exactly once, so the reply is reliably inverted no matter whom you ask.</p>`,
    probe: "Ask 'how can I phrase a question so the thing I don't know — which guard I'm talking to — cancels out?' Routing it through the other guard injects exactly one lie, making the answer predictable.",
    lesson: "When you can't tell which of two sources you're querying, design a question invariant to that unknown — here by composing their answers so the lie cancels. Self-referential and indirect questioning is a powerful tool in logic, cryptographic protocols, and robust system design."
  },

  {
    id: "hh-vs-ht",
    title: "Coin patterns: HH versus HT",
    category: "Probability",
    difficulty: "Hard",
    prompt: `<p>You flip a fair coin repeatedly until a target pattern first appears. On average, how many flips does it take to first see <strong>HH</strong> (two heads in a row)? And to first see <strong>HT</strong>? They are <em>not</em> equal — and understanding why is the point.</p>`,
    hints: [
      "Set up states for your progress toward the pattern and write expected-value equations — or think carefully about what a 'near miss' costs you.",
      "For HT: once you've seen an H, any following T completes it, and another H keeps you primed. For HH: after one H, a T throws you all the way back to the start.",
      "HT takes 4 flips on average; HH takes 6. The difference is how much partial progress survives a wrong flip — patterns that overlap themselves behave differently."
    ],
    solution: `<p>Expected flips: <strong>HT → 4</strong>, <strong>HH → 6</strong>. Use states. For <strong>HT</strong>, let <code>a</code> = expected flips from scratch and <code>b</code> = expected once you hold an H. From scratch <code>a = 1 + ½a + ½b</code> (H advances to b, T stays); from b, <code>b = 1 + ½b + ½·0</code> (another H keeps you primed, a T finishes). Solving gives <code>b = 2, a = 4</code>.</p>
      <p>For <strong>HH</strong>, from state b a tail sends you back to scratch: <code>b = 1 + ½·0 + ½a</code> and <code>a = 1 + ½a + ½b</code>, which solve to <code>a = 6</code>. The asymmetry: after "H then wrong flip", HT retains useful progress while HH loses everything. It's the pattern's self-overlap, not the per-flip odds, that drives the gap.</p>`,
    probe: "Ask 'when I fail partway through, how much of my progress do I keep?' — HT preserves more than HH, and that self-overlap property, not the individual coin odds, sets the waiting time.",
    lesson: "Waiting times for patterns depend on the pattern's self-overlap structure, not just per-symbol probability (this drives Penney's game, where the second player can gain an edge). The state-machine expected-value method is the workhorse for Markov chains, and the overlap idea underlies string-matching algorithms like KMP."
  },

  {
    id: "trailing-zeros",
    title: "Trailing zeros of 100!",
    category: "Algorithms",
    difficulty: "Medium",
    prompt: `<p>How many trailing zeros does <code>100!</code> (100 factorial) have — without ever computing the astronomically large number itself?</p>`,
    hints: [
      "A trailing zero is a factor of 10 = 2 × 5. Between 2 and 5, which factor is scarcer inside a factorial?",
      "Factors of 2 vastly outnumber factors of 5 in a factorial, so the number of trailing zeros equals the number of factors of 5 in 100!.",
      "Count multiples of 5 up to 100 (there are 20), plus multiples of 25 (there are 4, each contributing an extra 5), plus 125 (none). 20 + 4 = 24."
    ],
    solution: `<p><strong>24.</strong> A trailing zero comes from a factor of <code>10 = 2 × 5</code>, and factors of 2 are far more common than factors of 5 in a factorial — so the count of trailing zeros equals the count of factor-5s in <code>100!</code>. Count them with Legendre's approach: <code>⌊100/5⌋ = 20</code> (multiples of 5), plus <code>⌊100/25⌋ = 4</code> (multiples of 25 each give a second 5), plus <code>⌊100/125⌋ = 0</code>. Total <code>20 + 4 = 24</code>.</p>`,
    probe: "Ask 'what actually creates a trailing zero, and which ingredient is the bottleneck?' — it's the scarcer prime factor (5), so just count those.",
    lesson: "Find the limiting factor instead of computing the whole object. Reducing 'count trailing zeros' to 'count factor-5s' sidesteps a huge number entirely. Identifying the true bottleneck — the rate-limiting resource — is a general modeling and optimization skill."
  },

  {
    id: "rope-around-earth",
    title: "The rope around the Earth",
    category: "Estimation",
    difficulty: "Medium",
    prompt: `<p>Picture a rope tied snugly around the Earth's equator (~40,000 km). You add just <strong>1 meter</strong> to its length and lift it uniformly so it hovers at a constant height above the ground all the way around. Could a cat crawl underneath? A person? Estimate the gap before calculating.</p>`,
    hints: [
      "Don't be intimidated by the huge circumference. Write the gap in terms of the change in radius and see what cancels.",
      "Circumference is C = 2πr, so r = C/(2π). If C grows by 1 meter, how much does r grow?",
      "Δr = 1/(2π) ≈ 0.159 m ≈ 16 cm — and notice the Earth's radius never appears in the answer."
    ],
    solution: `<p>The gap is about <strong>16 cm</strong> — and it's completely independent of the Earth's size. Since <code>C = 2πr</code>, we have <code>r = C/(2π)</code>, so adding 1 meter to the circumference increases the radius by exactly <code>Δr = 1/(2π) ≈ 0.159 m ≈ 15.9 cm</code>. The enormous radius cancels out entirely — you'd get the very same 16 cm gap adding 1 meter of rope around a basketball. A cat crawls under easily; a person cannot.</p>`,
    probe: "Ask 'does the answer even depend on the Earth's radius?' — writing the relationship symbolically shows the big number cancels, defeating the intuition that 1 m on 40,000 km must be negligible.",
    lesson: "Manipulate the relationship symbolically before trusting your gut about scale. A linear relationship (Δr = ΔC/2π) makes an 'obviously tiny' change surprisingly large and size-independent. Checking whether a quantity even appears in the answer prevents a whole class of estimation errors."
  },

  {
    id: "two-children-tuesday",
    title: "Two children, born on a Tuesday",
    category: "Probability",
    difficulty: "Hard",
    prompt: `<p>A parent tells you, "I have two children, and at least one is a boy." What is the probability that both are boys? Then they add, "...and he was born on a <strong>Tuesday</strong>." Now what's the probability both are boys? The second answer surprises almost everyone.</p>`,
    hints: [
      "First part: list the equally likely two-child combos — BB, BG, GB, GG — and see which survive 'at least one boy', and in how many the other child is also a boy.",
      "The first answer is 1/3, not 1/2: BB, BG, GB all qualify, but only BB has two boys.",
      "For the Tuesday version, enumerate over (gender, day-of-week) pairs. The extra detail partially distinguishes the two children, pulling the answer toward 1/2 — specifically 13/27."
    ],
    solution: `<p><strong>First answer: 1/3.</strong> The equally likely combinations are BB, BG, GB, GG. "At least one boy" eliminates GG, leaving three, of which only BB has two boys → <code>1/3</code>.</p>
      <p><strong>Second answer: 13/27.</strong> Now enumerate (child's gender, day of week): 14 possibilities per child, 196 equally likely ordered pairs. Count pairs with at least one "boy born on Tuesday": 14 (first child is a Tuesday-boy) + 14 (second child is) − 1 (counted twice) = 27. Of those 27, the number in which <em>both</em> children are boys is 13. So the probability is <code>13/27 ≈ 0.48</code> — much closer to 1/2. The seemingly irrelevant "Tuesday" carries information that partially identifies which child the boy is.</p>`,
    probe: "Ask 'exactly which equally likely outcomes are consistent with what I was told?' — carefully enumerating the conditioned sample space, including the 'irrelevant' day, is what exposes the surprise.",
    lesson: "Conditional probability is about which outcomes survive the given information — and seemingly irrelevant details can carry information that shifts the answer. Always define the exact conditioned sample space rather than reasoning verbally. This precision is central to Bayesian inference and evaluating evidence."
  },

  {
    id: "levinthals-paradox",
    title: "Levinthal's paradox (protein folding)",
    category: "Biology",
    difficulty: "Hard",
    prompt: `<p>A typical protein is a chain of 100+ amino acids that folds into one specific 3D shape. If each residue had only a few possible orientations, the number of possible conformations is astronomical (~10³⁰⁰). If folding were a random search over all of them, it would take longer than the age of the universe. Yet proteins fold reliably in microseconds to milliseconds. How is this possible?</p>`,
    hints: [
      "The paradox assumes folding is a blind, exhaustive search over equally likely conformations. What if the energy landscape isn't flat but slopes toward the answer?",
      "Folding isn't random sampling — it's downhill on an energy surface. Partially correct structures are more stable and form early, biasing the path.",
      "The landscape is funnel-shaped: countless high-energy unfolded states drain toward the single low-energy native state. Local structure forms fast and constrains the rest, so most conformations are never visited."
    ],
    solution: `<p>The resolution is that folding is <strong>not a random search</strong> — the energy landscape is funnel-shaped. Levinthal's estimate assumes every conformation is equally likely and must be sampled, but in reality partially folded, partially correct structures are lower in energy and form rapidly, biasing the protein downhill toward its native state. Local secondary structures (helices, sheets) nucleate quickly and constrain the remaining search. The protein slides down the funnel rather than wandering a flat landscape, reaching its native fold in milliseconds while visiting a vanishing fraction of all conformations. This funneling is also why predicting the native structure (the problem AlphaFold tackles) is well-posed: the landscape reliably converges to one answer.</p>`,
    probe: "Ask 'is the search really uniform and random, or is something biasing it?' — the paradox exists only under the false assumption of a flat landscape; a funnel dissolves it.",
    lesson: "When a random-search estimate yields an absurd time, the real process almost certainly isn't a uniform random search — there's structure guiding it. Recognizing a guided landscape versus a flat one turns 'impossible' into 'fast'. This is exactly why gradient-based optimization and heuristic search succeed where brute force can't."
  },

  {
    id: "residual-connections",
    title: "Why residual connections work",
    category: "ML / AI",
    difficulty: "Hard",
    prompt: `<p>Historically, very deep neural networks (50+ layers) were hard to train — adding layers made both training <em>and</em> test error worse, even though a deeper network can represent anything a shallower one can (just set the extra layers to identity). Residual connections — adding a layer's input to its output, <code>y = x + f(x)</code> — largely fixed this. Why do they help so much?</p>`,
    hints: [
      "If a deep net can always represent a shallow one, why does plain deep training fail? The problem is optimization, not representational capacity.",
      "Gradients backpropagate as a product across all layers. Through dozens of layers they tend to vanish or explode, so early layers barely learn. What path could let gradients skip layers?",
      "With y = x + f(x), the layer only learns a small residual f(x), and the gradient flows directly through the +x term, staying healthy across great depth."
    ],
    solution: `<p>The trouble with plain deep nets is <strong>optimization, not capacity</strong>. Gradients propagate backward as a product across layers; through many layers they tend to vanish (or explode), so early layers receive almost no learning signal. A residual block computes <code>y = x + f(x)</code>: the layer only needs to learn the residual correction <code>f(x)</code>, and — crucially — the gradient has a direct additive path through the <code>+x</code> term, reaching early layers without being repeatedly multiplied down. Making "do nothing" (<code>f = 0</code>, identity) the easy default means adding layers never hurts, and gradients stay well-scaled. This is what let networks grow from ~20 to 1000+ layers.</p>`,
    probe: "Ask 'is this a representation problem or an optimization problem?' — deep nets can represent the function; they just can't be trained to, because gradients don't survive the depth. That reframes the fix as 'give the gradient a shortcut.'",
    lesson: "Distinguish 'can the model represent it?' from 'can we optimize it?' — many deep-learning advances (residuals, normalization, careful init) are optimization fixes, not capacity fixes. When something should work but won't train, suspect gradient flow."
  },

  {
    id: "cross-entropy-vs-mse",
    title: "Why cross-entropy, not MSE, for classification",
    category: "ML / AI",
    difficulty: "Medium",
    prompt: `<p>A classifier with a softmax output is almost always trained with cross-entropy loss rather than mean squared error. Both are minimized when the prediction is correct — so why does cross-entropy train so much better in practice?</p>`,
    hints: [
      "Compare the gradient each loss produces when the model is confidently wrong. Which one still gives a strong learning signal?",
      "Softmax + MSE can produce vanishingly small gradients when outputs saturate near 0 or 1, even if the prediction is badly wrong — so learning stalls exactly when it shouldn't.",
      "Softmax + cross-entropy has a gradient (with respect to the logits) of simply (predicted − target), which is large precisely when the model is confidently wrong. It's also the maximum-likelihood loss for categorical outputs."
    ],
    solution: `<p>Cross-entropy pairs with softmax to give a clean, well-behaved gradient: the derivative of softmax + cross-entropy with respect to the logits is simply <code>(predicted probability − target)</code>. So when the model is confidently wrong, the gradient is large and learning is fast. Softmax + MSE, by contrast, produces vanishingly small gradients in exactly those confidently-wrong regions (the saturated tails of the softmax), so training stalls. Cross-entropy is also the maximum-likelihood loss for a categorical distribution, so minimizing it directly maximizes the probability of the correct labels — whereas MSE implicitly assumes Gaussian errors, the wrong model for class probabilities.</p>`,
    probe: "Ask 'what gradient does each loss produce when the model is confidently wrong?' — the loss that keeps a strong signal there (cross-entropy) is the one that trains well.",
    lesson: "Choose loss functions by the gradients they produce, not just where their minima sit — two losses with the same optimum can train completely differently. Matching the loss to the output's probability model (maximum likelihood) is the principled rule."
  },

  {
    id: "recessive-alleles",
    title: "Why harmful recessive alleles persist",
    category: "Biology",
    difficulty: "Medium",
    prompt: `<p>A harmful recessive genetic disease affects only individuals carrying <em>two</em> copies of the allele. Natural selection removes affected individuals, yet these alleles persist in populations for thousands of generations. Why doesn't selection simply eliminate a harmful recessive allele?</p>`,
    hints: [
      "Where do most copies of a rare recessive allele actually reside — in the affected individuals, or hidden somewhere selection can't see?",
      "If the allele has frequency q, affected individuals (two copies) are q² of the population, but carriers with one copy are 2q(1−q). Compare these when q is small.",
      "Selection only removes the q² homozygotes; the vast majority of allele copies hide in healthy heterozygous carriers, invisible to selection."
    ],
    solution: `<p>When a recessive allele has low frequency <code>q</code>, affected homozygotes are only <code>q²</code> of the population, but healthy heterozygous carriers are <code>2q(1−q)</code>. For small <code>q</code> the carriers vastly outnumber the affected — e.g. <code>q = 0.01</code> gives <code>0.0001</code> affected but <code>~0.02</code> carriers, a 200:1 ratio. Selection can act only on the visible homozygotes, so it removes a tiny fraction of allele copies each generation while almost all copies stay hidden in carriers. Combined with new mutations replenishing the allele, elimination is extraordinarily slow — so the allele persists. This is a direct consequence of the Hardy–Weinberg genotype frequencies.</p>`,
    probe: "Ask 'where are the copies of this allele actually located?' — most hide in unaffected carriers (2q(1−q)), invisible to selection, not in the affected q² that selection can act on.",
    lesson: "Track where the bulk of a quantity actually resides before assuming a removal process is efficient. Selection against recessive homozygotes is nearly blind to the allele's true reservoir. This 'most of it is hidden from the filter' reasoning applies to error correction, test coverage, and rare-event statistics."
  },

  {
    id: "prisoners-light-switch",
    title: "100 prisoners and the light switch",
    category: "Logic",
    difficulty: "Hard",
    prompt: `<p>100 prisoners will be taken, one at a time in random order (repeats allowed, indefinitely), into a room with a single light switch (on/off, unknown initial state). Each may toggle the switch or not, then leaves; there's no other communication. At any point, any prisoner may declare "all 100 have now visited this room." If correct, everyone is freed; if wrong, everyone is executed. They may strategize in advance. What strategy <strong>guarantees</strong> freedom?</p>`,
    hints: [
      "They must count 100 distinct visits using one bit of shared memory (the switch) and no synchronization. Symmetry is the enemy — break it by assigning roles.",
      "Appoint one prisoner as the sole 'counter'. Only the counter ever turns the light OFF; everyone else's job is to turn it ON — but each of them only once.",
      "Each non-counter turns the light ON the first time they find it OFF, then never touches it again. The counter turns it OFF each time they find it ON, counting. When the counter reaches 99, all others have visited."
    ],
    solution: `<p>Appoint one prisoner as the <strong>counter</strong>. Rule for the other 99: the first time you enter and find the light OFF, turn it ON; once you've done that a single time, never touch the switch again. Rule for the counter: whenever you find the light ON, turn it OFF and add one to your tally; if it's already OFF, do nothing.</p>
      <p>Each non-counter contributes exactly one "on" event over their entire career, and only the counter ever clears it. So when the counter has switched the light off <strong>99 times</strong>, every one of the other 99 prisoners must have visited at least once — and the counter has too — so the counter safely declares all 100 have been in. (To handle an unknown initial "on" state, a standard variant has each non-counter turn it on <em>twice</em> and the counter count to a correspondingly higher threshold.)</p>`,
    probe: "Ask 'how do I turn one bit of shared memory and no clock into a reliable count?' — assign asymmetric roles so exactly one agent accumulates, and everyone else contributes exactly once.",
    lesson: "With minimal shared state and no synchronization, break symmetry by assigning roles (one counter, many contributors) and make each contribution idempotent (happens exactly once). This is the essence of distributed counting, token protocols, and concurrency primitives like semaphores."
  },

  {
    id: "secretary-problem",
    title: "The secretary problem (37% rule)",
    category: "Probability",
    difficulty: "Hard",
    prompt: `<p>You interview <code>n</code> candidates one at a time in random order. After each interview you must <em>immediately</em> either hire that candidate (and stop) or reject them forever. You can only rank a candidate relative to those you've already seen. What strategy maximizes the chance of hiring the single best candidate, and what is that probability for large <code>n</code>?</p>`,
    hints: [
      "There's a tension: reject too few and you commit early with little information; reject too many and the best candidate may already have passed.",
      "Consider a 'look, then leap' rule: automatically reject the first k candidates, then hire the next one who is better than all of those.",
      "The optimal k is about n/e (≈ 37% of the candidates), giving roughly a 1/e ≈ 37% chance of getting the very best."
    ],
    solution: `<p>Use the <strong>look-then-leap</strong> rule: reject the first <code>k</code> candidates outright (purely to calibrate), then hire the first later candidate who is better than everyone seen so far. This is optimized at <code>k ≈ n/e</code> — observe about the first <strong>37%</strong>, then leap. For large <code>n</code>, the strategy actually hires the single best candidate with probability about <code>1/e ≈ 37%</code>, remarkably independent of <code>n</code>. Rejecting fewer wastes information; rejecting more risks the best candidate having already appeared during the observation phase.</p>`,
    probe: "Ask 'how much should I sample purely to learn, before I start committing?' — there's an optimal exploration cutoff that trades calibration against the risk of the best option slipping past.",
    lesson: "Optimal-stopping problems have a characteristic explore-then-exploit structure, and the balance point is often a clean constant (here n/e). This 37% rule is the intuition behind exploration in reinforcement learning, online decisions, and A/B testing — you must spend some budget learning before you exploit."
  },

  {
    id: "water-jugs",
    title: "The water jugs",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You have a 3-liter jug and a 5-liter jug, neither with any markings, plus a water tap and a drain. Measure out exactly <strong>4 liters</strong>.</p>`,
    hints: [
      "Your only operations are: fill a jug, empty a jug, or pour one jug into the other until the source is empty or the destination is full. Track the state (jug3, jug5).",
      "The 5-liter jug can hold a useful remainder after you use it to top up the 3-liter jug.",
      "Get 2 liters sitting in the 3-liter jug first, then top it off from a full 5-liter jug — what's left in the 5 is your answer."
    ],
    solution: `<p>Fill the 5-liter jug. Pour it into the 3-liter jug until the 3 is full, leaving <strong>2 liters</strong> in the 5-liter jug. Empty the 3-liter jug, and pour those 2 liters into it. Now fill the 5-liter jug again and pour into the 3-liter jug (which already holds 2) until it's full — that takes exactly 1 liter, leaving exactly <strong>4 liters</strong> in the 5-liter jug.</p>`,
    probe: "Ask 'what intermediate amounts can I create by pouring one jug into the other until one is full or empty?' — the reachable amounts are integer combinations of 3 and 5.",
    lesson: "Jug problems are reachability over a state graph; the measurable amounts are the integer combinations 3m + 5n, and since gcd(3,5) = 1 you can reach every integer. Modeling a puzzle as states and asking what's reachable (BFS, number theory) is a general CS technique."
  },

  {
    id: "monty-hall",
    title: "The Monty Hall problem",
    category: "Probability",
    difficulty: "Medium",
    prompt: `<p>Three doors: one hides a car, two hide goats. You pick door 1. The host — who knows what's behind every door — opens door 3 to reveal a goat, then offers you the option to switch to door 2. Should you switch, and does it matter?</p>`,
    hints: [
      "Your first pick had a 1/3 chance of the car. Crucially, the host's action isn't random — he always reveals a goat, and never the car or your door.",
      "The probability that your original pick was right stays at 1/3; all the remaining probability has to go somewhere.",
      "Switching wins whenever your first guess was wrong — which is 2/3 of the time."
    ],
    solution: `<p><strong>Switch</strong> — it wins 2/3 of the time. Your initial pick is correct with probability 1/3 and wrong with probability 2/3. When you're wrong (2/3 of cases), the car is behind one of the other two doors, and the host — constrained to reveal a goat — is <em>forced</em> to open the one goat door, leaving the car behind exactly the door you'd switch to. So switching wins precisely when your first guess was wrong: 2/3. The host's knowledge is the key; his reveal transfers information rather than being random.</p>`,
    probe: "Ask 'is the host's action random, or constrained by knowledge?' — because he must reveal a goat, his choice concentrates probability onto the unopened door.",
    lesson: "Information from a knowledgeable, constrained actor updates probabilities in ways a random event wouldn't. Failing to condition on how the evidence was generated is a classic error that also corrupts data analysis and A/B tests — always model the data-generating process."
  },

  {
    id: "eight-balls",
    title: "Eight balls, one heavier, two weighings",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You have 8 identical-looking balls; exactly one is slightly heavier than the rest. Using a balance scale only <strong>twice</strong>, find the heavy ball.</p>`,
    hints: [
      "Two weighings give 3 × 3 = 9 possible outcomes, and 8 balls fit comfortably. Weighing 4 vs 4 first wastes information — why?",
      "A balance has three outcomes, so split into three groups, not two.",
      "Weigh 3 vs 3. The tilt (or a balance) narrows it to a group of 3 or 2, then one more weighing finds the ball."
    ],
    solution: `<p>Divide the balls into groups of 3, 3, and 2. <strong>Weigh 3 vs 3.</strong> If they balance, the heavy ball is among the remaining 2 — weigh those 1 vs 1 to find it. If one side sinks, take those 3 balls and weigh 1 vs 1: if one is heavier that's the ball, and if they balance it's the third. Two weighings always suffice, because each weighing has three outcomes and splitting into thirds extracts the most information per weighing.</p>`,
    probe: "Ask 'how many outcomes does one weighing give, and how do I split so each outcome is equally informative?' — thirds, not halves, for a three-outcome test.",
    lesson: "Match your partition to the branching factor of your test. A balance gives three outcomes, so divide into three near-equal groups (ternary search), not two. Aligning strategy with the information structure of each query is the general principle — the same one behind the twelve-coin puzzle."
  },

  {
    id: "camel-bananas",
    title: "The camel and the bananas",
    category: "Puzzles",
    difficulty: "Hard",
    prompt: `<p>A merchant has 3000 bananas and a camel that can carry at most 1000 bananas at a time. The market is 1000 km away. The camel eats 1 banana for every kilometer it walks, in either direction. What is the maximum number of bananas the merchant can get to the market?</p>`,
    hints: [
      "With 3000 bananas and a 1000 capacity, you need multiple trips to shuttle the stockpile forward — which costs extra bananas per kilometer while the pile is large.",
      "The per-km cost drops as the pile shrinks past multiples of 1000: with >2000 bananas you make 5 trips per km (cost 5), between 1000 and 2000 it's 3 per km, and below 1000 it's just 1 per km.",
      "Move the stockpile in stages, recomputing the cost at each threshold: advance until the pile drops to 2000, then to 1000, then make the final single run."
    ],
    solution: `<p><strong>533 bananas.</strong> Move the stockpile in cost stages:</p>
      <ul>
        <li>With 3000 bananas (>2000), each km forward costs 5 bananas (3 loads forward, 2 returns). Advance 200 km to drop from 3000 to 2000: cost <code>200 × 5 = 1000</code>.</li>
        <li>With 2000 bananas, each km costs 3 (2 forward, 1 return). Advance ~333 km to drop to ~1000: cost ~1000. You've now covered ≈ 533 km.</li>
        <li>With 1000 bananas, it's a single trip costing 1 per km. The remaining distance is <code>1000 − 533 = 467</code> km; carry the 1000 and eat 467, arriving with <code>1000 − 467 = 533</code>.</li>
      </ul>`,
    probe: "Ask 'does the cost per km depend on how many bananas I currently have?' — it does (a bigger pile needs more trips), so break the journey at the thresholds where the cost drops and optimize each stage separately.",
    lesson: "When the marginal cost of an action changes with your state, break the process at the thresholds where the cost changes and optimize piecewise. Recognizing state-dependent marginal cost — rather than assuming it's constant — is key in logistics, scheduling, and dynamic programming."
  },

  {
    id: "fair-from-biased",
    title: "A fair coin from a biased one",
    category: "Probability",
    difficulty: "Medium",
    prompt: `<p>You have a biased coin that lands heads with some unknown probability <code>p</code> (with <code>0 &lt; p &lt; 1</code>). Using only this coin, produce a perfectly fair 50/50 decision.</p>`,
    hints: [
      "A single flip is biased, but consider flipping in pairs and looking at the order of results.",
      "The sequences HT and TH each involve one head and one tail. What are their probabilities, in terms of p?",
      "P(HT) = p(1−p) and P(TH) = (1−p)p — exactly equal! So: flip twice; call HT 'heads' and TH 'tails'; on HH or TT, discard and repeat."
    ],
    solution: `<p>Flip the coin twice. If you get <strong>HT</strong>, output "heads"; if <strong>TH</strong>, output "tails"; if you get HH or TT, discard the result and repeat. Since <code>P(HT) = p(1−p) = P(TH)</code> for any bias, the two accepted outcomes are exactly equally likely — giving a perfectly fair result regardless of the unknown <code>p</code> (as long as it's strictly between 0 and 1). You simply throw away the symmetric tie cases. This is the von Neumann trick.</p>`,
    probe: "Ask 'which events have equal probability regardless of the bias?' — the two orderings of a mixed pair are symmetric, so condition on exactly those.",
    lesson: "To remove an unknown bias, find events whose probabilities are provably equal by symmetry, and condition on them (rejecting the rest). This symmetry-and-rejection idea is foundational in randomized algorithms and unbiased sampling."
  },

  {
    id: "uniform-seven-from-five",
    title: "Uniform 1–7 from a 5-sided die",
    category: "Algorithms",
    difficulty: "Medium",
    prompt: `<p>You have a fair 5-sided die (uniform on 1–5) and nothing else random. Produce a uniform random integer from <strong>1 to 7</strong>.</p>`,
    hints: [
      "7 doesn't divide any power of 5, so you can't partition a single roll (or any number of rolls) evenly into 7. You'll need to combine rolls and discard some outcomes.",
      "Two rolls give 25 equally likely outcomes. 25 isn't a multiple of 7 — but 21 is.",
      "Map two rolls to a number in 1–25. If it's 1–21, reduce mod 7 to get a uniform 1–7; if it's 22–25, reject and re-roll."
    ],
    solution: `<p>Roll twice to build a number in 1–25: compute <code>5 × (first − 1) + second</code>. If the result is in <strong>1–21</strong>, output <code>((value − 1) mod 7) + 1</code> — since <code>21 = 3 × 7</code>, each of 1–7 receives exactly three of the 21 values, perfectly uniform. If the result is <strong>22–25</strong>, reject it and start over. This rejection sampling yields an exactly uniform 1–7 with a small, finite expected number of rolls.</p>`,
    probe: "Ask 'can I build a uniform space large enough to contain a clean multiple of 7, then discard the excess?' — combine rolls for range, reject the remainder to stay exactly uniform.",
    lesson: "Rejection sampling converts one uniform distribution into another exactly: expand to a large equiprobable space, keep the portion that's a clean multiple of your target, and discard the rest. Insisting on exactness rather than approximating is the disciplined approach used throughout Monte Carlo methods."
  },

  {
    id: "nim-game",
    title: "The game of Nim",
    category: "Game Theory",
    difficulty: "Hard",
    prompt: `<p>Two players alternate turns. On each turn a player removes any positive number of stones from a single pile of their choice. Whoever takes the last stone wins. Given piles of sizes 3, 4, and 5, does the first player have a guaranteed win — and what's the general winning principle?</p>`,
    hints: [
      "Analyze small positions and look for a single number computed from the whole position that predicts who wins, rather than reasoning move-by-move.",
      "Consider the bitwise XOR of the pile sizes (the 'nim-sum').",
      "A position is losing for the player to move exactly when the nim-sum is 0; otherwise the mover can always move to make it 0."
    ],
    solution: `<p>Compute the <strong>nim-sum</strong>: the bitwise XOR of all pile sizes. Here <code>3 XOR 4 XOR 5 = 2</code>, which is nonzero, so the <strong>first player wins</strong>. The winning strategy is to always move so the nim-sum becomes 0. From any position with nonzero nim-sum, such a move exists; from a zero-nim-sum position, every move makes it nonzero, handing the opponent a winning move. Since the terminal empty position has nim-sum 0, the player who keeps restoring 0 forces the opponent into it and takes the last stone.</p>`,
    probe: "Ask 'is there an invariant — a number computed from the whole position — that a good move can always reset to a special value, and that the losing player can never maintain?' The XOR nim-sum is exactly that.",
    lesson: "Many combinatorial games are solved by an invariant characterizing winning versus losing positions (the Sprague–Grundy theory generalizes this). Finding a quantity you can always control while your opponent can't is the deep pattern, echoing invariants throughout algorithms."
  },

  {
    id: "clock-hands-overlap",
    title: "How often do clock hands overlap?",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>In a 12-hour period, how many times do the hour hand and the minute hand of a clock <em>exactly overlap</em>? The intuitive answer of 12 (once per hour) is wrong.</p>`,
    hints: [
      "The minute hand laps the hour hand repeatedly, but the hour hand is also moving. Work in terms of relative speed: how fast does the minute hand gain on the hour hand?",
      "The minute hand moves 360°/hr, the hour hand 30°/hr, so the minute hand gains 330°/hr. An overlap happens each time it gains a full 360°.",
      "That's one overlap every 360/330 = 12/11 hours ≈ 65.45 minutes — so 11 overlaps in 12 hours, not 12."
    ],
    solution: `<p><strong>11 times</strong> in 12 hours (so 22 times per day). The minute hand gains on the hour hand at <code>360 − 30 = 330</code> degrees per hour, so it laps the hour hand once every <code>360/330 = 12/11</code> hours ≈ 65.45 minutes — not every 60. Over 12 hours that's <code>12 ÷ (12/11) = 11</code> overlaps. Intuitively, between 11:00 and 1:00 there is only one overlap (at 12:00), which is exactly why the count is 11 and not 12.</p>`,
    probe: "Ask 'what's the relative speed of the two hands, and how often does that close a full 360°?' — reasoning in the relative frame avoids the off-by-one 'once per hour' trap.",
    lesson: "For two things moving at different constant rates, work in the relative frame — the gap closes at the difference of their speeds. This reframing (also used in the linked-list cycle problem) turns messy per-step reasoning into one clean division and prevents fencepost errors."
  },

  {
    id: "pcr-exponential",
    title: "Why PCR is exponential",
    category: "Biology",
    difficulty: "Easy",
    prompt: `<p>PCR (the polymerase chain reaction) copies a target DNA segment through repeated cycles, each of which <em>doubles</em> the number of copies. Starting from a single molecule, roughly how many copies exist after 30 cycles — and why does this make PCR the workhorse of molecular biology?</p>`,
    hints: [
      "Each cycle doubles the count: 1 → 2 → 4 → 8 → …. What function is that?",
      "After n cycles you have 2ⁿ copies. What is 2³⁰, roughly?",
      "2³⁰ ≈ a billion — so a trace of DNA becomes enough to detect, sequence, or clone."
    ],
    solution: `<p>After 30 cycles you have about <code>2³⁰ ≈ 1.07 billion</code> copies from a single starting molecule. Each cycle denatures the DNA, anneals primers, and extends them — doubling the target region. This exponential amplification is why PCR is foundational: it turns a trace amount of DNA (a drop of blood, a single cell, ancient remains) into enough material to detect, sequence, or clone. It's the same doubling logic as the bacteria-in-a-jar problem — negligible for many cycles, then explosively large.</p>`,
    probe: "Ask 'is this additive or multiplicative growth per cycle?' — recognizing the doubling immediately gives 2ⁿ and explains the technique's power.",
    lesson: "Exponential amplification makes trace signals detectable — the multiplicative-growth intuition (2ⁿ) explains PCR, chain reactions, and viral load. Spotting doubling and reaching for powers of two is faster and more revealing than arithmetic."
  },

  {
    id: "genetic-code-redundancy",
    title: "Why the genetic code is redundant",
    category: "Biology",
    difficulty: "Medium",
    prompt: `<p>There are 64 possible codons (4³ triplets of DNA bases) but only 20 amino acids (plus a stop signal), so multiple codons encode the same amino acid — the code is "degenerate." Is this redundancy just wasteful duplication, or does it serve a purpose?</p>`,
    hints: [
      "Think about what happens when a single DNA base mutates. Does every such mutation change the resulting protein?",
      "Synonymous codons often differ only in the third base — so many single-base changes are 'silent' and don't change the amino acid at all.",
      "The redundancy buffers mutations and translation errors: the code is error-tolerant by design."
    ],
    solution: `<p>The redundancy is a <strong>robustness feature</strong>, not waste. Codons for the same amino acid typically differ in the third position, so a large fraction of single-base mutations are <em>synonymous</em> — they don't change the encoded amino acid (silent mutations). Even many non-synonymous changes swap in a chemically similar amino acid, because similar codons tend to map to similar amino acids. The result is a code that buffers against mutation and translation error: random point mutations frequently have little or no effect on protein function. Redundancy provides error tolerance.</p>`,
    probe: "Ask 'what happens to the output when a single input symbol is corrupted?' — framing it as robustness to point mutations reveals the redundancy as built-in error tolerance.",
    lesson: "Redundancy in an encoding is often deliberate error tolerance, not inefficiency — extra symbols absorb noise. This is exactly the principle of error-correcting codes in CS; the genetic code is a biological one. Asking 'how does this system behave under corruption?' reveals design rationale across biology and engineering."
  },

  {
    id: "multi-armed-bandit",
    title: "The explore–exploit trade-off",
    category: "ML / AI",
    difficulty: "Medium",
    prompt: `<p>You face several slot machines ("arms"), each paying out with an unknown probability. You have a fixed number of pulls and want to maximize total reward. Always pulling the arm that looks best so far can trap you on a lucky early winner; always trying new arms wastes pulls on known-bad ones. How should you think about this trade-off?</p>`,
    hints: [
      "Name the tension explicitly: exploiting your current best estimate versus exploring to improve your estimates.",
      "An arm that looks bad after only a few pulls might just be unlucky. Your uncertainty about an arm — not only its estimated mean — should drive whether you try it.",
      "Strategies like ε-greedy, UCB (optimism under uncertainty), and Thompson sampling all explore more when uncertain and exploit more as estimates sharpen."
    ],
    solution: `<p>This is the <strong>exploration–exploitation trade-off</strong>. Pure exploitation (always pull the current best) can lock onto an arm that got lucky early and never discover a genuinely better one; pure exploration wastes pulls on arms you already know are poor. Good strategies use <em>uncertainty</em>: ε-greedy explores at random a small fraction of the time; UCB adds an optimism bonus to arms you're unsure about, pulling whatever has the highest plausible upside; Thompson sampling draws from each arm's posterior and picks the sampled best. All of them shift from exploring (early, high uncertainty) toward exploiting (later, sharp estimates) — the same explore-then-exploit intuition as the secretary problem.</p>`,
    probe: "Ask 'am I choosing based only on the current best estimate, or also on how uncertain that estimate is?' — uncertainty should pull you toward exploring options you haven't ruled out.",
    lesson: "Decision-making under uncertainty must value information, not just current expected reward — optimism-under-uncertainty makes exploration a principled choice. This underlies reinforcement learning, A/B testing, recommendation systems, and even how to allocate your own research effort."
  },

  {
    id: "sorting-lower-bound",
    title: "Why comparison sorting can't beat n log n",
    category: "Algorithms",
    difficulty: "Hard",
    prompt: `<p>No comparison-based sorting algorithm can sort <code>n</code> items in fewer than about <code>n log n</code> comparisons in the worst case, no matter how cleverly it's designed. Why is this a hard limit rather than just a lack of ingenuity?</p>`,
    hints: [
      "A correct sort must be able to output any of the n! possible orderings of the input. Each comparison has just two outcomes.",
      "Model the algorithm as a binary decision tree: each internal node is a comparison (two branches), each leaf is a final output permutation.",
      "A binary tree that distinguishes n! outcomes must have height at least log₂(n!), and log₂(n!) ≈ n log n."
    ],
    solution: `<p>Model any comparison sort as a <strong>binary decision tree</strong>: each internal node is a comparison with two outcomes, and each leaf is one possible output permutation. To sort every input correctly, the tree must have at least <code>n!</code> leaves — one for each possible ordering. A binary tree with <code>n!</code> leaves has height at least <code>log₂(n!)</code>, and by Stirling's approximation <code>log₂(n!) ≈ n log₂ n</code>. The height is the worst-case number of comparisons, so every comparison sort needs <code>Ω(n log n)</code> comparisons. (Non-comparison sorts like counting or radix sort beat this only by using operations other than comparisons.)</p>`,
    probe: "Ask 'how many distinct outputs must the algorithm be able to produce, and how much can a single comparison narrow them down?' — counting outcomes gives the bound directly.",
    lesson: "Lower bounds come from counting: if you must distinguish N outcomes and each step yields b bits, you need at least log_b N steps. This information-theoretic argument (the same one behind the coin-weighing and poisoned-wine puzzles) proves limits that no cleverness can beat."
  },

  {
    id: "vanishing-gradients",
    title: "Why RNNs forget, and how attention fixes it",
    category: "ML / AI",
    difficulty: "Hard",
    prompt: `<p>Plain recurrent neural networks (RNNs) struggle to learn dependencies between distant elements of a sequence — for instance, linking a word to another one 50 steps earlier. Why does this happen, and what's the core idea behind the fixes (LSTMs, and later attention)?</p>`,
    hints: [
      "Training unrolls the network over time and backpropagates gradients as a product across every time step. What happens to a product of many factors each less than 1 (or greater than 1)?",
      "Gradients shrink exponentially (vanish) or blow up (explode) with sequence length, so distant dependencies get essentially no learning signal.",
      "The fixes create a more direct path for gradient and information across time: gated cells (LSTM/GRU) with an additive memory, or attention that directly connects any two positions."
    ],
    solution: `<p>Backpropagation through an unrolled RNN multiplies gradients across all time steps. Repeatedly multiplying by the recurrent weight/Jacobian makes the gradient shrink toward zero (vanish) or grow without bound (explode) <em>exponentially</em> in sequence length — so the network can't learn long-range dependencies. <strong>LSTMs and GRUs</strong> fix this with a gated cell state that carries information forward <em>additively</em> (the same trick as residual connections), keeping gradients healthy over many steps. <strong>Transformers</strong> go further: self-attention connects any two positions with a direct, constant-length path, removing the sequential multiplication entirely — which is also why they parallelize and scale so well.</p>`,
    probe: "Ask 'what happens to a gradient that must pass through many multiplicative steps?' — recognizing the repeated multiplication explains the failure and points to 'give it an additive or direct path' as the fix.",
    lesson: "Long multiplicative chains destroy gradients; the cure is a direct or additive path — gates, residuals, attention. This one idea connects RNNs, LSTMs, and why transformers won. When learning fails across depth or time, suspect the gradient's path (see also the residual-connections problem)."
  },

  {
    id: "st-petersburg",
    title: "The St. Petersburg paradox",
    category: "Probability",
    difficulty: "Hard",
    prompt: `<p>Here's a game: a fair coin is flipped until it lands tails. If the first tails is on flip <code>n</code>, you win <code>$2ⁿ</code>. The expected payout is <code>½·2 + ¼·4 + ⅛·8 + … = 1 + 1 + 1 + … = ∞</code>. So a rational person should pay any finite amount to play — yet almost nobody would pay more than a few dollars. Are they being irrational?</p>`,
    hints: [
      "The expected monetary value is infinite, but the probability of a large payout is tiny. Is raw expected value even the right thing to maximize?",
      "Consider expected utility — the value of money to you — rather than raw dollars. The utility of wealth has diminishing returns (it's concave).",
      "Under diminishing marginal utility (e.g. logarithmic), the expected utility of this game is finite and small, matching people's actual willingness to pay."
    ],
    solution: `<p>People are not being irrational — the resolution (due to Bernoulli) is that rational agents maximize expected <strong>utility</strong>, not expected dollars, and the utility of money is <em>concave</em>: each additional dollar is worth less than the last. With, say, logarithmic utility, the sum <code>½·log 2 + ¼·log 4 + …</code> converges to a finite, modest value, so a rational person pays only a small amount. The infinite expected value comes from vanishingly unlikely astronomical payoffs that contribute almost nothing in utility. Raw expected value ignored both diminishing returns and risk.</p>`,
    probe: "Ask 'is expected monetary value even the right objective, or should I weight outcomes by their actual value to me?' — switching to expected utility dissolves the paradox.",
    lesson: "Expected value can mislead when outcomes span extreme magnitudes with diminishing importance — maximize expected utility and account for risk instead. This distinction underpins economics, decision theory, and reward design in reinforcement learning (why we sometimes reshape or clip rewards)."
  },

  {
    id: "rats-injections",
    title: "240 injections, 5 rats, 48 hours",
    category: "Puzzles",
    difficulty: "Hard",
    prompt: `<p>A lab has 240 injections; exactly one contains an anaesthetic. You have 5 rats and 48 hours. If a rat receives the anaesthetic it faints within 24 hours and can't be reused; a rat can be given several injections (at different times) until it faints. How do you find the anaesthetic injection within 48 hours?</p>`,
    hints: [
      "You have two time windows (day 1 and day 2) and 5 rats. Each rat's fate after 48 hours isn't just alive/dead — it can faint on day 1, faint on day 2, or never faint. That's three outcomes per rat.",
      "This is the poisoned-wine puzzle with a twist: each rat is now a base-3 digit, not a bit, because time gives a third state. How many injections can 5 base-3 digits label?",
      "Number each injection with a 5-digit base-3 code. Digit for rat i: 0 = never inject, 1 = inject on day 1, 2 = inject on day 2. Read each rat's fainting time back as its digit."
    ],
    solution: `<p>Give each injection a unique <strong>5-digit base-3 code</strong> (digits 0, 1, 2). Rat <code>i</code> corresponds to digit position <code>i</code>: a <strong>0</strong> means never give that injection to rat <code>i</code>, a <strong>1</strong> means give it on day 1, a <strong>2</strong> means give it on day 2 (after 24 h).</p>
      <p>After 48 hours read each rat: fainted in the first 24 h → its digit was 1; fainted in the second 24 h → digit 2; never fainted → digit 0. The five digits spell the base-3 code of the anaesthetic injection. Capacity: <code>3⁵ = 243 ≥ 240</code>, so 5 rats suffice. (The binary poisoned-wine puzzle used 2 states per tester; adding a second day gives a <em>third</em> state, so you count in base 3 instead of base 2.)</p>`,
    probe: "Ask 'how many distinguishable outcomes can each tester produce?' — here time turns each rat from a 2-state bit into a 3-state (base-3) digit, so 5 rats encode 3⁵ possibilities.",
    lesson: "The information capacity of a test is the number of distinguishable outcomes it can produce, and you can often manufacture extra outcomes (here, timing) to raise the base. k testers with b outcomes each identify one item among bᵏ. This base-b encoding generalizes the binary trick behind [[poisoned-wine]] and error-correcting codes."
  },

  {
    id: "counterfeit-coin-stacks",
    title: "Ten stacks, one counterfeit, one weighing",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You have 10 stacks of coins. Every genuine coin weighs 10 grams, but one entire stack is counterfeit — each of its coins weighs 11 grams. You have a <em>digital scale</em> (it reads exact weight, not just balance) that you may use exactly <strong>once</strong>. Identify the counterfeit stack.</p>`,
    hints: [
      "One weighing on a digital scale gives you a whole number, not just a comparison. How can you make that number encode which stack is fake?",
      "Take a different, known quantity of coins from each stack so each stack contributes a distinguishable amount to the total excess weight.",
      "Take 1 coin from stack 1, 2 from stack 2, …, 10 from stack 10. The grams over the expected total tell you the stack number directly."
    ],
    solution: `<p>Take 1 coin from stack 1, 2 coins from stack 2, 3 from stack 3, …, 10 from stack 10 — that's <code>1+2+…+10 = 55</code> coins. If all were genuine they'd weigh <code>550 g</code>. Weigh the pile once. The excess over 550 g tells you the counterfeit stack: if stack <code>k</code> is fake, exactly <code>k</code> of the coins are 1 g too heavy, so the scale reads <code>550 + k</code>. An excess of 3 g means stack 3, and so on.</p>`,
    probe: "Ask 'what does a single exact-number reading let me encode that a yes/no comparison can't?' — give each stack a unique weight-contribution so the total's excess names the culprit.",
    lesson: "A measurement that returns a rich value (a real number) can encode far more than a binary comparison — assign each source a distinct 'signature' so one reading disentangles them. This positional-encoding idea powers checksums, and superimposed/combinatorial group testing."
  },

  {
    id: "prisoners-hats-line",
    title: "100 hats in a line",
    category: "Logic",
    difficulty: "Hard",
    prompt: `<p>100 prisoners stand in a line. Each wears a red or blue hat and can see the hats of everyone <em>in front</em> of them but not their own or those behind. Starting from the back, each prisoner in turn calls out a single color, heard by all. Every correct call is a life saved. They may agree on a strategy beforehand. How many can they <strong>guarantee</strong> to save?</p>`,
    hints: [
      "The back prisoner sees the most hats but gets no information about their own. Could they sacrifice their guess to transmit information to everyone else?",
      "One bit — even/odd — can summarize all the hats a prisoner sees. What if the back prisoner announces the parity of the red hats in front of them?",
      "The back prisoner calls the parity of red hats they see (a 50/50 gamble for themselves). Each subsequent prisoner tracks the parity and, using the calls they've heard plus the hats they see, deduces their own hat exactly."
    ],
    solution: `<p>They can guarantee <strong>99</strong> saved (and the 100th has a 50% chance). Strategy: the back prisoner counts the red hats they can see and calls "red" if that count is odd, "blue" if even — encoding the parity of all 99 hats ahead. This call has only a 50/50 chance of matching their own hat, so they're the one gamble.</p>
      <p>Now every other prisoner can deduce their own hat with certainty. The 99th prisoner sees the 98 hats ahead and knows the announced parity, so the parity of (their own hat + the hats ahead) must match — they solve for their own hat. As each prisoner ahead calls out their (correct) color, everyone updates the running parity, so each in turn can subtract off what they see and hear to determine their own hat exactly.</p>`,
    probe: "Ask 'can one prisoner spend their own guess to broadcast a summary (parity) that lets everyone else deduce their answer?' — sacrifice one to inform the ninety-nine.",
    lesson: "A single parity bit can carry global information that, combined with local observations, lets many agents each recover a private unknown. Sacrificing one degree of freedom to transmit a checksum is the core idea behind parity bits, error detection, and many distributed protocols."
  },

  {
    id: "three-way-duel",
    title: "The three-way duel",
    category: "Game Theory",
    difficulty: "Hard",
    prompt: `<p>Three gunfighters duel. Abe hits his target 1/3 of the time, Bob 2/3 of the time, and Carl never misses. They take turns firing one shot, in order of <em>worst shooter first</em> (Abe, then Bob, then Carl), repeating until one remains. Each plays optimally to maximize their own survival. What should Abe do on his first shot?</p>`,
    hints: [
      "Consider Abe's options: shoot Bob, shoot Carl, or deliberately miss. Play out what happens after each — especially who then wants to shoot whom.",
      "If Abe kills someone, the survivor is the more dangerous shooter, and it becomes their turn to shoot Abe. Being the one who 'thins the herd' can backfire.",
      "Abe should intentionally miss (shoot into the air). Then Bob and Carl, the two strong shooters, target each other first — and Abe gets the next shot at whoever survives."
    ],
    solution: `<p>Abe should <strong>deliberately miss</strong> — fire into the air. Reason through the alternatives: if Abe shoots and kills Carl, then Bob (2/3) shoots at Abe; if Abe kills Bob, then Carl (perfect) kills Abe for sure. Either way, by eliminating one rival Abe hands the surviving strong shooter a free shot at him.</p>
      <p>By missing on purpose, Abe forces Bob and Carl to deal with each other: on Bob's turn he'll shoot at Carl (his biggest threat), and Carl shoots at Bob. Whoever survives that exchange, Abe then gets the next shot at a single opponent — a far better position than provoking a strong shooter while two rivals still stand. Counter-intuitively, the weakest player's best move is to not participate.</p>`,
    probe: "Ask 'if I succeed at the obvious move, who benefits and whose turn is it next?' — sometimes acting makes you the next target, and the optimal move is to do nothing.",
    lesson: "Optimal play isn't always aggressive — improving your position can worsen your standing if it strengthens or empowers an opponent. Reasoning about who becomes the target next (and letting rivals weaken each other) is central to game theory, competitive strategy, and even coalition dynamics."
  },

  {
    id: "two-hourglasses",
    title: "Two hourglasses, nine minutes",
    category: "Puzzles",
    difficulty: "Medium",
    prompt: `<p>You have a 4-minute hourglass and a 7-minute hourglass, and no other timer. Measure out exactly <strong>9 minutes</strong>.</p>`,
    hints: [
      "Start both at once and track the events (when each runs out). Flipping a glass reverses whatever sand has accumulated, which lets you measure leftover amounts.",
      "9 = 7 + 2. Can you isolate a 2-minute interval to add after the 7-minute glass finishes?",
      "When the 7-min glass empties, the 4-min glass has 1 min of sand left; use the running glasses so that a 1-minute remainder can be flipped into another minute."
    ],
    solution: `<p>Start both hourglasses together at <code>t = 0</code>.</p>
      <ul>
        <li><code>t = 4</code>: the 4-min glass empties — flip it immediately.</li>
        <li><code>t = 7</code>: the 7-min glass empties. The 4-min glass (running since t=4) has 1 minute of sand left in the top.</li>
        <li><code>t = 8</code>: the 4-min glass empties (that last minute ran out). The 7-min glass has now been idle-or-running... — flip the 7-min glass at t=7 when it empties, so by t=8 it holds 1 minute of sand in the bottom. Flip it again at t=8, and that 1 minute runs out at <code>t = 9</code>.</li>
      </ul>
      <p>So: at t=7 flip the 7-min glass; at t=8 (when the 4-min glass empties) flip the 7-min glass once more — it has exactly 1 minute of sand to run, finishing at <strong>t = 9</strong>.</p>`,
    probe: "Ask 'what leftover amounts do the running glasses expose, and can flipping turn a remainder into the exact extra interval I need?' — the 1-minute remainder is the key resource.",
    lesson: "Combine and re-use partial states rather than measuring each interval from scratch — flipping an hourglass converts elapsed time into remaining time, letting you synthesize values (like 9 = 7 + 2) neither glass measures directly. Composing operations on intermediate state is a recurring problem-solving move."
  },

  {
    id: "secure-average",
    title: "Average salary, no one reveals theirs",
    category: "Algorithms",
    difficulty: "Medium",
    prompt: `<p>A group of coworkers want to know their <em>average</em> salary, but nobody is willing to reveal their own salary to anyone else (and there's no trusted third party). How can they compute the true average so that no participant learns anything about any individual's salary?</p>`,
    hints: [
      "If they just summed openly, each person's number would be exposed. Can the first person hide their real value behind something only they know?",
      "Have the first person add a secret random number to their salary before passing a running total around the circle.",
      "Person 1 secretly picks a large random R, adds their salary, and passes the sum on; each person adds their salary and passes it along; person 1 subtracts R at the end and divides by n."
    ],
    solution: `<p>Person 1 secretly picks a large random number <code>R</code>, adds their own salary, and privately passes the total to person 2. Each subsequent person adds their own salary to the running total and passes it on, around the full circle back to person 1. Person 1 then subtracts <code>R</code> from the final total (recovering the true sum of all salaries) and divides by <code>n</code> to get the average, which they announce.</p>
      <p>No one learns any individual salary: every number passed is masked by the unknown <code>R</code> plus a mix of others' salaries, so an intermediate total reveals nothing about any single person. Only aggregate information (the average) is disclosed.</p>`,
    probe: "Ask 'can I mask each private value with a secret that cancels out in the final aggregate?' — a random offset hides individuals while leaving the sum recoverable by its creator.",
    lesson: "You can compute an aggregate over private data without exposing the inputs by masking each with randomness that cancels in the result — the founding idea of secure multiparty computation and secret sharing. It underlies privacy-preserving analytics and federated learning."
  },

  {
    id: "airplane-seats",
    title: "The lost boarding pass",
    category: "Probability",
    difficulty: "Hard",
    prompt: `<p>100 passengers board a full flight (100 seats, one assigned per passenger). The first passenger lost their boarding pass and sits in a <em>random</em> seat. Each later passenger sits in their own assigned seat if it's free, otherwise picks a random free seat. What is the probability that the <strong>100th</strong> passenger ends up in their own assigned seat?</p>`,
    hints: [
      "Don't try to track all 100 boardings — look for a symmetry between just two special seats.",
      "The only seats whose fate matters are passenger 1's seat and passenger 100's seat. The chaos ends the moment one of those two is taken.",
      "By symmetry, the first time someone must sit in one of those two seats, each is equally likely to be the one taken. So the answer is exactly 1/2."
    ],
    solution: `<p>The probability is exactly <strong>1/2</strong>, regardless of the number of passengers. The key: the only two seats that ultimately matter are <em>passenger 1's seat</em> and <em>passenger 100's seat</em>. Every displaced passenger either sits in their own seat (postponing the resolution) or randomly grabs one of these two special seats, which ends the process.</p>
      <p>Whenever someone is forced to choose randomly and picks one of the two special seats, seat 1 and seat 100 are equally likely to be the one chosen (perfect symmetry — nothing distinguishes them). If seat 1 gets taken first, everyone including passenger 100 ends up correctly seated; if seat 100 is taken first, passenger 100 is displaced. Equal odds → <code>1/2</code>.</p>`,
    probe: "Ask 'which few outcomes actually decide the answer, and are they symmetric?' — ignore the 98 irrelevant seats and notice seats 1 and 100 are interchangeable, forcing a 1/2 split.",
    lesson: "Collapse a complex process to the small set of events that actually determine the outcome, then exploit symmetry between them. Recognizing that most of the apparent complexity is irrelevant 'postponement' is a powerful simplification, echoing the [[ants-on-a-stick]] relabeling trick."
  },

  {
    id: "russian-roulette",
    title: "Spin, or pull again?",
    category: "Probability",
    difficulty: "Medium",
    prompt: `<p>A revolver has 6 chambers with two bullets loaded in <em>adjacent</em> chambers; the rest are empty. The cylinder is spun once, the trigger pulled — <em>click</em>, an empty chamber. You must face one more trigger pull. Are you safer if the cylinder is <strong>spun again</strong> first, or if the trigger is simply <strong>pulled again</strong> without spinning?</p>`,
    hints: [
      "Spinning re-randomizes: probability of a bullet is just 2/6 = 1/3. Compare that to pulling the next chamber in sequence, given the first was empty.",
      "Label the chambers 1–6 with bullets in chambers 1 and 2. The first pull was empty, so you were on one of the four empty chambers (3, 4, 5, 6) — each equally likely. What comes next in each case?",
      "From 3→4 (empty), 4→5 (empty), 5→6 (empty), 6→1 (bullet). So only 1 of the 4 equally likely empty starts leads to a bullet next: 1/4 < 1/3."
    ],
    solution: `<p><strong>Don't spin — pull again.</strong> If you spin, the bullet probability resets to <code>2/6 = 1/3</code>. If you don't spin, condition on the fact that the first pull was empty. Label the chambers 1–6 with bullets in 1 and 2; the empty chambers are 3, 4, 5, 6, and the first empty pull leaves you equally likely to have been on any of them. The <em>next</em> chamber is: 3→4 (empty), 4→5 (empty), 5→6 (empty), 6→1 (bullet). Only 1 of those 4 equally likely cases fires, so the probability of a bullet is <code>1/4</code>. Since <code>1/4 &lt; 1/3</code>, pulling again is safer.</p>`,
    probe: "Ask 'does the earlier outcome give me information I'd be throwing away by re-randomizing?' — the empty first pull rules out chambers and shifts the odds; spinning discards that evidence.",
    lesson: "Because the bullets are adjacent, an empty pull is informative — it makes the next chamber more likely to also be empty. Conditioning on observed evidence (rather than resetting to the prior) is the heart of Bayesian updating; re-randomizing throws away hard-won information."
  }
];
