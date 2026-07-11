/*
 * Intuition Trainer — Discovery Tracks.
 *
 * Each track is a guided lesson that ALTERNATES teaching and doing (see FRAMEWORK.md):
 * every step opens with a short "brief" (the lecture — the one tool you need), then a
 * "challenge" you work out yourself, escalating "hints", a full "reveal" (work-through),
 * and a one-line "insight". Tracks carry an "overview" (goal/prereqs/objectives/time)
 * and end with "checkpoints" (active-recall self-tests).
 *
 * Schema per track:
 *   id, title, category, difficulty, blurb
 *   overview { goal, prerequisites, objectives[], time }
 *   intro (HTML)
 *   steps[]  { title, brief(HTML), challenge(HTML), diagram?(SVG), hints[], reveal(HTML), insight }
 *   synthesis (HTML)
 *   checkpoints[] { q, a(HTML) }
 *   connects (HTML)
 */

const TRACKS = [
  {
    id: "backprop",
    title: "Rediscovering Backpropagation",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Build the algorithm that trains every neural network — from the chain rule up — without being handed a single formula.",
    overview: {
      goal: `Derive backpropagation from scratch and be able to reconstruct it, not memorize it.`,
      prerequisites: `Basic derivatives (a derivative is a slope) and the idea of a loss you want to minimize.`,
      objectives: [
        `Explain why a nudge's effect multiplies along a chain of operations`,
        `Compute a weight's gradient through several layers`,
        `Say precisely why gradients are computed backward, not forward`,
        `State the backprop update rule for a generic layer`
      ],
      time: `25–35 min`
    },
    intro: `<p>You're going to rebuild backpropagation from nothing. No formulas will be handed to you; each step gives you one tool, then asks you to derive the next piece. By the end you'll see that backprop is "just" the chain rule plus one clever bookkeeping trick — and you'll never have to memorize it, because you'll have built it.</p>
      <p>Work each challenge honestly before revealing. Try the numbers with pen and paper.</p>`,
    steps: [
      {
        title: "A nudge travels through a chain",
        brief: `<p>When functions are composed (<code>x → y → z</code>), a small change in the input ripples through each operation to the output. The <strong>derivative</strong> of one variable with respect to another is exactly the local rate: "if I nudge this a little, how much does that move?"</p>`,
        challenge: `<p>Let <code>y = 3x</code> and <code>z = y²</code>. If you increase <code>x</code> by a tiny amount, how much does <code>z</code> change per unit of <code>x</code> — i.e. what is <code>dz/dx</code>? Reason physically: a nudge <code>Δx</code> changes <code>y</code> by how much, and that change in <code>y</code> changes <code>z</code> by how much?</p>`,
        hints: [
          "Find how sensitive z is to y (dz/dy), and how sensitive y is to x (dy/dx), separately.",
          "Then combine them — a nudge in x first becomes a nudge in y, which then becomes a nudge in z."
        ],
        reveal: `<p><code>z</code> depends on <code>y</code> with rate <code>dz/dy = 2y</code>, and <code>y</code> depends on <code>x</code> with rate <code>dy/dx = 3</code>. A nudge in <code>x</code> becomes a nudge <code>3·Δx</code> in <code>y</code>, which becomes a nudge <code>2y·(3Δx)</code> in <code>z</code>. So <code>dz/dx = 2y · 3 = 6y = 18x</code>. The nudge propagates by <strong>multiplying the local rates</strong> along the chain.</p>`,
        insight: "The effect of x on z is the product of the local rates of change along the path. That product rule is the chain rule — literally 'how a nudge propagates through composed operations.'"
      },
      {
        title: "One neuron, one weight",
        brief: `<p>A neuron makes a prediction from an input and a weight, and a <strong>loss</strong> measures how wrong it is. Training means nudging the weight to lower the loss — so the quantity we need is the loss's sensitivity to the weight, <code>dL/dw</code>, obtained by chaining the pieces you just used.</p>`,
        challenge: `<p>The neuron computes <code>ŷ = w·x</code> (no activation yet), with loss <code>L = (ŷ − y)²</code>. How much does the loss change if you nudge the weight <code>w</code>? Derive <code>dL/dw</code> symbolically, then plug in <code>x = 2</code>, <code>y = 3</code>, <code>w = 0.5</code>.</p>`,
        hints: [
          "Chain it: how does L depend on ŷ, and how does ŷ depend on w?",
          "dL/dŷ = 2(ŷ − y); dŷ/dw = x."
        ],
        reveal: `<p><code>dL/dŷ = 2(ŷ − y)</code> and <code>dŷ/dw = x</code>, so <code>dL/dw = 2(ŷ − y)·x</code>. With <code>w = 0.5, x = 2</code>: <code>ŷ = 1.0</code>, error <code>ŷ − y = 1 − 3 = −2</code>, so <code>dL/dw = 2(−2)(2) = −8</code>. The gradient is negative, so <em>increasing</em> <code>w</code> lowers the loss — which makes sense, since <code>ŷ = 1</code> sits below the target <code>3</code>.</p>`,
        insight: "A weight's gradient is a product of local derivatives chained from the loss back to that weight. Gradient descent then steps the weight opposite that gradient."
      },
      {
        title: "Insert a nonlinearity",
        brief: `<p>Real neurons pass their weighted sum through an <strong>activation</strong> <code>σ</code> (a nonlinearity), which has its own local derivative <code>σ'</code>. Adding an operation to the chain just adds one more link — and one more factor.</p>`,
        challenge: `<p>Now <code>ŷ = σ(z)</code> where <code>z = w·x</code>. What is <code>dL/dw</code>, and where exactly does <code>σ'</code> appear?</p>`,
        hints: [
          "The path is now w → z → ŷ → L. Multiply the local derivative of each hop.",
          "The activation's local rate σ'(z) slots in between dŷ and dz."
        ],
        reveal: `<p>The path is <code>w → z → ŷ → L</code>, so <code>dL/dw = dL/dŷ · dŷ/dz · dz/dw = 2(ŷ − y) · σ'(z) · x</code>. Adding the activation simply inserts its local derivative <code>σ'(z)</code> as one more factor in the product.</p>`,
        insight: "Adding an operation (a layer, an activation) inserts exactly one more local-derivative factor. No matter how deep, it's the same mechanical rule repeated."
      },
      {
        title: "Two layers — and the key realization",
        brief: `<p>Stack two layers and you need a gradient for <em>each</em> weight. The important thing to watch isn't the algebra — it's which quantities you compute for the later weight that reappear when you reach the earlier one.</p>`,
        challenge: `<p>For <code>a = w₁·x</code>, <code>h = σ(a)</code>, <code>ŷ = w₂·h</code>, <code>L = (ŷ − y)²</code>: compute <code>dL/dw₂</code> first, then <code>dL/dw₁</code>. Which already-computed quantity gets reused?</p>`,
        diagram: `<svg viewBox="0 0 460 90" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="12">
          <g fill="#182233" stroke="#24314a"><circle cx="40" cy="45" r="16"/><circle cx="150" cy="45" r="16"/><circle cx="260" cy="45" r="16"/><circle cx="380" cy="45" r="16"/></g>
          <g fill="#e7ecf5" text-anchor="middle"><text x="40" y="49">x</text><text x="150" y="49">a</text><text x="260" y="49">h</text><text x="380" y="49">ŷ</text></g>
          <g stroke="#6ea8fe" stroke-width="1.5" marker-end="url(#a)"><line x1="56" y1="45" x2="134" y2="45"/><line x1="166" y1="45" x2="244" y2="45"/><line x1="276" y1="45" x2="364" y2="45"/></g>
          <g fill="#9fb0c9" font-size="11" text-anchor="middle"><text x="95" y="35">·w₁</text><text x="205" y="35">σ</text><text x="320" y="35">·w₂</text></g>
          <text x="380" y="80" fill="#ffcf7a" text-anchor="middle">L = (ŷ−y)²</text>
          <defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6" fill="#6ea8fe"/></marker></defs>
        </svg>`,
        hints: [
          "Compute the 'error at the output' dL/dŷ once, and notice it sits inside both gradients.",
          "For w₁ you extend the same chain further back through w₂ and σ'(a)."
        ],
        reveal: `<p>Start at the output: <code>dL/dŷ = 2(ŷ − y)</code>. Then <code>dL/dw₂ = dL/dŷ · h</code>. Extending back, <code>dL/dw₁ = dL/dŷ · w₂ · σ'(a) · x</code>. The factor <code>dL/dŷ</code> — the "error signal" at the output — appears in <em>both</em> gradients. Computing <code>w₁</code> from scratch would recompute it.</p>`,
        insight: "Deeper weights' gradients reuse the error signal already computed for later layers. Computing from the output backward lets you reuse that shared work; going forward would recompute it repeatedly."
      },
      {
        title: "Why backward, not forward?",
        brief: `<p>Now scale to many layers. The choice of <em>direction</em> in which you compute the gradients determines how much work you repeat — this is the difference between an intractable and a practical algorithm.</p>`,
        challenge: `<p>For 100 layers, compare: (A) for each weight, independently multiply the whole chain from loss to that weight; versus (B) compute one error signal <code>δ</code> at the output and pass it backward, each layer turning its incoming <code>δ</code> into its own weight-gradient and the <code>δ</code> for the layer before it. Which is dramatically cheaper, and why?</p>`,
        hints: [
          "In option A, how many times do you recompute the shared 'tail' that all deep weights have in common?",
          "Option B computes each δ exactly once."
        ],
        reveal: `<p>Option A recomputes the shared suffix of the chain over and over — cost blows up with depth × number of weights. Option B computes each <code>δ</code> <strong>once</strong> and reuses it: total cost is about one forward pass plus one backward pass, proportional to the number of connections. Going backward makes the reuse possible, because deep weights all share the same later-layer factors you've already computed on the way back.</p>`,
        insight: "Backpropagation = the chain rule + dynamic-programming-style reuse: compute each intermediate gradient (δ) once, propagating output→input. Sharing those subexpressions is why it's efficient — and why it's 'back'-prop."
      },
      {
        title: "Name the rule you just built",
        brief: `<p>You've now done the whole computation by hand. The final move in understanding something is to state it generically — a rule that works for <em>any</em> layer, given only its local derivative and the gradient arriving from the layer after it.</p>`,
        challenge: `<p>State, in two lines, what a generic layer computes given the incoming gradient <code>δ_out = dL/d(this layer's output)</code>: one line for its weight's gradient, one for the <code>δ</code> it passes to the previous layer.</p>`,
        hints: [
          "One line produces this layer's weight gradient; one produces the δ to send backward.",
          "Each uses δ_out times a local partial derivative (∂output/∂weight, or ∂output/∂input)."
        ],
        reveal: `<p>For each layer, given incoming <code>δ_out</code>:</p>
          <ul>
            <li><strong>Weight gradient</strong> = <code>δ_out · (∂ output / ∂ weight)</code> — used to update this layer's weights.</li>
            <li><strong>Gradient to pass back</strong>: <code>δ_in = δ_out · (∂ output / ∂ input)</code> — becomes the previous layer's <code>δ_out</code>.</li>
          </ul>
          <p>Apply from the last layer to the first. That's the entire algorithm.</p>`,
        insight: "You just wrote backpropagation. Every framework's automatic differentiation ('autograd') is exactly this rule applied over a computation graph — nothing more."
      }
    ],
    synthesis: `<p>You didn't memorize backpropagation — you <strong>rebuilt</strong> it. The chain rule says a nudge's effect is the product of local rates along a path. Many weights share the same "tail" of that path, so computing gradients from the output <em>backward</em> and caching the error signal <code>δ</code> gets every gradient in one backward sweep. That caching of shared subexpressions is the whole efficiency trick — the same idea as dynamic programming.</p>
      <p>This is precisely what PyTorch/TensorFlow autograd do for you. And "vanishing gradients" is now obvious: it's this product of local derivatives shrinking across many layers.</p>`,
    checkpoints: [
      {
        q: "Without looking, state the two-line update rule a generic layer follows during the backward pass.",
        a: `<p>Weight gradient <code>= δ_out · (∂output/∂weight)</code>; gradient passed back <code>δ_in = δ_out · (∂output/∂input)</code>. Applied from the last layer to the first.</p>`
      },
      {
        q: "Why is backprop far cheaper than computing each weight's gradient independently?",
        a: `<p>Because deep weights share the same later-layer factors. Going backward computes each shared error signal <code>δ</code> exactly once and reuses it (memoization), giving roughly one forward + one backward pass instead of recomputing the shared chain for every weight.</p>`
      }
    ],
    connects: `<p>Next: <em>how</em> that gradient is used (the <strong>Gradient Descent</strong> track) and <em>what</em> loss you differentiate (the <strong>Loss Functions</strong> track). Related puzzles: <code>Why residual connections work</code>, <code>Why RNNs forget</code>.</p>`
  },

  {
    id: "loss-functions",
    title: "Rediscovering Loss Functions",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Why square errors sometimes and take logs other times? Derive the 'right' loss for each task from one principle.",
    overview: {
      goal: `See that every common loss is the negative log-likelihood of an assumed output distribution — and derive them.`,
      prerequisites: `Comfort with logs and probabilities; the idea of a model output. The Backprop track helps but isn't required.`,
      objectives: [
        `Explain why MSE secretly assumes Gaussian noise`,
        `Derive binary cross-entropy from maximum likelihood`,
        `Show why softmax + cross-entropy gives the clean gradient (p − y)`,
        `Pick a principled loss for a new output type`
      ],
      time: `20–30 min`
    },
    intro: `<p>Loss functions look like a grab-bag of formulas. They aren't. You'll derive each from a single principle: <strong>a good loss makes the observed data as likely as possible</strong> (maximum likelihood). Pick the right assumption about your output, and the loss falls out on its own.</p>`,
    steps: [
      {
        title: "What makes a loss 'good'?",
        brief: `<p>A loss should be small when right, large when wrong, and smoothly differentiable so we can follow its gradient. A subtle idea: choosing a loss is secretly choosing a model of the <em>noise</em> in your data — and the <strong>maximum-likelihood</strong> principle says "pick parameters that make the observed data most probable."</p>`,
        challenge: `<p>You're predicting a real number (a house price) with noise. Why <em>square</em> the error <code>(ŷ − y)</code> rather than take the absolute value <code>|ŷ − y|</code>? Give one mathematical reason and one modeling reason.</p>`,
        hints: [
          "Think about differentiability at zero.",
          "And think about what noise distribution 'squared error' secretly assumes — what does e^(−error²) look like?"
        ],
        reveal: `<p>Squaring is differentiable everywhere (absolute value has a kink at 0) and penalizes large errors more. The deeper reason: minimizing squared error is exactly maximum likelihood if you assume the target is your prediction plus <strong>Gaussian noise</strong> — the bell curve's <code>e^{−(error)²}</code> becomes <code>(error)²</code> when you take the negative log.</p>`,
        insight: "Mean-squared error isn't arbitrary: it's the maximum-likelihood loss when the target is the prediction plus Gaussian noise. A loss encodes an assumption about the data."
      },
      {
        title: "Now predict a probability",
        brief: `<p>Classification outputs a probability, usually squeezed into [0,1] by a <strong>sigmoid</strong>. A sigmoid is flat (saturated) near 0 and 1, so its derivative there is tiny — which matters for how a loss behaves when the model is confidently wrong.</p>`,
        challenge: `<p>The model outputs <code>p = P(spam)</code> and the label is <code>y ∈ {0,1}</code>. Why is squared error <code>(p − y)²</code> a poor choice? Focus on the gradient when the model is confidently wrong (<code>p = 0.01</code> but <code>y = 1</code>).</p>`,
        hints: [
          "With p from a sigmoid, what happens to the gradient when p is stuck near 0 or 1?",
          "A vanishing gradient exactly when you're most wrong means learning stalls."
        ],
        reveal: `<p>With <code>p</code> from a sigmoid, squared error makes the gradient <em>vanish</em> precisely when the model is confidently wrong (the sigmoid is saturated and flat), so learning stalls at the worst moment. And <code>(p − y)²</code> implicitly assumes Gaussian noise — wrong for a 0/1 label. You want a loss that produces a <em>large</em> signal when confidently wrong.</p>`,
        insight: "The loss must match the nature of the output. For a probability, squared error gives weak gradients exactly when you most need a strong correction."
      },
      {
        title: "Derive the loss from likelihood",
        brief: `<p>Apply maximum likelihood directly: write the probability the model assigns to the <em>actual</em> label, then (because we minimize, and logs turn products into sums) take the negative log. A tidy trick expresses "probability of the true label" in one formula covering both <code>y=0</code> and <code>y=1</code>.</p>`,
        challenge: `<p>If the model says <code>P(y=1) = p</code>, write a single expression for the probability it assigns to the actual label <code>y</code> (valid for both values). Then take the negative log. What loss appears?</p>`,
        hints: [
          "Consider p^y · (1−p)^(1−y): it equals p when y=1 and (1−p) when y=0.",
          "Negative log turns the product into a sum of logs."
        ],
        reveal: `<p>The probability of the true label is <code>p^y · (1 − p)^(1 − y)</code>. Its negative log is <code>L = −[ y·log p + (1 − y)·log(1 − p) ]</code> — <strong>binary cross-entropy</strong>. We didn't invent it; we derived it.</p>`,
        insight: "Cross-entropy is literally the negative log-likelihood of a Bernoulli (yes/no) output — forced by 'make the data likely', not chosen by taste."
      },
      {
        title: "Check its gradient",
        brief: `<p>The real test of a loss is the gradient it produces. Here a small miracle happens when you combine the sigmoid with cross-entropy — recall the sigmoid's derivative is <code>σ'(z) = p(1 − p)</code>.</p>`,
        challenge: `<p>With <code>p = σ(z)</code> and the cross-entropy loss you just derived, compute <code>dL/dz</code>. Watch what cancels.</p>`,
        hints: [
          "Multiply dL/dp by dp/dz = p(1−p).",
          "The p(1−p) factors cancel with the denominators."
        ],
        reveal: `<p><code>dL/dp = −[ y/p − (1 − y)/(1 − p) ]</code> and <code>dp/dz = p(1 − p)</code>. Multiplying and simplifying, the <code>p(1 − p)</code> factors cancel, leaving <code>dL/dz = p − y</code>. That's <em>large</em> exactly when the model is confidently wrong, with no saturation stall — the opposite of squared error.</p>`,
        insight: "Sigmoid + cross-entropy gives the gradient (p − y): a strong signal precisely when the prediction is wrong. That clean pairing is why classification trains well."
      },
      {
        title: "Generalize to many classes",
        brief: `<p>For more than two classes, <strong>softmax</strong> turns a vector of scores into a probability distribution, and the true label is one-hot. The same maximum-likelihood logic should generate the multiclass loss.</p>`,
        challenge: `<p>By the same likelihood principle, what's the natural loss when the model outputs a softmax distribution over <code>K</code> classes? What do you expect its gradient with respect to the logits to be?</p>`,
        hints: [
          "The likelihood of one example is the probability assigned to the correct class.",
          "Expect the same tidy 'predicted − target' gradient."
        ],
        reveal: `<p>The loss is <code>−log(p_correct)</code> — <strong>categorical cross-entropy</strong> — and, exactly as in the binary case, its gradient with respect to the logits is <code>predicted − target</code> (softmax probabilities minus the one-hot label). Same principle, same clean gradient.</p>`,
        insight: "One principle — maximum likelihood — generates them all: Gaussian → MSE, Bernoulli → binary cross-entropy, categorical → cross-entropy. Designing a loss is just: pick the output distribution, take its negative log-likelihood."
      }
    ],
    synthesis: `<p>You rediscovered that loss functions aren't a random collection — each is the <strong>negative log-likelihood of an assumed output distribution</strong>. Gaussian noise → mean-squared error; a binary label → binary cross-entropy; many classes → cross-entropy. And the clean, non-saturating gradients (<code>p − y</code>) that make training work fall out for free.</p>
      <p>So for a new output type, you don't look up a loss — you ask "what distribution does this output follow?" and take its negative log-likelihood.</p>`,
    checkpoints: [
      {
        q: "In one sentence, what <em>is</em> a loss function under the maximum-likelihood view?",
        a: `<p>The negative log-likelihood of the observed data under an assumed output distribution — minimizing it maximizes the probability the model assigns to the real data.</p>`
      },
      {
        q: "Why does cross-entropy train a classifier better than MSE?",
        a: `<p>Softmax/sigmoid + cross-entropy has gradient <code>p − y</code>, which stays large when the model is confidently wrong; MSE's gradient vanishes in the saturated region, so learning stalls exactly when a big correction is needed.</p>`
      }
    ],
    connects: `<p>The "what to differentiate" companion to <strong>Backpropagation</strong> ("how to differentiate") and <strong>Gradient Descent</strong> ("how the gradient is used"). Related puzzles: <code>Why cross-entropy, not MSE, for classification</code>, <code>Why attention uses a softmax</code>.</p>`
  },

  {
    id: "gradient-descent",
    title: "Rediscovering Gradient Descent & the Learning Rate",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Derive how models actually learn — from 'which way is downhill?' to why the step size makes or breaks training.",
    overview: {
      goal: `Derive gradient descent and understand the learning rate well enough to predict overshoot, divergence, and why Adam/warmup/decay exist.`,
      prerequisites: `Derivatives and a little algebra. The Backprop track pairs naturally (it computes the gradient this track uses).`,
      objectives: [
        `Explain why you step in the negative-gradient direction`,
        `Derive the stability limit η < 2/curvature from a simple bowl`,
        `Explain overshoot, divergence, and zig-zagging valleys`,
        `Justify momentum, adaptive optimizers, warmup, and decay`
      ],
      time: `25–35 min`
    },
    intro: `<p>You have a loss to minimize and millions of parameters — you can't try all values. You'll derive gradient descent from one question, "which way should I nudge the parameters to reduce the loss?", and then discover why the <em>step size</em> (learning rate) is the knob everything hinges on. A little algebra makes the mysterious behaviors — overshoot, divergence, zig-zagging — completely predictable.</p>`,
    steps: [
      {
        title: "Which way is downhill?",
        brief: `<p>The derivative <code>dL/dw</code> is a slope: it tells you which way the loss is <em>increasing</em> and how steeply. To reduce the loss you want to move against that.</p>`,
        challenge: `<p>You're at <code>w₀</code> and can compute <code>L</code> and <code>dL/dw</code> there, but can't see the whole curve. Which direction should you move <code>w</code> to <em>decrease</em> <code>L</code>, and how do you know from the derivative alone?</p>`,
        hints: [
          "The derivative's sign tells you the direction of increase.",
          "So step the opposite way."
        ],
        reveal: `<p>Move <em>opposite</em> the sign of the derivative. If <code>dL/dw > 0</code>, the loss rises as <code>w</code> increases, so decrease <code>w</code>; if <code>dL/dw < 0</code>, increase it: <code>w ← w − (step)·(dL/dw)</code>.</p>`,
        insight: "The derivative points toward steepest increase; to descend, step in the negative-gradient direction. That's the core of gradient descent."
      },
      {
        title: "Downhill in a million dimensions",
        brief: `<p>With many parameters, all the partial derivatives collect into one vector, the <strong>gradient</strong> <code>∇L</code>, which points in the direction of steepest ascent in the full space. (Getting <code>∇L</code> efficiently for a neural net is exactly backpropagation.)</p>`,
        challenge: `<p>What single object captures "the steepest downhill direction" across all parameters at once, and how do you update everything simultaneously?</p>`,
        hints: [
          "Collect every ∂L/∂wₖ into a vector.",
          "Subtract a scaled version of it from all parameters."
        ],
        reveal: `<p>The gradient <code>∇L</code> points uphill; descend by subtracting it from every parameter at once: <code>w ← w − η ∇L</code>. Backprop is how you compute <code>∇L</code> for a network.</p>`,
        insight: "In high dimensions the gradient is the steepest-ascent direction; descend by subtracting it from all parameters together. Backprop supplies that gradient."
      },
      {
        title: "How big a step? Meet η",
        brief: `<p>The gradient gives a <em>direction</em>, not a distance. The <strong>learning rate</strong> <code>η</code> scales it into an actual step: <code>w ← w − η ∇L</code>. Everything about training stability lives in this one number.</p>`,
        challenge: `<p>Reason about two extremes: <code>η</code> extremely small, and <code>η</code> extremely large. What goes wrong at each end?</p>`,
        hints: [
          "One extreme barely moves.",
          "The other flies past the minimum — and can keep getting worse."
        ],
        reveal: `<p><strong>η too small:</strong> you inch downhill, needing an impractical number of steps. <strong>η too large:</strong> you overshoot the minimum and land higher up the far wall; steps can grow instead of shrink, and the loss diverges to infinity/NaN. There's a sweet spot between.</p>`,
        insight: "The learning rate turns the gradient direction into a step. Too small crawls; too large overshoots and can diverge. Training is extremely sensitive to it."
      },
      {
        title: "Picture the bowl — why overshoot happens",
        brief: `<p>To make "overshoot" precise, model the loss near a minimum as a bowl <code>L = ½ a w²</code> (<code>a</code> is the curvature). Then <code>dL/dw = a w</code>, and one step becomes a simple multiplication of <code>w</code> by a fixed factor — whose size decides everything.</p>`,
        challenge: `<p>One step gives <code>w ← w − η·a·w = (1 − ηa)·w</code>. For the sequence of <code>w</code> values to shrink toward 0, what must be true of <code>(1 − ηa)</code>? Trace what happens as <code>ηa</code> passes 1, then 2.</p>`,
        diagram: `<svg viewBox="0 0 460 190" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="11">
          <path d="M40 160 Q 230 -10 420 160" fill="none" stroke="#24314a" stroke-width="1.5"/>
          <line x1="230" y1="20" x2="230" y2="170" stroke="#1c2740" stroke-dasharray="3 3"/>
          <text x="230" y="184" fill="#9fb0c9" text-anchor="middle">minimum</text>
          <g fill="#7ef0c0"><circle cx="120" cy="120" r="4"/><circle cx="180" cy="72" r="4"/><circle cx="215" cy="38" r="4"/></g>
          <text x="95" y="112" fill="#7ef0c0">stable: 0&lt;ηa&lt;1</text>
          <g fill="#ff8f8f"><circle cx="110" cy="128" r="4"/><circle cx="350" cy="128" r="4"/><circle cx="70" cy="150" r="4"/></g>
          <text x="300" y="150" fill="#ff8f8f">ηa&gt;2: diverges</text>
        </svg>`,
        hints: [
          "Each step multiplies w by the same factor (1 − ηa).",
          "Repeated multiplication shrinks toward 0 only when the factor's magnitude is below 1."
        ],
        reveal: `<p>Each step multiplies <code>w</code> by <code>(1 − ηa)</code>, so convergence needs <code>|1 − ηa| < 1</code>, i.e. <code>0 < η < 2/a</code>. For <code>0 < ηa < 1</code> it shrinks smoothly; for <code>1 < ηa < 2</code> it flips sign each step but still shrinks (damped oscillation); at <code>ηa = 2</code> it bounces forever; for <code>ηa > 2</code> it <em>grows</em> — divergence.</p>`,
        insight: "Stability requires η < 2/curvature. Overshoot and divergence aren't mysterious — they're what happens when the step exceeds what the curvature allows. The right η depends on the shape of the loss."
      },
      {
        title: "When one η can't fit every direction",
        brief: `<p>Real losses curve sharply in some directions and gently in others — an elongated valley. A single <code>η</code> is bounded by the <em>sharpest</em> direction, which leaves it tiny for the gentle ones.</p>`,
        challenge: `<p>What's the visible symptom of this mismatch, and what kinds of fixes address it?</p>`,
        hints: [
          "Think about progress along the flat direction versus the steep one.",
          "What could give each direction its own effective step size?"
        ],
        reveal: `<p><strong>Symptom:</strong> the sharp direction caps <code>η</code>, so progress along the gentle direction is painfully slow — you zig-zag down a narrow valley. <strong>Fixes:</strong> <em>momentum</em> (a velocity that powers through gentle directions and damps oscillation in sharp ones); <em>adaptive per-parameter rates</em> (AdaGrad/RMSProp/Adam) scaling each direction by its own gradient history; and <em>normalization</em> to even out the curvature.</p>`,
        insight: "A single global step size can't be optimal when curvature differs by direction. Momentum and adaptive optimizers (Adam) effectively give each direction its own learning rate."
      },
      {
        title: "The practical recipe",
        brief: `<p>Everything you derived points to a concrete procedure for choosing and scheduling <code>η</code> — including why practitioners "warm up" then "decay" it.</p>`,
        challenge: `<p>How do you actually choose <code>η</code> in practice, and why warm it up at the start and decay it toward the end?</p>`,
        hints: [
          "You derived a stability ceiling — pick just under it.",
          "Big steps early, careful steps near the bottom."
        ],
        reveal: `<p><strong>Choosing η:</strong> sweep on a log scale (<code>1e-1, 1e-2, 1e-3, …</code>), watch the loss, and take the <em>largest</em> value that still decreases smoothly — fastest without diverging, just under the stability ceiling. <strong>Warmup</strong> avoids early blow-ups when weights/gradients are wild. <strong>Decay</strong> lets you take big steps early and small, careful steps near the minimum — because near the bottom a large step overshoots, exactly as the bowl predicts.</p>`,
        insight: "Pick the largest stable η by scanning a log scale; warm up to avoid early instability and decay to settle in. The whole schedule follows from the stability picture you derived."
      }
    ],
    synthesis: `<p>You rebuilt gradient descent from "which way is downhill?" (the negative gradient) and discovered the learning rate is the step size that turns direction into motion — with a hard stability limit <code>η < 2/curvature</code>. Overshoot, divergence, slow crawling, zig-zagging valleys, and the reasons behind momentum, Adam, warmup, and decay all fall out of that one small bowl calculation.</p>
      <p>The gradient comes from <strong>backpropagation</strong>; <em>what</em> you minimize comes from your <strong>loss function</strong>. Three tracks, one training loop.</p>`,
    checkpoints: [
      {
        q: "From the bowl model <code>L = ½aw²</code>, what is the exact stability condition on <code>η</code>, and what happens just beyond it?",
        a: `<p><code>0 < η < 2/a</code>. For <code>1 < ηa < 2</code> updates oscillate but still converge; at <code>ηa = 2</code> they bounce forever; for <code>ηa > 2</code> the parameter grows and the loss diverges.</p>`
      },
      {
        q: "Why do adaptive optimizers like Adam help on an elongated (anisotropic) loss?",
        a: `<p>A single global <code>η</code> is capped by the sharpest direction, starving the gentle ones. Adam scales each parameter's step by its own gradient history, effectively giving every direction its own learning rate, so you make progress in all of them at once.</p>`
      }
    ],
    connects: `<p>Pairs with <strong>Backpropagation</strong> (computing <code>∇L</code>) and <strong>Loss Functions</strong> (what <code>L</code> is). The same negative-gradient idea reappears as <code>F = −∇U</code> in <strong>Molecular Dynamics</strong>. Related puzzle: <code>Choosing a learning rate</code>.</p>`
  },

  {
    id: "attention",
    title: "Rediscovering Attention",
    category: "ML / AI",
    difficulty: "Core",
    blurb: "Build the mechanism at the heart of every transformer — from 'which words should I look at?' to scaled dot-product multi-head attention.",
    overview: {
      goal: `Derive self-attention from a concrete need, justifying every part: queries, keys, values, softmax, the √d scaling, and multiple heads.`,
      prerequisites: `Vectors and dot products; the softmax idea helps (see the Loss Functions track).`,
      objectives: [
        `Explain attention as a weighted average of other tokens' values`,
        `Say why queries and keys are separate learned projections`,
        `Justify the softmax and the division by √d`,
        `Explain what multiple heads buy you`
      ],
      time: `25–35 min`
    },
    intro: `<p>You'll rebuild self-attention from one simple need: when a model processes a word, it should pull in information from other <em>relevant</em> words. Each step derives a piece — queries, keys, values, the dot-product score, the softmax, the √d scaling, multiple heads — as the answer to a concrete problem. Nothing will be arbitrary.</p>`,
    steps: [
      {
        title: "Why context has to flow between words",
        brief: `<p>A word's meaning depends on its sentence, so a fixed embedding can't be enough — a good representation must <em>mix in</em> information from other words. Suppose you already had a relevance weight <code>w(i,j)</code> between words <code>i</code> and <code>j</code>.</p>`,
        challenge: `<p>In "the animal didn't cross the street because <em>it</em> was too tired," representing "it" requires knowing it means "animal." Given weights <code>w(i,j)</code>, how would you form the new representation of word <code>i</code>?</p>`,
        hints: [
          "Combine the other words' vectors in proportion to relevance.",
          "The weights should sum to 1 — it's an average."
        ],
        reveal: `<p>Make it a <strong>weighted sum</strong>: <code>new_i = Σⱼ w(i,j) · vⱼ</code>, weights summing to 1. The whole mechanism reduces to two questions: how to compute good weights <code>w(i,j)</code>, and which vectors <code>vⱼ</code> to combine.</p>`,
        insight: "A contextual representation is a weighted average of other tokens' information. Attention is the question 'which tokens should I average in, and how much?'"
      },
      {
        title: "Scoring relevance",
        brief: `<p>You need a number measuring how compatible two vectors are, cheaply, for all pairs at once. The <strong>dot product</strong> is large when vectors point the same way and computes for all pairs as a single matrix multiply.</p>`,
        challenge: `<p>Given each word's embedding vector, what simple differentiable operation scores how relevant word <code>j</code> is to word <code>i</code>?</p>`,
        hints: [
          "A single operation on two vectors that's large when they align.",
          "All pairs at once is X·Xᵀ."
        ],
        reveal: `<p>The <strong>dot product</strong>: <code>score(i,j) = xᵢ · xⱼ</code>, large when the vectors align, near zero when orthogonal — and every pair at once is the matrix product <code>X Xᵀ</code>.</p>`,
        insight: "The dot product is a natural, cheap similarity score, and computing it for all token pairs is a single matrix multiply."
      },
      {
        title: "Two roles: queries and keys",
        brief: `<p>Using the raw embedding for both sides forces symmetry and conflates two different roles: what a word is <em>looking for</em> vs. what it <em>offers</em>. Learned linear projections can separate them.</p>`,
        challenge: `<p>"it" <em>seeking</em> its referent is a different role than "animal" <em>being</em> a referent. How do you let each word play both roles and make relevance directional?</p>`,
        hints: [
          "Project each embedding into two different learned spaces.",
          "One for querying, one for being matched against."
        ],
        reveal: `<p>Give each word a <strong>query</strong> <code>qᵢ = W_Q xᵢ</code> (what it's looking for) and a <strong>key</strong> <code>kⱼ = W_K xⱼ</code> (what it offers). The score becomes <code>qᵢ · kⱼ</code> — asymmetric and role-specific — and the model learns <code>W_Q, W_K</code>.</p>`,
        insight: "Separating the 'query' (what I seek) from the 'key' (what I offer) via learned projections makes attention directional and lets the model learn what matters."
      },
      {
        title: "What actually gets passed: values",
        brief: `<p>Matching on a vector and delivering content are different jobs. Once word <code>i</code> decides <code>j</code> is relevant, the information it mixes in can be its own separate projection.</p>`,
        challenge: `<p>Should the content retrieved from <code>j</code> be the same vector used for matching (the key), or something separate? Introduce whatever you need.</p>`,
        hints: [
          "Give 'content to deliver' its own projection.",
          "Now you have three projections."
        ],
        reveal: `<p>Use a third projection, the <strong>value</strong> <code>vⱼ = W_V xⱼ</code>. The output is <code>outputᵢ = Σⱼ softmax_j(qᵢ · kⱼ) · vⱼ</code> — the full Q, K, V trio, each a distinct learned role.</p>`,
        insight: "The content you retrieve (value) is decoupled from the content you match on (key). Three projections — Q, K, V — each serve a distinct role."
      },
      {
        title: "Normalizing the weights (and the √d trick)",
        brief: `<p>Weights for a weighted average must be non-negative and sum to 1 — that's what <strong>softmax</strong> produces. But there's a scale trap: the dot product of two <code>d</code>-dimensional vectors typically grows with <code>d</code>, which pushes softmax into its flat, saturated region.</p>`,
        challenge: `<p>What function turns arbitrary scores into valid weights? And if the query/key dimension is <code>d</code>, what simple rescaling keeps the scores from blowing up (and stalling gradients)?</p>`,
        hints: [
          "Softmax gives a probability distribution.",
          "What is the standard deviation of a dot product of two ~unit-variance vectors of dimension d?"
        ],
        reveal: `<p>Apply <strong>softmax</strong> over <code>j</code>, and divide scores by <code>√d</code> first: <code>Attention = softmax(QKᵀ / √d) · V</code>. Why <code>√d</code>: with roughly independent unit-variance entries, <code>q · k</code> is a sum of <code>d</code> terms with variance <code>~d</code>, so standard deviation <code>~√d</code>. Dividing by <code>√d</code> renormalizes to variance <code>~1</code>, keeping softmax sensitive with healthy gradients.</p>`,
        insight: "Softmax converts scores into a differentiable probability distribution; dividing by √d stops the dot products from growing with dimension and stalling gradients. That's scaled dot-product attention."
      },
      {
        title: "Many relationships at once: multiple heads",
        brief: `<p>One Q/K/V lets each word attend a single way, but words often need to track several relationships simultaneously (referent, subject, position…). Running attention several times in parallel lets each copy specialize.</p>`,
        challenge: `<p>How can the model attend to several kinds of relationships at once, without just building one giant attention?</p>`,
        hints: [
          "Run several smaller attentions in parallel.",
          "Then combine their outputs."
        ],
        reveal: `<p>Use <strong>multiple heads</strong>: several attention operations in parallel, each with its own smaller <code>W_Q, W_K, W_V</code>, then concatenate their outputs and project. Each head can specialize — coreference, syntax, position — and concatenation fuses these perspectives.</p>`,
        insight: "Multiple parallel heads let the model attend to several types of relationships at once; concatenating their outputs combines those perspectives."
      }
    ],
    synthesis: `<p>You built self-attention from scratch. A contextual representation is a weighted average of other tokens' <strong>values</strong>; the weights come from <strong>query · key</strong> similarity, normalized by <strong>softmax</strong> and scaled by <strong>√d</strong>; and multiple <strong>heads</strong> capture multiple relationship types in parallel. Stack this with feed-forward layers, residual connections, and normalization, and you have a transformer block.</p>
      <p>Every design choice answered a concrete need. And attention connects <em>any</em> two positions with a direct path — exactly why transformers train and scale where recurrent networks struggle.</p>`,
    checkpoints: [
      {
        q: "Why divide the attention scores by <code>√d</code> before the softmax?",
        a: `<p>A dot product of two <code>d</code>-dimensional unit-variance vectors has standard deviation <code>~√d</code>. Without rescaling, large <code>d</code> produces huge scores that saturate the softmax (near one-hot), killing gradients. Dividing by <code>√d</code> keeps the scores at variance <code>~1</code> and the softmax responsive.</p>`
      },
      {
        q: "Why are queries, keys, and values three separate projections rather than one shared vector?",
        a: `<p>They serve three different roles: what a token is looking for (query), what it offers to be matched against (key), and the content it contributes when selected (value). Separating them makes relevance directional and lets the model learn each role independently.</p>`
      }
    ],
    connects: `<p>Related puzzles: <code>Why attention uses a softmax</code>, <code>Why RNNs forget, and how attention fixes it</code>, <code>Why residual connections work</code>. The <strong>Backpropagation</strong> track shows how these learned projections get trained.</p>`
  },

  {
    id: "molecular-dynamics",
    title: "Rediscovering Molecular Dynamics",
    category: "Biology",
    difficulty: "Core",
    blurb: "Build the simulation that makes atoms move — force fields, Newton's laws, and the integrator behind protein-folding and drug-binding studies.",
    overview: {
      goal: `Derive how a molecular dynamics simulation computes atomic motion, and why it's stable, accurate, and expensive.`,
      prerequisites: `Newton's second law (F = ma) and the idea of a derivative/gradient. The Gradient Descent track's F = −∇U echo helps.`,
      objectives: [
        `Turn a potential energy function into forces with F = −∇U`,
        `Explain why naive (Euler) integration blows up and velocity Verlet doesn't`,
        `Describe a force field: springs, Lennard-Jones, Coulomb`,
        `Connect temperature to kinetic energy and explain the femtosecond timestep`
      ],
      time: `30–40 min`
    },
    intro: `<p>How do biologists watch a protein wiggle, fold, or bind a drug — atom by atom — when there's no equation you can solve for thousands of interacting atoms? You simulate. You'll rebuild molecular dynamics (MD) piece by piece: model the energy, turn it into forces, and march the atoms forward in time. Along the way you'll meet the same two ideas from the Gradient Descent track — the negative gradient, and a stability limit on step size.</p>`,
    steps: [
      {
        title: "The many-body problem",
        brief: `<p>Newton's laws fully determine how particles move, and for two bodies (say a planet and star) you can even write the orbit as a formula. But for three or more mutually interacting bodies there is <em>no</em> general closed-form solution — and a protein has thousands of atoms all pulling on each other.</p>`,
        challenge: `<p>If you can't solve the motion of thousands of interacting atoms analytically, what's the alternative — and what must you know at every instant to do it?</p>`,
        hints: [
          "You can't get a formula, but you can advance the system a tiny bit at a time.",
          "To advance each atom you need the total force on it right now."
        ],
        reveal: `<p>You <strong>simulate numerically</strong>: start from positions and velocities and step forward in tiny time increments, recomputing motion as you go. To take each step you need, at that instant, the <strong>force on every atom</strong>. So MD reduces to two problems: (1) get the forces, and (2) step time forward stably.</p>`,
        insight: "Molecular dynamics numerically integrates Newton's equations because the many-body problem has no closed form. The two crucial pieces are computing forces and stepping time."
      },
      {
        title: "Force from a potential",
        brief: `<p>Atoms interact through a <strong>potential energy</strong> function <code>U</code> that depends on all their positions — think of a landscape of hills and valleys in configuration space. A conservative force is minus the slope of that landscape: <code>F = −∇U</code> (in 1-D, <code>F = −dU/dr</code>).</p>`,
        challenge: `<p>Two atoms have potential energy <code>U(r)</code> as a function of their separation <code>r</code>. What is the force between them, and which way does it point where <code>U</code> is decreasing with <code>r</code>?</p>`,
        hints: [
          "Force is the negative derivative of energy.",
          "'Downhill in energy' is the direction the force pushes."
        ],
        reveal: `<p>The force has magnitude <code>|dU/dr|</code> and points "downhill" in energy: <code>F = −dU/dr</code> along the line joining the atoms. Where <code>U</code> decreases with <code>r</code> (<code>dU/dr < 0</code>), the force is positive — pushing the atoms apart toward lower energy. Atoms are always driven toward lower potential energy.</p>`,
        insight: "Forces come from the slope of the energy landscape: F = −∇U converts an energy function into the forces that drive motion — the same negative-gradient idea as gradient descent."
      },
      {
        title: "From force to motion",
        brief: `<p>Newton's second law, <code>a = F/m</code>, converts the force on each atom into its acceleration. But acceleration is only the second derivative of position — a single snapshot isn't a trajectory.</p>`,
        challenge: `<p>Given the forces at this instant, how do you get each atom's acceleration — and is knowing the acceleration right now enough to know where the atom will be next?</p>`,
        hints: [
          "Divide force by mass.",
          "Acceleration changes velocity, which changes position — you must accumulate over time."
        ],
        reveal: `<p><code>a = F/m</code> gives the acceleration. But that's just the instantaneous second derivative of position; to get a trajectory you must <em>integrate</em> acceleration into velocity and velocity into position over time. A snapshot of <code>a</code> isn't enough — you must step forward.</p>`,
        insight: "Forces give accelerations via a = F/m, but trajectories require integrating acceleration → velocity → position over time."
      },
      {
        title: "Discretize time — and watch Euler fail",
        brief: `<p>You can't integrate continuously, so chop time into small steps <code>Δt</code> and update. The simplest scheme, <strong>Euler</strong>, uses the current acceleration: <code>v ← v + a·Δt</code>, then <code>x ← x + v·Δt</code>. Simple — but does it respect physics?</p>`,
        challenge: `<p>Apply Euler to a mass on a spring (a harmonic oscillator, <code>a = −ω²x</code>) and reason about its <em>total energy</em> over many steps. What goes wrong?</p>`,
        hints: [
          "A real oscillator conserves energy — amplitude stays constant.",
          "Does forward Euler keep the amplitude constant, or does it creep?"
        ],
        reveal: `<p>Forward Euler systematically <em>adds</em> energy each step: the oscillator's amplitude grows and the total energy spirals upward — unphysical, and eventually it blows up. The scheme isn't <em>time-reversible</em> (run it backward and you don't retrace your path), so errors accumulate in one direction instead of cancelling.</p>`,
        insight: "Naive integration violates energy conservation; a good MD integrator must respect the time-reversibility (symplectic structure) of Newtonian motion."
      },
      {
        title: "Velocity Verlet — the fix",
        brief: `<p>MD uses the <strong>Verlet</strong> family, which is time-reversible and conserves energy well over long runs. Velocity Verlet advances position with the current velocity and a half-step of acceleration, computes the <em>new</em> force there, then updates velocity using the <em>average</em> of the old and new accelerations.</p>`,
        challenge: `<p>Write the velocity Verlet update for <code>x</code> and <code>v</code>, given current <code>x, v, a</code> (and that you can compute the new acceleration from the new position). Why does averaging old and new accelerations help?</p>`,
        hints: [
          "Position update looks like the kinematics formula x + vΔt + ½aΔt².",
          "Then recompute a at the new position and average it with the old for the velocity update."
        ],
        reveal: `<p><code>x(t+Δt) = x + vΔt + ½ a Δt²</code>; compute <code>a(t+Δt)</code> from the new <code>x</code>; then <code>v(t+Δt) = v + ½[a + a(t+Δt)]Δt</code>. Using the symmetric average of accelerations makes the update <strong>time-reversible</strong> — run it backward and it retraces exactly — so energy errors stay <em>bounded</em> (they oscillate) instead of accumulating. That's why Verlet, not Euler, is the workhorse.</p>`,
        insight: "Velocity Verlet's time-symmetric update conserves energy over long runs because it respects the reversibility of Newtonian physics — the right tool for the structure of the problem."
      },
      {
        title: "Where forces come from: the force field",
        brief: `<p>We still need <code>U</code>. Solving quantum mechanics for every atom is far too expensive, so MD models <code>U</code> as a sum of simple classical terms — a <strong>force field</strong>: bonds and angles as springs (Hooke's law, <code>U = ½k(r−r₀)²</code>), plus non-bonded van der Waals and electrostatic terms.</p>`,
        challenge: `<p>(a) For a bond modeled as a spring, what's the force? (b) Two neutral atoms attract weakly at a distance but repel hard when pushed too close — propose a shape for <code>U(r)</code> capturing both, and reason about the exponents.</p>`,
        diagram: `<svg viewBox="0 0 460 200" xmlns="http://www.w3.org/2000/svg" font-family="monospace" font-size="11">
          <line x1="45" y1="120" x2="445" y2="120" stroke="#1c2740" stroke-dasharray="4 4"/>
          <text x="450" y="118" fill="#6c7d99" text-anchor="end">U=0</text>
          <line x1="55" y1="15" x2="55" y2="185" stroke="#24314a"/>
          <text x="60" y="24" fill="#9fb0c9">U(r)</text>
          <text x="435" y="140" fill="#9fb0c9" text-anchor="end">r →</text>
          <path d="M70 20 C 92 150, 108 172, 150 172 C 210 172, 300 128, 445 123" fill="none" stroke="#7ef0c0" stroke-width="2"/>
          <circle cx="150" cy="172" r="3.5" fill="#ffcf7a"/>
          <text x="150" y="190" fill="#ffcf7a" text-anchor="middle">minimum (−ε)</text>
          <text x="92" y="40" fill="#ff8f8f">repulsion r⁻¹²</text>
          <text x="330" y="112" fill="#6ea8fe">attraction r⁻⁶</text>
        </svg>`,
        hints: [
          "For the spring, force is the negative derivative of ½k(r−r₀)².",
          "Attraction is a physically-grounded r⁻⁶ (dispersion); repulsion needs a steeper term — a computationally convenient choice is its square."
        ],
        reveal: `<p>(a) Bond force = <code>−k(r − r₀)</code> (Hooke's law) — a restoring spring. (b) The <strong>Lennard-Jones</strong> potential <code>U = 4ε[(σ/r)¹² − (σ/r)⁶]</code>: the <code>−(σ/r)⁶</code> term is the physically-grounded attractive dispersion (London) force; the <code>+(σ/r)¹²</code> term is a steep repulsion (Pauli exclusion), chosen partly because it's just the square of the <code>r⁻⁶</code> term and thus cheap to compute. Charged atoms add a Coulomb term <code>q₁q₂/r</code>.</p>`,
        insight: "A force field decomposes a hopelessly complex quantum interaction into a sum of simple, tunable classical terms — springs for bonds, Lennard-Jones for van der Waals, Coulomb for charges."
      },
      {
        title: "Temperature, and why the timestep is tiny",
        brief: `<p>Temperature isn't separate from the motion — it <em>is</em> the average kinetic energy. Equipartition says each degree of freedom carries <code>½k_B T</code> of energy on average. Separately, numerical stability caps how big <code>Δt</code> can be.</p>`,
        challenge: `<p>(a) Relate temperature to the atoms' speeds. (b) The fastest motion is a C–H bond vibrating with period <code>~10 fs</code>. What does that force about <code>Δt</code>, and why — recall the learning-rate stability limit?</p>`,
        hints: [
          "Set average kinetic energy equal to the equipartition value.",
          "Δt must be a small fraction of the fastest oscillation, or the integrator overshoots it (same as too-large a learning rate)."
        ],
        reveal: `<p>(a) By equipartition, <code>⟨½mv²⟩ = (3/2)k_B T</code> for an atom's three translational degrees of freedom — temperature is literally average kinetic energy, and thermostats add/remove kinetic energy to hold <code>T</code>. (b) <code>Δt</code> must be a fraction of the fastest vibration (~1 fs, about a tenth of the 10 fs bond period); larger and the integrator overshoots the bond's motion and energy diverges — the same "step exceeds the curvature limit" instability as an over-large learning rate. That's why reaching even a microsecond takes <em>billions</em> of steps, making MD compute-hungry.</p>`,
        insight: "Temperature is average kinetic energy (equipartition), and the timestep is capped by the fastest bond vibration — the same stability ceiling as a learning rate — which is why MD is so expensive."
      }
    ],
    synthesis: `<p>You rebuilt molecular dynamics end to end: model the energy landscape <code>U</code> with a <strong>force field</strong> (springs + Lennard-Jones + Coulomb), turn it into forces with <code>F = −∇U</code>, get accelerations from <code>a = F/m</code>, and march the atoms forward with a time-reversible integrator (<strong>velocity Verlet</strong>) using a timestep small enough to resolve the fastest bond vibration. Temperature is just average kinetic energy.</p>
      <p>This is how modern structural biology, drug-binding studies, and protein-folding simulations actually compute motion — and why they need enormous compute. Notice the deep echoes with machine learning: <code>F = −∇U</code> is the same negative-gradient idea as gradient descent, and the <code>Δt</code> stability limit is the same as the learning-rate ceiling. The folding funnel from <code>Levinthal's paradox</code> is a picture of this very energy landscape.</p>`,
    checkpoints: [
      {
        q: "Why can't you just use a much larger timestep to reach biological timescales faster?",
        a: `<p>Stability. <code>Δt</code> must resolve the fastest motion — bond vibrations on the order of a femtosecond. Too large and the integrator overshoots the vibration and the energy diverges (blows up), exactly like a too-large learning rate exceeding the curvature limit. So you're stuck with ~fs steps and billions of them.</p>`
      },
      {
        q: "What does the negative sign in <code>F = −∇U</code> mean physically, and where have you seen the same idea?",
        a: `<p>The force points toward <em>decreasing</em> potential energy — "downhill" on the energy landscape. It's the same negative-gradient-descends idea as gradient descent, where parameters move downhill on the loss.</p>`
      },
      {
        q: "Why velocity Verlet instead of simple Euler integration?",
        a: `<p>Velocity Verlet is time-reversible (symplectic), so energy errors stay bounded and oscillate rather than accumulate. Forward Euler is not reversible; it injects energy each step, so an oscillator's amplitude grows and the simulation eventually blows up.</p>`
      }
    ],
    connects: `<p>Shares its core with <strong>Gradient Descent</strong> (<code>F = −∇U</code> and the step-size stability limit). Related puzzles: <code>Levinthal's paradox</code> (the folding energy landscape), <code>The bacteria that fill the jar at noon</code> and <code>Why PCR is exponential</code> (thinking about scale), <code>Aligning two DNA sequences</code> (computational biology).</p>`
  },

  {
    id: "dynamic-programming",
    title: "Rediscovering Dynamic Programming",
    category: "Algorithms",
    difficulty: "Core",
    blurb: "DP feels like magic until you watch a naive recursion waste itself. Then the technique becomes obvious.",
    overview: {
      goal: `Rediscover dynamic programming so you can invent a DP solution, not recall one.`,
      prerequisites: `Basic recursion and Big-O intuition (the Big-O track pairs well).`,
      objectives: [
        `Explain why naive recursion is exponential`,
        `Turn it linear with memoization, then tabulation`,
        `State the two conditions that make DP apply`,
        `Recognize the DP skeleton in a new problem`
      ],
      time: `20–30 min`
    },
    intro: `<p>Dynamic programming has a reputation for being hard to "see." You'll rediscover it the natural way: write an honest recursion, watch it explode with repeated work, and then fix exactly that waste. The technique isn't a trick to memorize — it's the obvious response to a problem you'll feel firsthand.</p>`,
    steps: [
      {
        title: "Watch a recursion explode",
        brief: `<p>Recursion solves a problem by calling itself on smaller inputs. For Fibonacci, <code>F(n) = F(n−1) + F(n−2)</code> — but each call spawns two more, so the call <em>tree</em> branches.</p>`,
        challenge: `<p>Trace the recursive calls to compute <code>F(6)</code> (with <code>F(0)=0, F(1)=1</code>). Roughly how does the number of calls grow with <code>n</code>, and how many times is <code>F(2)</code> computed?</p>`,
        hints: [
          "Draw the call tree; every F(k) splits into F(k−1) and F(k−2).",
          "Count how often the small values reappear."
        ],
        reveal: `<p>The call tree branches at every node, so calls grow <em>exponentially</em> (about <code>1.6ⁿ</code>). Computing <code>F(6)</code> calls <code>F(2)</code> five times, <code>F(3)</code> three times, and so on — the algorithm keeps re-deriving the same small answers.</p>`,
        insight: "Naive recursion recomputes identical subproblems over and over — that redundant work is the entire source of the exponential blow-up."
      },
      {
        title: "How many distinct subproblems really?",
        brief: `<p>The number of <em>calls</em> and the number of <em>distinct questions</em> being asked are not the same thing. Separate them.</p>`,
        challenge: `<p>Exponentially many calls are made — but how many <em>distinct</em> subproblems actually exist when computing <code>F(n)</code>?</p>`,
        hints: [
          "List the different arguments F is ever called with."
        ],
        reveal: `<p>Only <code>n + 1</code> distinct subproblems: <code>F(0), …, F(n)</code>. The exponential explosion is entirely recomputation of these few values — a huge gap between calls (exponential) and distinct questions (linear).</p>`,
        insight: "When distinct subproblems are few but calls are many, you're recomputing. Store each answer once and the waste disappears."
      },
      {
        title: "Remember what you compute (memoization)",
        brief: `<p><strong>Memoization</strong> keeps the same recursion but adds a cache: before computing a subproblem, check whether you've already solved it.</p>`,
        challenge: `<p>Add a cache to the Fibonacci recursion (check-store-return). What's the new time complexity, and why?</p>`,
        hints: [
          "Each distinct subproblem now does real work only once; the rest are cache hits."
        ],
        reveal: `<p>Each of the <code>n + 1</code> subproblems is computed once (later requests hit the cache), so time drops from exponential to <strong>O(n)</strong>. This is top-down memoization: the same recursion plus a memory of answers.</p>`,
        insight: "Caching subproblem answers (memoization) collapses exponential work to linear whenever subproblems overlap. That's the heart of dynamic programming."
      },
      {
        title: "Turn it around (tabulation)",
        brief: `<p>If subproblems have a natural order, you can skip recursion entirely and fill answers <strong>bottom-up</strong> in a table — often needing far less memory.</p>`,
        challenge: `<p>Fill <code>F</code> from <code>F(0)</code> upward in an array. Once you do, how much do you actually need to keep in memory at any moment?</p>`,
        hints: [
          "Each F(k) needs only the two values before it."
        ],
        reveal: `<p>Fill <code>dp[0..n]</code> iteratively, each entry from the two before it — no recursion. And since only the previous two values matter, two rolling variables suffice: <strong>O(1) extra space</strong>. This bottom-up form is tabulation.</p>`,
        insight: "When subproblems have a natural ordering, build answers bottom-up (tabulation), often shrinking memory dramatically by keeping only what the next step needs."
      },
      {
        title: "State the two conditions",
        brief: `<p>Step back: the whole approach relied on two structural properties. Naming them tells you exactly when DP is the right tool.</p>`,
        challenge: `<p>What two properties must a problem have for this approach to work? You relied on both.</p>`,
        hints: [
          "One is about subproblems repeating.",
          "The other is about the answer being built from sub-answers."
        ],
        reveal: `<p>(1) <strong>Overlapping subproblems</strong> — the same sub-answers recur, so caching pays off. (2) <strong>Optimal substructure</strong> — the whole answer is built from answers to subproblems, so combining them is valid. Fibonacci had both; so does any problem DP solves.</p>`,
        insight: "Dynamic programming applies exactly when you have overlapping subproblems AND optimal substructure. Spotting those two is the trigger — then the technique writes itself."
      },
      {
        title: "Recognize it in the wild",
        brief: `<p>The point of naming the pattern is to spot it elsewhere. Recall the sequence-alignment puzzle (aligning two DNA strings in a grid).</p>`,
        challenge: `<p>What were the subproblems in sequence alignment, and why did DP apply there too? Name the subproblem precisely.</p>`,
        hints: [
          "Think about aligning prefixes of the two strings.",
          "Each grid cell was built from a few smaller cells."
        ],
        reveal: `<p>The subproblem was "best alignment score of the first <code>i</code> letters of A with the first <code>j</code> of B." Each cell is built from three smaller cells (<code>(i−1,j−1), (i−1,j), (i,j−1)</code>) — optimal substructure — and those cells are reused by many larger ones — overlapping subproblems. Same skeleton as Fibonacci, in a 2-D table.</p>`,
        insight: "Sequence alignment, edit distance, knapsack, shortest paths — all share the DP skeleton. You now recognize the pattern itself, not each solution separately."
      }
    ],
    synthesis: `<p>You rebuilt dynamic programming from the ground up: write the honest recursion, notice it recomputes the same subproblems, cache them (<strong>memoization</strong>), and optionally rebuild bottom-up (<strong>tabulation</strong>) to save space. The trigger for reaching for DP is simply spotting <strong>overlapping subproblems + optimal substructure</strong>.</p>
      <p>Because you derived it from the waste it removes, you can now invent a DP solution to a new problem rather than trying to recall one.</p>`,
    checkpoints: [
      {
        q: "What two properties must a problem have for dynamic programming to apply?",
        a: `<p>Overlapping subproblems (the same sub-answers recur, so caching helps) and optimal substructure (the full answer is built from optimal answers to subproblems).</p>`
      },
      {
        q: "Memoization and tabulation both make Fibonacci O(n). How do they differ?",
        a: `<p>Memoization is top-down: keep the recursion but cache results. Tabulation is bottom-up: fill a table from base cases upward, no recursion — and it often reduces memory (here to O(1) by keeping only the last two values).</p>`
      }
    ],
    connects: `<p>The reuse-of-subresults idea is the same one that makes <strong>Backpropagation</strong> efficient (caching the error signal δ). Related puzzles: <code>Aligning two DNA sequences</code>, <code>Sample from a stream you can't store</code>.</p>`
  },

  {
    id: "big-o",
    title: "Rediscovering Big-O",
    category: "Algorithms",
    difficulty: "Core",
    blurb: "Build algorithmic complexity from 'how does the work grow as the input grows?' — the language for reasoning about scale.",
    overview: {
      goal: `Rediscover Big-O so you can predict whether an algorithm survives at scale, and read complexity straight off code.`,
      prerequisites: `None — start here. Loops and basic algebra are enough.`,
      objectives: [
        `Analyze cost as operations vs input size, not seconds`,
        `Reduce an expression to its dominant term`,
        `Read O(n), O(n²), O(log n) off loop structure`,
        `Explain why complexity class beats constant-factor tuning`
      ],
      time: `20–30 min`
    },
    intro: `<p>Big-O is how we talk about whether an algorithm will still work when the input gets large. You'll rediscover it by timing algorithms in your head — counting operations as the input grows — then throwing away everything that doesn't matter at scale, until what's left is exactly the notation.</p>`,
    steps: [
      {
        title: "Count operations, not seconds",
        brief: `<p>Wall-clock time depends on the machine, language, and load — not just the algorithm. To compare algorithms fairly you need a machine-independent measure.</p>`,
        challenge: `<p>What machine-independent quantity should you count instead of time, and as a function of what?</p>`,
        hints: [
          "Count the fundamental work.",
          "Express it in terms of how big the input is."
        ],
        reveal: `<p>Count <strong>basic operations</strong> as a function of the <strong>input size <code>n</code></strong>. Summing an array of <code>n</code> numbers does about <code>n</code> additions — regardless of the computer.</p>`,
        insight: "Analyze cost as a count of basic operations versus input size n, not wall-clock time — that abstracts away the machine and exposes how work scales."
      },
      {
        title: "Only the growth rate survives",
        brief: `<p>As <code>n</code> grows, different terms in an operation count grow at wildly different rates. One term eventually dwarfs the rest.</p>`,
        challenge: `<p>Algorithm A does <code>100n + 5</code> operations; algorithm B does <code>2n²</code>. At <code>n=1</code>, A does 105 and B does 2. Which do you prefer for <em>large</em> <code>n</code>, and why do the <code>100</code> and <code>+5</code> stop mattering?</p>`,
        hints: [
          "Compute both at n = 1000 and see which runs away."
        ],
        reveal: `<p>Prefer A. At <code>n=1000</code>: A ≈ 100,000 but B = 2,000,000, and the gap only widens — <code>n²</code> outgrows any linear term regardless of constants. As <code>n→∞</code> the highest-order term dominates; constants and lower-order terms become negligible. So keep only the dominant term: A is <code>O(n)</code>, B is <code>O(n²)</code>.</p>`,
        insight: "At scale, only the fastest-growing term matters; constant factors and lower-order terms wash out. Big-O keeps just the dominant growth term."
      },
      {
        title: "Pin down the definition",
        brief: `<p>Now make "grows no faster than" precise. The formal definition has two clauses, and each earns its keep.</p>`,
        challenge: `<p>We say <code>f(n) = O(g(n))</code> if, beyond some point, <code>f</code> is at most a constant multiple of <code>g</code>. Why do we need both the "constant multiple" part and the "beyond some point" part?</p>`,
        hints: [
          "One clause lets you ignore machine-dependent constants.",
          "The other lets you ignore small-n quirks."
        ],
        reveal: `<p><code>f(n) = O(g(n))</code> means there exist <code>c > 0</code> and <code>n₀</code> with <code>f(n) ≤ c·g(n)</code> for all <code>n ≥ n₀</code>. The constant <code>c</code> lets us ignore machine factors (a 2× faster CPU shouldn't change the class); the threshold <code>n₀</code> lets us ignore small-<code>n</code> quirks and focus on asymptotics. It's an upper bound on growth rate.</p>`,
        insight: "O(g(n)) means 'eventually bounded above by a constant times g(n)' — an asymptotic upper bound that deliberately ignores constants and small inputs."
      },
      {
        title: "Read it straight off the loops",
        brief: `<p>You rarely need the formal definition to get the class — the loop structure usually tells you directly.</p>`,
        challenge: `<p>Estimate the Big-O of: (a) one loop over <code>n</code> items; (b) a loop over <code>n</code> nested inside another loop over <code>n</code>; (c) a process that halves the remaining problem each step until one item is left.</p>`,
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
        hints: [
          "Sequential work adds; nested loops multiply.",
          "Repeated halving is a logarithm."
        ],
        reveal: `<p>(a) <code>O(n)</code>; (b) <code>O(n²)</code> — <code>n</code> times <code>n</code>; (c) <code>O(log n)</code> — halving <code>n</code> repeatedly takes about <code>log₂ n</code> steps to reach 1 (binary search, and the same information-halving intuition as the coin-weighing puzzles). Nested loops multiply; repeatedly dividing the problem gives logarithms.</p>`,
        insight: "You can usually read Big-O off the structure: sequential work adds, nested loops multiply, and repeatedly halving the problem gives log n."
      },
      {
        title: "Why the class beats the code",
        brief: `<p>Since Big-O ignores constants, a natural worry is whether it's too coarse to matter. At scale, the opposite is true.</p>`,
        challenge: `<p>One engineer shaves 50% off the constant of an <code>O(n²)</code> algorithm; another swaps in an <code>O(n log n)</code> one with no tuning. At <code>n = 1,000,000</code>, who wins, and roughly by how much?</p>`,
        hints: [
          "Plug in n = 10⁶: compare n², ½n², and n·log n."
        ],
        reveal: `<p>The <code>O(n log n)</code> algorithm wins overwhelmingly. At <code>n = 10⁶</code>: <code>n² = 10¹²</code> while <code>n·log₂ n ≈ 2×10⁷</code> — about <strong>50,000× fewer operations</strong>. Halving the <code>n²</code> constant still leaves <code>5×10¹¹</code>, utterly dwarfed. A lower complexity class beats any constant-factor tuning at scale.</p>`,
        insight: "Improving the complexity class dominates constant-factor optimization for large inputs. That's why 'what's the Big-O?' is the first question, not 'how fast is the code?'"
      },
      {
        title: "Know the limits of the model",
        brief: `<p>Big-O is powerful but deliberately lossy. Two cautions keep you from over-trusting it.</p>`,
        challenge: `<p>(a) Big-O is usually the worst case — how can the same algorithm have different bounds? (b) It hides constants — so is an <code>O(n)</code> algorithm <em>always</em> better in practice than an <code>O(n log n)</code> one?</p>`,
        hints: [
          "Think quicksort's average vs worst case.",
          "And think about small n and cache/memory effects."
        ],
        reveal: `<p>(a) Always state the case: quicksort is <code>O(n log n)</code> average but <code>O(n²)</code> worst — same algorithm, different inputs. (b) Not always: because Big-O drops constants and lower-order terms, for small/moderate <code>n</code> a low-constant <code>O(n log n)</code> can beat a high-constant <code>O(n)</code>, and cache/memory behavior can dominate real speed. Big-O predicts <em>scaling</em>, not absolute speed — choose the class with it, then measure to tune.</p>`,
        insight: "Big-O is an asymptotic, usually worst-case, constant-free model — the right tool for reasoning about scale, but you still measure real inputs for constants, cache effects, and small-n behavior."
      }
    ],
    synthesis: `<p>You rebuilt Big-O from the ground up: count operations versus input size, keep only the dominant term, formalize it as "eventually <code>≤ c·g(n)</code>", read it off loops, and land on the punchline that complexity <em>class</em> beats constant-factor tuning at scale. It's the vocabulary for predicting whether something survives as <code>n</code> grows — the first question to ask about any algorithm — while remembering it deliberately ignores constants, so you still measure.</p>`,
    checkpoints: [
      {
        q: "Give the formal meaning of <code>f(n) = O(g(n))</code>, and say why each clause exists.",
        a: `<p>There exist constants <code>c > 0</code> and <code>n₀</code> such that <code>f(n) ≤ c·g(n)</code> for all <code>n ≥ n₀</code>. The constant <code>c</code> ignores machine-dependent factors; the threshold <code>n₀</code> ignores small-<code>n</code> quirks so we capture asymptotic growth.</p>`
      },
      {
        q: "Why is switching from O(n²) to O(n log n) worth more than halving the constant of the O(n²)?",
        a: `<p>At large <code>n</code> the class dominates: at <code>n = 10⁶</code>, <code>n log n ≈ 2×10⁷</code> versus <code>n² = 10¹²</code> (≈50,000× fewer ops). Halving the <code>n²</code> constant still leaves <code>5×10¹¹</code> — the growth rate, not the constant, decides at scale.</p>`
      }
    ],
    connects: `<p>Related puzzles: <code>Why comparison sorting can't beat n log n</code> (a Big-O lower bound), <code>Twelve coins, one fake, three weighings</code> and <code>Trailing zeros of 100!</code> (logs and bottlenecks). The <strong>Dynamic Programming</strong> track turns exponential into polynomial.</p>`
  }
];
