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
  },

  {
    id: "attention",
    title: "Rediscovering Attention",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Build the mechanism at the heart of every transformer — from 'which words should I look at?' to scaled dot-product multi-head attention.",
    intro: `<p>You'll rebuild self-attention from one simple need: when a model processes a word, it should pull in information from other <em>relevant</em> words. Each step you'll derive a piece — queries, keys, values, the dot-product score, the softmax, the √d scaling, multiple heads — as the answer to a concrete problem. Nothing will be arbitrary.</p>`,
    steps: [
      {
        title: "Why context has to flow between words",
        prompt: `<p>Consider the sentence: "the animal didn't cross the street because <em>it</em> was too tired." To represent the word "it", the model must know it refers to "animal", not "street" — and that depends on the whole sentence. A fixed embedding of "it" can't capture that. So a word's representation should be a blend of <em>other</em> words' information, weighted by relevance. If you had a relevance weight <code>w(i,j)</code> between word <code>i</code> and word <code>j</code>, how would you form the new representation of word <code>i</code>?</p>`,
        hint: "Combine the other words' vectors in proportion to how relevant each is.",
        reveal: `<p>Make it a <strong>weighted sum</strong> of the other words' vectors: <code>new_i = Σⱼ w(i,j) · vⱼ</code>, with the weights summing to 1. The entire mechanism reduces to two questions: how do we compute good weights <code>w(i,j)</code>, and which vectors <code>vⱼ</code> do we combine? Everything else is detail.</p>`,
        discovered: "A contextual representation is just a weighted average of other tokens' information. Attention is the question 'which tokens should I average in, and how much?'"
      },
      {
        title: "Scoring relevance",
        prompt: `<p>You need a number saying how relevant word <code>j</code> is to word <code>i</code>. Each word has an embedding vector. What's a simple, differentiable way to score how compatible two vectors are — large when they point in similar directions — and cheap to compute for <em>all</em> pairs at once?</p>`,
        hint: "A single operation on two vectors gives a large value when they align. And all pairs at once is one matrix product.",
        reveal: `<p>The <strong>dot product</strong>: <code>score(i,j) = xᵢ · xⱼ</code>. It's large when the vectors align, near zero when orthogonal, and you can compute every pair simultaneously as the matrix product <code>X Xᵀ</code>. That's your raw similarity matrix.</p>`,
        discovered: "The dot product is a natural, cheap similarity score, and computing it for all token pairs is a single matrix multiply."
      },
      {
        title: "Two roles: queries and keys",
        prompt: `<p>Using <code>xᵢ · xⱼ</code> directly has two flaws: it forces relevance to be symmetric (i-to-j equals j-to-i), and it uses the <em>same</em> vector for "what I'm looking for" and "what I offer." But "it" <em>seeking</em> its referent is a different role than "animal" <em>being available</em> as one. How can each word play two distinct roles, and how does that make relevance directional?</p>`,
        hint: "Project each embedding into two different learned spaces — one for seeking, one for offering.",
        reveal: `<p>Give each word two learned projections: a <strong>query</strong> <code>qᵢ = W_Q xᵢ</code> (what word <code>i</code> is looking for) and a <strong>key</strong> <code>kⱼ = W_K xⱼ</code> (what word <code>j</code> offers). The score becomes <code>qᵢ · kⱼ</code> — now asymmetric and role-specific, and the model <em>learns</em> <code>W_Q</code> and <code>W_K</code> to decide what to look for.</p>`,
        discovered: "Separating the 'query' (what I seek) from the 'key' (what I offer), via learned projections, makes attention directional and lets the model learn what matters."
      },
      {
        title: "What actually gets passed: values",
        prompt: `<p>Once word <code>i</code> decides word <code>j</code> is relevant, what information from <code>j</code> should it actually mix in? Should it reuse the key vector it matched against, or something separate?</p>`,
        hint: "Matching and content-to-deliver are different jobs — give them different projections.",
        reveal: `<p>Use a third learned projection, the <strong>value</strong> <code>vⱼ = W_V xⱼ</code>. What you match on (keys) and what you retrieve (values) are distinct jobs, so they get separate projections. The output is <code>outputᵢ = Σⱼ softmax_j(qᵢ · kⱼ) · vⱼ</code> — you now have the full Q, K, V trio.</p>`,
        discovered: "The content you retrieve (value) is decoupled from the content you match on (key). Three projections — Q, K, V — each serve a distinct role."
      },
      {
        title: "Normalizing the weights (and the √d trick)",
        prompt: `<p>The scores <code>qᵢ · kⱼ</code> are arbitrary real numbers, but weights for a weighted average must be non-negative and sum to 1. What function turns arbitrary scores into such weights? And a subtlety: if the query/key vectors have dimension <code>d</code>, the dot product's typical magnitude grows with <code>d</code>, pushing that function into saturation (tiny gradients). What simple rescaling fixes it?</p>`,
        hint: "Softmax makes a probability distribution. For the scale: what's the standard deviation of a dot product of two ~unit-variance vectors of dimension d?",
        reveal: `<p>Apply <strong>softmax</strong> over <code>j</code> to turn the scores into a proper weight distribution. To control scale, divide the scores by <code>√d</code> before the softmax: <code>Attention = softmax(QKᵀ / √d) · V</code>. Why <code>√d</code>: if the entries of <code>q</code> and <code>k</code> are roughly independent with unit variance, then <code>q · k</code> is a sum of <code>d</code> such products and has variance <code>~d</code>, so its standard deviation is <code>~√d</code>. Dividing by <code>√d</code> renormalizes the scores to variance <code>~1</code>, keeping softmax in a sensitive, non-saturated range with healthy gradients.</p>`,
        discovered: "Softmax converts scores into a differentiable probability distribution (the weights); dividing by √d stops the dot products from growing with dimension and stalling gradients. That's scaled dot-product attention."
      },
      {
        title: "Many relationships at once: multiple heads",
        prompt: `<p>A single set of Q/K/V lets each word attend one way. But "it" might need to track its referent, <em>and</em> the grammatical subject, <em>and</em> more, simultaneously. How can the model attend to several different kinds of relationships at once — without just building one giant attention?</p>`,
        hint: "Run several smaller attentions in parallel and combine their outputs.",
        reveal: `<p>Use <strong>multiple heads</strong>: run several attention operations in parallel, each with its own smaller <code>W_Q, W_K, W_V</code>, then concatenate their outputs and pass them through a final projection. Each head can specialize — one might track coreference, another positional patterns, another syntax — and concatenation fuses these perspectives. This is multi-head attention.</p>`,
        discovered: "Multiple parallel heads let the model attend to several types of relationships at once; concatenating their outputs combines those perspectives into one representation."
      }
    ],
    synthesis: `<p>You built self-attention from scratch. A contextual representation is a weighted average of other tokens' <strong>values</strong>; the weights come from <strong>query · key</strong> similarity, normalized by <strong>softmax</strong> and scaled by <strong>√d</strong>; and multiple <strong>heads</strong> capture multiple relationship types in parallel. Stack this with feed-forward layers, residual connections, and normalization, and you have a transformer block.</p>
      <p>Every design choice answered a concrete need — no magic. And notice: attention connects <em>any</em> two positions with a direct path, which (as the RNN puzzle showed) is exactly why transformers train and scale where recurrent networks struggle.</p>`,
    connects: `<p>Related puzzles: <code>Why attention uses a softmax</code>, <code>Why RNNs forget, and how attention fixes it</code>, <code>Why residual connections work</code>. And the <strong>Rediscovering Backpropagation</strong> track shows how all these learned projections actually get trained.</p>`
  },

  {
    id: "gradient-descent",
    title: "Rediscovering Gradient Descent & the Learning Rate",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Derive how models actually learn — from 'which way is downhill?' to why the step size makes or breaks training.",
    intro: `<p>You have a loss to minimize and millions of parameters — you can't try all values. You'll derive gradient descent from a single question, "which way should I nudge the parameters to reduce the loss?", and then discover why the <em>step size</em> (the learning rate) is the knob everything hinges on. A little algebra in the middle will make the mysterious behaviors (overshoot, divergence, zig-zagging) completely predictable.</p>`,
    steps: [
      {
        title: "Which way is downhill?",
        prompt: `<p>Your loss <code>L(w)</code> depends on one weight <code>w</code>, and you're standing at some value <code>w₀</code>. You can compute <code>L</code> and its derivative there, but you can't see the whole curve. Which direction should you move <code>w</code> to <em>decrease</em> <code>L</code>, and how do you know from the derivative alone?</p>`,
        hint: "The derivative's sign tells you which way L is increasing.",
        reveal: `<p>Move <em>opposite</em> the sign of the derivative. If <code>dL/dw > 0</code>, the loss rises as <code>w</code> increases, so decrease <code>w</code>; if <code>dL/dw < 0</code>, increase it. The derivative points uphill, so step the other way: <code>w ← w − (step)·(dL/dw)</code>.</p>`,
        discovered: "The derivative points toward steepest increase; to descend, step in the negative-gradient direction. That is the core of gradient descent."
      },
      {
        title: "Downhill in a million dimensions",
        prompt: `<p>Now <code>L</code> depends on millions of weights at once. For each weight there's a direction that reduces <code>L</code>. What single object captures "the steepest downhill direction" across all of them simultaneously, and how do you update everything at once?</p>`,
        hint: "Collect all the partial derivatives into one vector.",
        reveal: `<p>The <strong>gradient</strong> <code>∇L</code> — the vector of all partial derivatives <code>∂L/∂wₖ</code> — points in the direction of steepest ascent in the full parameter space. Descend by subtracting it from every parameter at once: <code>w ← w − η ∇L</code>. (And how do you get <code>∇L</code> efficiently for a neural net? Exactly the backpropagation you rebuilt in the other track.)</p>`,
        discovered: "In high dimensions the gradient vector is the steepest-ascent direction; descend by subtracting it from all parameters together. Backprop is how that gradient is computed."
      },
      {
        title: "How big a step? Meet η",
        prompt: `<p>The gradient gives a <em>direction</em>, not a distance. You scale it by a step size <code>η</code> (the learning rate): <code>w ← w − η ∇L</code>. Reason about the two extremes: <code>η</code> extremely small, and <code>η</code> extremely large. What goes wrong at each end?</p>`,
        hint: "One extreme barely moves; the other flies past the target.",
        reveal: `<p><strong>η too small:</strong> you inch downhill, needing an impractical number of steps to get anywhere. <strong>η too large:</strong> you overshoot the minimum and land higher up the opposite wall; steps can grow instead of shrink, and the loss diverges to infinity or NaN. Somewhere between is a sweet spot.</p>`,
        discovered: "The learning rate turns the gradient direction into an actual step. Too small crawls; too large overshoots and can diverge. Training is extremely sensitive to it."
      },
      {
        title: "Picture the bowl — why overshoot happens",
        prompt: `<p>Model the loss near a minimum as a simple bowl: <code>L = ½ a w²</code> (with curvature <code>a > 0</code>). Then <code>dL/dw = a w</code>, so one gradient-descent step gives <code>w ← w − η·a·w = (1 − ηa)·w</code>. For the sequence of <code>w</code> values to shrink toward 0 (converge), what must be true of <code>(1 − ηa)</code>? Trace what happens as <code>ηa</code> passes 1, then 2.</p>`,
        diagram: `<svg viewBox="0 0 460 190" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="11">
          <path d="M40 160 Q 230 -10 420 160" fill="none" stroke="#24314a" stroke-width="1.5"/>
          <line x1="230" y1="20" x2="230" y2="170" stroke="#1c2740" stroke-dasharray="3 3"/>
          <text x="230" y="184" fill="#9fb0c9" text-anchor="middle">minimum</text>
          <g fill="#7ef0c0"><circle cx="120" cy="120" r="4"/><circle cx="180" cy="72" r="4"/><circle cx="215" cy="38" r="4"/></g>
          <text x="95" y="112" fill="#7ef0c0">stable: 0&lt;ηa&lt;1</text>
          <g fill="#ff8f8f"><circle cx="110" cy="128" r="4"/><circle cx="350" cy="128" r="4"/><circle cx="70" cy="150" r="4"/></g>
          <text x="300" y="150" fill="#ff8f8f">ηa&gt;2: diverges</text>
        </svg>`,
        hint: "Each step multiplies w by the same factor (1 − ηa). When does repeated multiplication shrink toward zero?",
        reveal: `<p>Each step multiplies <code>w</code> by the constant factor <code>(1 − ηa)</code>, so convergence needs <code>|1 − ηa| < 1</code>, i.e. <code>0 < η < 2/a</code>. Within that: for <code>0 < ηa < 1</code> the factor is positive and <code>w</code> shrinks smoothly; for <code>1 < ηa < 2</code> the factor is negative, so <code>w</code> flips sign each step but still shrinks (damped oscillation); at <code>ηa = 2</code> it bounces forever; and for <code>ηa > 2</code> the factor exceeds 1 in magnitude and <code>w</code> <em>grows</em> — divergence.</p>`,
        discovered: "Stability requires η < 2/curvature. Overshoot and divergence aren't mysterious — they're exactly what happens when the step exceeds what the curvature allows. The right η depends on the shape of the loss."
      },
      {
        title: "When one η can't fit every direction",
        prompt: `<p>Real losses curve sharply in some directions and gently in others — an elongated valley. A single <code>η</code> must obey <code>η < 2/a</code> for the <em>sharpest</em> direction, but that same <code>η</code> is then tiny relative to the gentle directions. What's the visible symptom, and what kinds of fixes address it?</p>`,
        hint: "Think about progress along the flat direction versus the steep one, and what could give each direction its own effective step.",
        reveal: `<p><strong>Symptom:</strong> the sharp direction caps <code>η</code>, so progress along the gentle, low-curvature direction is painfully slow — you zig-zag down a narrow valley. <strong>Fixes:</strong> <em>momentum</em> (accumulate a velocity that powers through gentle directions and damps oscillation in sharp ones); <em>adaptive per-parameter rates</em> (AdaGrad / RMSProp / Adam) that scale each direction's step by its own gradient history; and <em>normalization</em> to make the loss surface more evenly curved.</p>`,
        discovered: "A single global step size can't be optimal when curvature differs by direction. Momentum and adaptive optimizers like Adam effectively give each direction its own learning rate."
      },
      {
        title: "The practical recipe",
        prompt: `<p>Putting it together: how do you actually <em>choose</em> <code>η</code> in practice, and why do people "warm up" the learning rate at the start and "decay" it toward the end?</p>`,
        hint: "You derived a stability ceiling; pick just under it. And think about big steps early vs. careful steps near the bottom.",
        reveal: `<p><strong>Choosing η:</strong> sweep it on a log scale (<code>1e-1, 1e-2, 1e-3, …</code>), watch the loss curve, and take the <em>largest</em> value that still decreases smoothly and stably — largest means fastest without diverging, i.e. just under the stability ceiling you derived. <strong>Warmup</strong> (start small, ramp up) avoids early blow-ups when weights and gradients are wild. <strong>Decay</strong> (shrink <code>η</code> over training) lets you take big steps early and small, careful steps near the minimum — because near the bottom a large step overshoots, exactly as the bowl analysis predicts.</p>`,
        discovered: "Pick the largest stable η by scanning a log scale; warm up to avoid early instability and decay to settle into the minimum. The whole schedule follows from the stability picture you derived."
      }
    ],
    synthesis: `<p>You rebuilt gradient descent from "which way is downhill?" (the negative gradient) and discovered the learning rate is the step size that turns direction into motion — with a hard stability limit <code>η < 2/curvature</code>. Overshoot, divergence, slow crawling, zig-zagging valleys, and the reasons behind momentum, Adam, warmup, and decay all fall out of that one small bowl calculation.</p>
      <p>The gradient itself comes from <strong>backpropagation</strong>; <em>what</em> you're minimizing comes from your <strong>loss function</strong>. Three tracks, one training loop.</p>`,
    connects: `<p>Pairs with the <strong>Rediscovering Backpropagation</strong> track (computing <code>∇L</code>) and <strong>Rediscovering Loss Functions</strong> (what <code>L</code> is). Related puzzles: <code>Choosing a learning rate</code>, <code>Why residual connections work</code>.</p>`
  },

  {
    id: "big-o",
    title: "Rediscovering Big-O",
    category: "Algorithms",
    difficulty: "Core",
    blurb: "Build algorithmic complexity from 'how does the work grow as the input grows?' — the language for reasoning about scale.",
    intro: `<p>Big-O is how we talk about whether an algorithm will still work when the input gets large. You'll rediscover it by timing algorithms in your head — counting operations as the input grows — and then throwing away everything that doesn't matter at scale, until what's left is exactly the notation.</p>`,
    steps: [
      {
        title: "Count operations, not seconds",
        prompt: `<p>You want to compare two algorithms fairly. Timing them with a stopwatch depends on the machine, the language, and what else the CPU is doing. What machine-independent quantity should you count instead — and as a function of what?</p>`,
        hint: "Count the fundamental work, and express it in terms of how big the input is.",
        reveal: `<p>Count the number of <strong>basic operations</strong> as a function of the <strong>input size <code>n</code></strong>. This is machine-independent and predicts how the algorithm scales. Summing an array of <code>n</code> numbers, for instance, does about <code>n</code> additions — regardless of the computer.</p>`,
        discovered: "Analyze cost as a count of basic operations versus input size n, not wall-clock time. That abstracts away the machine and exposes how the work scales."
      },
      {
        title: "Only the growth rate survives",
        prompt: `<p>Algorithm A does <code>100n + 5</code> operations; algorithm B does <code>2n²</code>. At <code>n = 1</code>, A does 105 and B does 2 — A looks worse! Which do you prefer for <em>large</em> <code>n</code>, and why do the constant <code>100</code> and the <code>+5</code> stop mattering?</p>`,
        hint: "Compute both at n = 1000 and see which term runs away.",
        reveal: `<p>Prefer A for large <code>n</code>. At <code>n = 1000</code>: A ≈ 100,000 but B = 2,000,000, and the gap only widens — B's <code>n²</code> term outgrows any linear term no matter the constants. As <code>n → ∞</code> the highest-order term dominates and constants and lower-order terms become negligible. So we keep only the dominant term and drop constants: A is <code>O(n)</code>, B is <code>O(n²)</code>.</p>`,
        discovered: "At scale, only the fastest-growing term matters; constant factors and lower-order terms wash out. Big-O keeps just the dominant growth term."
      },
      {
        title: "Pin down the definition",
        prompt: `<p>Let's formalize "grows no faster than." We say <code>f(n)</code> is <code>O(g(n))</code> if, beyond some point, <code>f</code> is at most a constant multiple of <code>g</code>. Why do we need both the "constant multiple" part and the "beyond some point" part?</p>`,
        hint: "One clause lets you ignore machine constants; the other lets you ignore small-n quirks.",
        reveal: `<p><code>f(n) = O(g(n))</code> means there exist constants <code>c > 0</code> and <code>n₀</code> such that <code>f(n) ≤ c·g(n)</code> for all <code>n ≥ n₀</code>. The <strong>constant multiple <code>c</code></strong> lets us ignore machine-dependent factors (a 2× faster CPU shouldn't change the class); the <strong>threshold <code>n₀</code></strong> lets us ignore small-<code>n</code> quirks and focus on asymptotic behavior. It's an upper bound on growth rate.</p>`,
        discovered: "O(g(n)) means 'eventually bounded above by a constant times g(n)' — an asymptotic upper bound that deliberately ignores constants and small inputs."
      },
      {
        title: "Read it straight off the loops",
        prompt: `<p>Estimate the Big-O of each without formal math: (a) a single loop over <code>n</code> items; (b) a loop over <code>n</code> nested inside another loop over <code>n</code>; (c) a process that halves the remaining problem each step until one item is left.</p>`,
        diagram: `<svg viewBox="0 0 460 200" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="11">
          <line x1="45" y1="175" x2="440" y2="175" stroke="#24314a"/>
          <line x1="45" y1="15" x2="45" y2="175" stroke="#24314a"/>
          <text x="240" y="193" fill="#6c7d99" text-anchor="middle">input size n →</text>
          <path d="M45 168 Q 240 150 435 130" fill="none" stroke="#7ef0c0" stroke-width="2"/>
          <text x="410" y="122" fill="#7ef0c0">O(log n)</text>
          <path d="M45 172 L 435 60" fill="none" stroke="#6ea8fe" stroke-width="2"/>
          <text x="412" y="54" fill="#6ea8fe">O(n)</text>
          <path d="M45 174 Q 330 172 420 20" fill="none" stroke="#ff8f8f" stroke-width="2"/>
          <text x="380" y="28" fill="#ff8f8f">O(n²)</text>
        </svg>`,
        hint: "Sequential work adds; nested loops multiply; repeated halving is a logarithm.",
        reveal: `<p>(a) <code>O(n)</code> — <code>n</code> iterations. (b) <code>O(n²)</code> — <code>n</code> iterations times <code>n</code>. (c) <code>O(log n)</code> — halving <code>n</code> repeatedly takes about <code>log₂ n</code> steps to reach 1 (this is binary search, and the same information-halving intuition behind the coin-weighing puzzles). The rule of thumb: nested loops multiply, and repeatedly dividing the problem gives logarithms.</p>`,
        discovered: "You can usually read Big-O off the structure: sequential work adds, nested loops multiply, and repeatedly halving the problem gives log n."
      },
      {
        title: "Why the class beats the code",
        prompt: `<p>One engineer cleverly shaves 50% off the constant of an <code>O(n²)</code> algorithm; another lazily swaps in an <code>O(n log n)</code> algorithm with no tuning. At <code>n = 1,000,000</code>, who wins, and roughly by how much?</p>`,
        hint: "Plug in n = 10⁶: compare n², halved n², and n·log n.",
        reveal: `<p>The <code>O(n log n)</code> algorithm wins overwhelmingly. At <code>n = 10⁶</code>: <code>n² = 10¹²</code>, while <code>n·log₂ n ≈ 10⁶ × 20 = 2×10⁷</code> — about <strong>50,000× fewer operations</strong>. Halving the constant of the <code>n²</code> version still leaves <code>5×10¹¹</code>, utterly dwarfed. Moving to a lower complexity class beats any constant-factor tuning at scale.</p>`,
        discovered: "Improving the complexity class dominates constant-factor optimization for large inputs. That's why 'what's the Big-O?' is the first question, not 'how fast is the code?'"
      },
      {
        title: "Know the limits of the model",
        prompt: `<p>Two cautions before you trust Big-O blindly. (a) It's usually the <em>worst</em> case unless stated otherwise — how can the same algorithm have different bounds? (b) It hides constants — so is an <code>O(n)</code> algorithm <em>always</em> better in practice than an <code>O(n log n)</code> one?</p>`,
        hint: "Think quicksort's average vs worst case; and think about small n and cache effects.",
        reveal: `<p>(a) Always state the case: quicksort is <code>O(n log n)</code> on average but <code>O(n²)</code> in the worst case — same algorithm, different bounds for best/average/worst inputs. (b) Not always: because Big-O drops constants and lower-order terms, for small or moderate <code>n</code> a low-constant <code>O(n log n)</code> algorithm can beat a high-constant <code>O(n)</code> one, and real-world factors like cache behavior and memory can dominate. Big-O predicts <em>scaling</em>, not absolute speed — choose the class with it, then measure to tune.</p>`,
        discovered: "Big-O is an asymptotic, usually worst-case, constant-free model. It's the right tool for reasoning about scale, but you still measure real inputs for constants, cache effects, and small-n behavior."
      }
    ],
    synthesis: `<p>You rebuilt Big-O from the ground up: count operations versus input size, keep only the dominant term, formalize it as "eventually <code>≤ c·g(n)</code>", read it straight off loops, and land on the punchline that complexity <em>class</em> beats constant-factor tuning at scale. It's the vocabulary for predicting whether something survives as <code>n</code> grows large — the first question to ask about any algorithm — while remembering it deliberately ignores constants, so you still measure real inputs.</p>`,
    connects: `<p>Related puzzles: <code>Why comparison sorting can't beat n log n</code> (a Big-O lower bound), <code>Twelve coins, one fake, three weighings</code> and <code>Trailing zeros of 100!</code> (logarithms and bottlenecks), and the <strong>Rediscovering Dynamic Programming</strong> track (turning exponential into polynomial).</p>`
  }
];
