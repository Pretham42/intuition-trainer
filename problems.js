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
  }
];
