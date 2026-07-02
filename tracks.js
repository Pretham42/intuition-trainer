/*
 * Intuition Trainer — Discovery Tracks.
 *
 * A track is a guided sequence of small problems that lead you to REDISCOVER a
 * concept yourself, one question at a time. You never get the formula handed to
 * you; each step you derive the next piece, and the "discovered" line names the
 * insight you just uncovered. The synthesis at the end shows you that the thing
 * you built, step by step, is the real concept.
 *
 * To add a track, append an object to TRACKS with:
 *   id, title, category, difficulty, blurb  — summary card
 *   intro       HTML shown before step 1
 *   steps[]     each: { title, prompt(HTML), diagram?(SVG), hint?(string),
 *                       reveal(HTML), discovered(string) }
 *   synthesis   HTML shown after the final step ("here's what you rebuilt")
 *   connects    optional HTML: how it links to other topics/problems
 */

const TRACKS = [
  {
    id: "backprop",
    title: "Rediscovering Backpropagation",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Build the algorithm that trains every neural network — from the chain rule up — without being handed a single formula.",
    intro: `<p>You're going to rebuild backpropagation from nothing. No formulas will be handed to you; each step asks a question, and your answer becomes the next piece. By the end you'll see that backprop is "just" the chain rule plus one clever bookkeeping trick — and you'll never have to memorize it, because you'll have derived it.</p>
      <p>Work each step honestly before revealing. Try the numbers with pen and paper.</p>`,
    steps: [
      {
        title: "A nudge travels through a chain",
        prompt: `<p>Let <code>y = 3x</code> and <code>z = y²</code>. If you increase <code>x</code> by a tiny amount, how much does <code>z</code> change per unit of <code>x</code>? In other words, what is <code>dz/dx</code>? Reason it out physically: a small nudge <code>Δx</code> changes <code>y</code> by how much, and that change in <code>y</code> changes <code>z</code> by how much?</p>`,
        hint: "Find how sensitive z is to y, and how sensitive y is to x, then combine them.",
        reveal: `<p><code>z</code> depends on <code>y</code> with rate <code>dz/dy = 2y</code>, and <code>y</code> depends on <code>x</code> with rate <code>dy/dx = 3</code>. A nudge in <code>x</code> becomes a nudge <code>3·Δx</code> in <code>y</code>, which becomes a nudge <code>2y·(3Δx)</code> in <code>z</code>. So <code>dz/dx = 2y · 3 = 6y = 18x</code>. The nudge propagates by <strong>multiplying the local rates</strong> along the chain.</p>`,
        discovered: "The effect of x on z is the product of the local rates of change along the path. That product rule is the chain rule — and it's literally 'how a nudge propagates through composed operations.'"
      },
      {
        title: "One neuron, one weight",
        prompt: `<p>A neuron computes a prediction <code>ŷ = w·x</code> (no activation yet), and we measure error with the loss <code>L = (ŷ − y)²</code>. How much does the loss change if you nudge the weight <code>w</code>? Derive <code>dL/dw</code> symbolically, then plug in <code>x = 2</code>, <code>y = 3</code>, <code>w = 0.5</code> to get a number.</p>`,
        hint: "Chain it: how does L depend on ŷ, and how does ŷ depend on w?",
        reveal: `<p><code>dL/dŷ = 2(ŷ − y)</code> and <code>dŷ/dw = x</code>, so <code>dL/dw = 2(ŷ − y)·x</code>. With <code>w = 0.5, x = 2</code>: <code>ŷ = 1.0</code>, error <code>ŷ − y = 1 − 3 = −2</code>, so <code>dL/dw = 2(−2)(2) = −8</code>. The gradient is negative, meaning <em>increasing</em> <code>w</code> lowers the loss — which makes sense, since <code>ŷ = 1</code> is below the target <code>3</code>.</p>`,
        discovered: "The gradient of the loss with respect to a weight is a product of local derivatives chained from the loss back to that weight. Gradient descent then just steps w in the opposite direction of this gradient."
      },
      {
        title: "Insert a nonlinearity",
        prompt: `<p>Now the neuron applies an activation: <code>ŷ = σ(z)</code> where <code>z = w·x</code> and <code>σ</code> is some nonlinearity with derivative <code>σ'</code>. What is <code>dL/dw</code> now? You're just adding one more link to the chain — where does <code>σ'</code> appear?</p>`,
        hint: "The path is now w → z → ŷ → L. Multiply the local derivative of each hop.",
        reveal: `<p>The path is <code>w → z → ŷ → L</code>, so multiply the local derivative of each hop: <code>dL/dw = dL/dŷ · dŷ/dz · dz/dw = 2(ŷ − y) · σ'(z) · x</code>. Adding the activation simply inserts its local derivative <code>σ'(z)</code> as one more factor in the product.</p>`,
        discovered: "Adding an operation (a layer, an activation) just inserts one more local-derivative factor into the product. The recipe is completely mechanical — no matter how deep, it's the same rule repeated."
      },
      {
        title: "Two layers — and the key realization",
        prompt: `<p>Now a 2-layer chain: <code>a = w₁·x</code>, <code>h = σ(a)</code>, <code>ŷ = w₂·h</code>, <code>L = (ŷ − y)²</code>. You need <em>both</em> gradients: <code>dL/dw₂</code> and <code>dL/dw₁</code>. Compute <code>dL/dw₂</code> first. Then, as you compute <code>dL/dw₁</code>, look carefully: which quantities did you already calculate for <code>w₂</code> that you could reuse?</p>`,
        diagram: `<svg viewBox="0 0 460 90" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="12">
          <g fill="#182233" stroke="#24314a"><circle cx="40" cy="45" r="16"/><circle cx="150" cy="45" r="16"/><circle cx="260" cy="45" r="16"/><circle cx="380" cy="45" r="16"/></g>
          <g fill="#e7ecf5" text-anchor="middle"><text x="40" y="49">x</text><text x="150" y="49">a</text><text x="260" y="49">h</text><text x="380" y="49">ŷ</text></g>
          <g stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#a)"><line x1="56" y1="45" x2="134" y2="45"/><line x1="166" y1="45" x2="244" y2="45"/><line x1="276" y1="45" x2="364" y2="45"/></g>
          <g fill="#9fb0c9" font-size="11" text-anchor="middle"><text x="95" y="35">·w₁</text><text x="205" y="35">σ</text><text x="320" y="35">·w₂</text></g>
          <text x="380" y="80" fill="#ffcf7a" text-anchor="middle">L = (ŷ−y)²</text>
          <defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#6ea8fe"/></marker></defs>
        </svg>`,
        hint: "Compute the 'error at the output' dL/dŷ once. Notice it appears in BOTH gradients.",
        reveal: `<p>Start at the output: <code>dL/dŷ = 2(ŷ − y)</code>. Then <code>dL/dw₂ = dL/dŷ · h</code>. For the deeper weight, extend the chain back: <code>dL/dw₁ = dL/dŷ · w₂ · σ'(a) · x</code>. Notice that <code>dL/dŷ</code> — the "error signal" at the output — appears in <em>both</em> gradients. If you had computed <code>w₁</code> from scratch, you'd recompute <code>dL/dŷ</code> all over again.</p>`,
        discovered: "Deeper weights' gradients reuse the 'error signal' already computed for later layers. Computing gradients from the OUTPUT backward lets you reuse that shared work — computing forward would recompute the shared pieces again and again."
      },
      {
        title: "Why backward, not forward?",
        prompt: `<p>Now imagine 100 layers. Option A: for each weight, independently multiply the whole chain from the loss down to that weight. Option B: compute one "error signal" <code>δ</code> at the output, then pass it <em>backward</em> layer by layer — each layer converts its incoming <code>δ</code> into (1) its own weight's gradient and (2) the <code>δ</code> to hand to the layer before it. Which is dramatically cheaper, and why?</p>`,
        hint: "In option A, how many times do you recompute the shared 'tail' of the chain that all deep weights have in common?",
        reveal: `<p>Option A recomputes the shared suffix of the chain over and over — its cost blows up with depth × number of weights. Option B computes each <code>δ</code> <strong>exactly once</strong> and reuses it: the total cost is essentially one forward pass plus one backward pass, proportional to the number of connections in the network. The backward direction is what makes the reuse possible, because gradients for deep weights all share the same "later-layer" factors, which you've already computed on the way back.</p>`,
        discovered: "Backpropagation = the chain rule + dynamic-programming-style reuse: compute each intermediate gradient (δ) once, propagating from output back to input. Sharing those subexpressions is exactly why it's efficient — and why it's called 'back'-prop."
      },
      {
        title: "Name the rule you just built",
        prompt: `<p>State, in two lines, the rule your procedure follows for a <em>generic</em> layer that has an input, an output, and a known local derivative — given the incoming gradient <code>δ_out = dL/d(this layer's output)</code>. What does the layer compute, and what does it pass backward?</p>`,
        hint: "One line produces this layer's weight gradient; one line produces the δ to send to the previous layer.",
        reveal: `<p>For each layer, given the incoming gradient <code>δ_out</code>:</p>
          <ul>
            <li><strong>Weight gradient</strong> = <code>δ_out · (∂ output / ∂ weight)</code> — used to update this layer's weights.</li>
            <li><strong>Gradient to pass back</strong>: <code>δ_in = δ_out · (∂ output / ∂ input)</code> — becomes the next layer's <code>δ_out</code>.</li>
          </ul>
          <p>Apply this from the last layer to the first. That's the entire algorithm.</p>`,
        discovered: "You just wrote backpropagation. Every deep-learning framework's automatic differentiation ('autograd') is exactly this rule applied over a computation graph — nothing more."
      }
    ],
    synthesis: `<p>You didn't memorize backpropagation — you <strong>rebuilt</strong> it. The chain rule says a nudge's effect is the product of local rates along a path. Many weights share the same "tail" of that path, so if you compute gradients from the output <em>backward</em> and cache the error signal <code>δ</code> at each layer, you get every gradient in a single backward sweep. That caching of shared subexpressions is the whole efficiency trick — it's the same idea as dynamic programming.</p>
      <p>This is precisely what PyTorch/TensorFlow autograd do for you. And the "vanishing gradient" problem you met in the puzzles is now obvious: it's just this product of local derivatives <code>(σ' · w · …)</code> shrinking toward zero across many layers.</p>`,
    connects: `<p>Next, ask <em>how</em> that gradient gets used (learning rate &amp; optimization) and <em>what</em> loss you should differentiate — see the <strong>Rediscovering Loss Functions</strong> track. Related puzzles: <code>Why residual connections work</code>, <code>Why RNNs forget</code>, and <code>Choosing a learning rate</code>.</p>`
  },

  {
    id: "loss-functions",
    title: "Rediscovering Loss Functions",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Why square errors sometimes and take logs other times? Derive the 'right' loss for each task from one principle.",
    intro: `<p>Why do we use mean-squared error for some problems and cross-entropy for others? It looks like a grab-bag of formulas. It isn't. You'll derive each loss from a single principle: <strong>a good loss makes the observed data as likely as possible</strong> (maximum likelihood). Pick the right assumption about your output, and the loss falls out on its own.</p>`,
    steps: [
      {
        title: "What makes a loss 'good'?",
        prompt: `<p>You're predicting a real number (say a house price) that has some noise. You want a penalty on the error <code>(ŷ − y)</code> that's small when you're right, large when you're wrong, and smoothly differentiable so you can follow its gradient. Why <em>square</em> the error rather than take the absolute value <code>|ŷ − y|</code>? Give one mathematical reason and one modeling reason.</p>`,
        hint: "Think about differentiability at zero, and about what noise distribution squaring secretly assumes.",
        reveal: `<p>Squaring is differentiable everywhere (absolute value has a kink at 0), it penalizes large errors disproportionately, and — the deeper reason — minimizing squared error is exactly what you get if you assume the target equals your prediction plus <strong>Gaussian noise</strong> and then maximize the likelihood of the data. The bell curve's <code>e^{-(error)²}</code> turns into <code>(error)²</code> when you take the negative log.</p>`,
        discovered: "Mean-squared error isn't arbitrary: it's the maximum-likelihood loss when you assume your target is the prediction plus Gaussian noise. The loss encodes an assumption about the data."
      },
      {
        title: "Now predict a probability",
        prompt: `<p>Switch tasks: the model now outputs <code>p</code>, the probability an email is spam (<code>0 ≤ p ≤ 1</code>), and the true label is <code>y ∈ {0, 1}</code>. Why is squared error <code>(p − y)²</code> a poor choice here? Think specifically about the gradient when the model is <em>confidently wrong</em> — say <code>p = 0.01</code> but the email really is spam (<code>y = 1</code>).</p>`,
        hint: "With a sigmoid producing p, what happens to the gradient when p is stuck near 0 or 1?",
        reveal: `<p>When <code>p</code> comes from a sigmoid, squared error makes the gradient <em>vanish</em> exactly when the model is confidently wrong (the sigmoid is saturated and flat there), so learning stalls at the worst possible moment. On top of that, <code>(p − y)²</code> implicitly assumes Gaussian noise — the wrong model for a 0/1 label. You want a loss that produces a <em>large</em> signal when the model is confidently wrong.</p>`,
        discovered: "The loss must match the nature of the output. For a probability, squared error gives weak gradients precisely when you most need a strong correction."
      },
      {
        title: "Derive the loss from likelihood",
        prompt: `<p>Apply the principle: choose the model that makes the observed labels most probable. If the model says <code>P(y = 1) = p</code>, write a single expression for the probability it assigns to the <em>actual</em> label <code>y</code> that works for both <code>y = 0</code> and <code>y = 1</code>. Then take the negative log (we minimize, and logs turn products into sums). What loss appears?</p>`,
        hint: "The clever one-liner p^y · (1−p)^(1−y) equals p when y=1 and (1−p) when y=0.",
        reveal: `<p>The probability assigned to the true label is <code>p^y · (1 − p)^(1 − y)</code> (it equals <code>p</code> when <code>y = 1</code> and <code>1 − p</code> when <code>y = 0</code>). Taking the negative log gives the loss for one example: <code>L = −[ y·log p + (1 − y)·log(1 − p) ]</code>. That is <strong>binary cross-entropy</strong>. Summed over the dataset, it's the loss everyone uses — and we didn't invent it, we derived it.</p>`,
        discovered: "Cross-entropy is literally the negative log-likelihood of a Bernoulli (yes/no) output. It's forced by the principle 'make the observed data likely', not chosen by taste."
      },
      {
        title: "Check its gradient",
        prompt: `<p>Let <code>p = σ(z)</code> (a sigmoid on the logit <code>z</code>) and use the cross-entropy loss you just derived. Compute <code>dL/dz</code>. (Recall <code>σ'(z) = p(1 − p)</code>.) Watch what cancels.</p>`,
        hint: "Multiply dL/dp by dp/dz = p(1−p) and simplify — the p(1−p) terms cancel beautifully.",
        reveal: `<p><code>dL/dp = −[ y/p − (1 − y)/(1 − p) ]</code>, and <code>dp/dz = p(1 − p)</code>. Multiplying and simplifying, the <code>p(1 − p)</code> factors cancel and you're left with the strikingly clean result <code>dL/dz = p − y</code>. This is <em>large</em> exactly when the model is confidently wrong, and there's no saturation stall — the opposite of the squared-error behavior in step 2.</p>`,
        discovered: "Sigmoid + cross-entropy gives the gradient (p − y): a strong signal precisely when the prediction is wrong. That clean pairing is why classification trains well — and it's the same reason softmax pairs with cross-entropy."
      },
      {
        title: "Generalize to many classes",
        prompt: `<p>Now there are <code>K</code> classes; the model outputs a probability vector (via softmax) and the true label is one-hot. By the <em>same</em> maximum-likelihood logic, what's the natural loss? And what do you expect its gradient with respect to the logits to look like?</p>`,
        hint: "Negative log of the probability assigned to the correct class. And expect the same tidy 'predicted − target' gradient.",
        reveal: `<p>The likelihood of one example is just the probability the model assigned to the <em>correct</em> class, so the loss is <code>−log(p_correct)</code> — <strong>categorical cross-entropy</strong>. And, exactly as in the binary case, its gradient with respect to the logits is <code>predicted − target</code> (the softmax probabilities minus the one-hot label). Same principle, same clean gradient.</p>`,
        discovered: "One principle — maximum likelihood — generates all of them: Gaussian → MSE, Bernoulli → binary cross-entropy, categorical → cross-entropy. Designing a loss is just: pick the output distribution, take its negative log-likelihood."
      }
    ],
    synthesis: `<p>You rediscovered that loss functions aren't a random collection — each one is the <strong>negative log-likelihood of an assumed output distribution</strong>. Regression with Gaussian noise → mean-squared error. A binary label (Bernoulli) → binary cross-entropy. Many classes (categorical) → cross-entropy. And the clean, non-saturating gradients (<code>p − y</code>) that make training work fall out for free.</p>
      <p>So next time you face a new output type, you don't look up a loss — you ask "what distribution does this output follow?" and take its negative log-likelihood.</p>`,
    connects: `<p>This is the "what to differentiate" companion to the <strong>Rediscovering Backpropagation</strong> track ("how to differentiate"). Related puzzles: <code>Why cross-entropy, not MSE, for classification</code> and <code>Why attention uses a softmax</code>.</p>`
  },

  {
    id: "dynamic-programming",
    title: "Rediscovering Dynamic Programming",
    category: "Algorithms",
    difficulty: "Core",
    blurb: "DP feels like magic until you watch a naive recursion waste itself. Then the technique becomes obvious.",
    intro: `<p>Dynamic programming has a reputation for being hard to "see." You'll rediscover it the natural way: write an honest recursion, watch it explode with repeated work, and then fix exactly that waste. The technique isn't a trick to memorize — it's the obvious response to a specific problem you'll feel firsthand.</p>`,
    steps: [
      {
        title: "Watch a recursion explode",
        prompt: `<p>Define Fibonacci as <code>F(n) = F(n−1) + F(n−2)</code>, with <code>F(0)=0, F(1)=1</code>. Trace the recursive calls needed to compute <code>F(6)</code>. Roughly how does the number of calls grow with <code>n</code>, and how many times does <code>F(2)</code> get computed along the way?</p>`,
        hint: "Draw the call tree. Every F(k) splits into F(k−1) and F(k−2). Count how often the small values reappear.",
        reveal: `<p>The call tree branches at every node, so the number of calls grows <em>exponentially</em> (about <code>1.6ⁿ</code>). Computing <code>F(6)</code> calls <code>F(2)</code> five separate times, <code>F(3)</code> three times, and so on. The algorithm keeps re-deriving the same small answers from scratch.</p>`,
        discovered: "Naive recursion recomputes identical subproblems over and over — that redundant work is the entire source of the exponential blow-up."
      },
      {
        title: "How many distinct subproblems are there really?",
        prompt: `<p>Exponentially many calls are being made — but how many <em>distinct</em> subproblems actually exist when computing <code>F(n)</code>?</p>`,
        hint: "List the different arguments F is ever called with.",
        reveal: `<p>Only <code>n + 1</code> distinct subproblems: <code>F(0), F(1), …, F(n)</code>. The exponential explosion is <em>entirely</em> the recomputation of these few values. There's a huge gap between the number of calls (exponential) and the number of genuinely different questions (linear).</p>`,
        discovered: "When the number of distinct subproblems is small but the number of calls is huge, you're recomputing. Store each answer once and the waste disappears."
      },
      {
        title: "Remember what you compute (memoization)",
        prompt: `<p>Add a cache: before computing <code>F(k)</code>, check whether you've already stored it; if so, return the stored value, otherwise compute and store it. What is the new time complexity, and why?</p>`,
        hint: "Each distinct subproblem now does real work only once.",
        reveal: `<p>Each of the <code>n + 1</code> subproblems is computed exactly once (every later request is a cache hit), so the time drops from exponential to <strong>O(n)</strong>. This is <em>top-down memoization</em>: the same recursion, plus a memory of answers already found.</p>`,
        discovered: "Caching subproblem answers (memoization) collapses exponential work to linear whenever subproblems overlap. That's the heart of dynamic programming."
      },
      {
        title: "Turn it around (tabulation)",
        prompt: `<p>Instead of recursion-with-a-cache, can you fill the answers <em>bottom-up</em>? Start from <code>F(0)</code> and <code>F(1)</code> and build upward in an array. Once you do, notice how little you actually need to keep in memory at any moment.</p>`,
        hint: "Each F(k) needs only the two values before it.",
        reveal: `<p>Fill <code>dp[0..n]</code> iteratively, each entry from the two before it — no recursion at all. And since <code>F(k)</code> depends only on the previous two values, you don't even need the whole array: two rolling variables suffice, giving <strong>O(1) extra space</strong>. This bottom-up form is called <em>tabulation</em>.</p>`,
        discovered: "When subproblems have a natural ordering, you can build answers bottom-up (tabulation), often shrinking memory dramatically by keeping only what the next step needs."
      },
      {
        title: "State the two conditions",
        prompt: `<p>You just made DP work on Fibonacci. What two properties must a problem have for this whole approach to apply? You relied on both.</p>`,
        hint: "One property is about subproblems repeating; the other is about the answer being built from sub-answers.",
        reveal: `<p>(1) <strong>Overlapping subproblems</strong> — the same sub-answers are needed repeatedly (so caching pays off). (2) <strong>Optimal substructure</strong> — the answer to the whole is built from answers to its subproblems (so combining them is valid). Fibonacci had both; so does any problem DP solves.</p>`,
        discovered: "Dynamic programming applies exactly when you have overlapping subproblems AND optimal substructure. Spotting those two properties is the trigger — once you see them, the technique writes itself."
      },
      {
        title: "Recognize it in the wild",
        prompt: `<p>Recall the <em>sequence-alignment</em> puzzle (aligning two DNA strings). What were its subproblems, and why did dynamic programming apply there too? Try to name the subproblem precisely.</p>`,
        hint: "Think about aligning prefixes of the two strings, and how each cell was built from smaller cells.",
        reveal: `<p>The subproblem was "the best alignment score of the first <code>i</code> letters of A with the first <code>j</code> of B." Each such cell is built from three smaller cells (<code>(i−1,j−1)</code>, <code>(i−1,j)</code>, <code>(i,j−1)</code>) — that's optimal substructure — and those smaller cells are reused by many larger ones — that's overlapping subproblems. Identical skeleton to Fibonacci, just a 2-D table instead of a 1-D one.</p>`,
        discovered: "Sequence alignment, edit distance, knapsack, shortest paths — all share the same DP skeleton. You now recognize the pattern itself, rather than memorizing each solution separately."
      }
    ],
    synthesis: `<p>You rebuilt dynamic programming from the ground up: write the honest recursion, notice it recomputes the same subproblems, cache them (<strong>memoization</strong>), and optionally rebuild bottom-up (<strong>tabulation</strong>) to save space. The trigger for reaching for DP is simply spotting <strong>overlapping subproblems + optimal substructure</strong>.</p>
      <p>Because you derived it from the waste it removes, you can now invent a DP solution to a new problem instead of trying to recall one.</p>`,
    connects: `<p>The reuse-of-subresults idea here is the same one that makes <strong>backpropagation</strong> efficient (caching the error signal δ). Related puzzles: <code>Aligning two DNA sequences</code>, <code>Sample from a stream you can't store</code>.</p>`
  }
];
