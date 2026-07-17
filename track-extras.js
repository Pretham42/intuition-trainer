/*
 * Intuition Trainer — per-step enhancements for Discovery Tracks (Brilliant-style).
 * Non-invasive: keyed by track id → step index, adds an `interactive` figure key
 * (see interactives.js) and/or `quiz` (multiple-choice with feedback). app.js merges
 * these into each step at render time and gates progression on answering the checks.
 *
 * quiz = { question(HTML), options:[{text(HTML), correct:bool, feedback(HTML)}], explain(HTML) }
 */
const TRACK_EXTRAS = {
  "backprop": {
    steps: {
      0: {
        interactive: "chain-rule",
        quiz: {
          question: `With <code>y = 3x</code> and <code>z = y²</code>, what is <code>dz/dx</code> at <code>x = 2</code>?`,
          options: [
            { text: `<code>36</code>`, correct: true, feedback: `dz/dx = (dz/dy)(dy/dx) = (2y)(3) = 18x = 36 at x=2.` },
            { text: `<code>6</code>`, correct: false, feedback: `That's just 3 × 2; you dropped the local rate dz/dy = 2y.` },
            { text: `<code>12</code>`, correct: false, feedback: `That's 2y at y=6, but you dropped the ×3 from y = 3x.` },
            { text: `<code>9</code>`, correct: false, feedback: `That's 3², which ignores the squaring step's rate 2y.` }
          ],
          explain: `The local rates multiply along the chain — that's the whole idea of the chain rule.`
        }
      },
      4: {
        quiz: {
          question: `Why is computing gradients <em>backward</em> from the output cheaper than computing each weight's gradient independently?`,
          options: [
            { text: `The shared error signal δ is computed once and reused, not recomputed per weight`, correct: true, feedback: `It's memoization of shared subexpressions — the dynamic-programming idea.` },
            { text: `Backward uses fewer layers`, correct: false, feedback: `The layers are the same; only the order of computation changes.` },
            { text: `It skips the forward pass`, correct: false, feedback: `You still need one forward pass; the saving is reusing δ on the way back.` },
            { text: `It avoids the chain rule`, correct: false, feedback: `Backprop <em>is</em> the chain rule — applied efficiently.` }
          ],
          explain: `Deep weights share the same later-layer factors, so one backward sweep computes every gradient in ≈ one forward + one backward pass.`
        }
      }
    }
  },

  "loss-functions": {
    steps: {
      1: {
        quiz: {
          question: `A sigmoid outputs <code>p = 0.01</code> but the true label is <code>y = 1</code>. With squared-error loss, the gradient is:`,
          options: [
            { text: `Nearly zero, so learning stalls`, correct: true, feedback: `The sigmoid is saturated (flat) near 0, so its derivative — and the MSE gradient — vanishes exactly when you're most wrong.` },
            { text: `Large, so learning is fast`, correct: false, feedback: `That's what you'd want — but squared error doesn't deliver it here.` },
            { text: `Exactly zero`, correct: false, feedback: `Vanishingly small, but not exactly zero — still enough to stall.` },
            { text: `Negative infinity`, correct: false, feedback: `The gradient is tiny in magnitude, not infinite.` }
          ],
          explain: `This is why classification uses cross-entropy: its gradient is p − y, which stays strong when the model is confidently wrong.`
        }
      },
      3: {
        interactive: "sigmoid-crossentropy",
        quiz: {
          question: `With <code>p = σ(z)</code> and cross-entropy loss (label <code>y</code>), the gradient <code>dL/dz</code> simplifies to:`,
          options: [
            { text: `<code>p − y</code>`, correct: true, feedback: `The p(1−p) factors cancel, leaving the clean p − y.` },
            { text: `<code>p(1 − p)</code>`, correct: false, feedback: `That's the sigmoid's derivative — it cancels out, it isn't the final gradient.` },
            { text: `<code>(p − y)²</code>`, correct: false, feedback: `No square appears; the logit-gradient is linear in the error.` },
            { text: `<code>−log p</code>`, correct: false, feedback: `That's the loss value for y=1, not its gradient.` }
          ],
          explain: `On the figure: when z is very negative but y = 1 (confidently wrong), the gradient p − 1 is near −1 (strong); confidently right, it's ≈ 0.`
        }
      }
    }
  },

  "gradient-descent": {
    steps: {
      2: {
        quiz: {
          question: `You set the learning rate very high and the loss shoots up to NaN. Geometrically, what happened?`,
          options: [
            { text: `Each step overshoots the minimum and lands higher on the far wall, growing each time`, correct: true, feedback: `Beyond the stability limit, updates amplify instead of shrinking.` },
            { text: `The steps are too small to move`, correct: false, feedback: `Too-small steps crawl; they don't blow up.` },
            { text: `The gradient points the wrong way`, correct: false, feedback: `The direction is fine — the step size is the problem.` },
            { text: `The model ran out of memory`, correct: false, feedback: `NaN here is numerical divergence, not memory.` }
          ],
          explain: `For a bowl L = ½aw², updates multiply w by (1 − ηa); if |1 − ηa| > 1 the parameter grows without bound.`
        }
      },
      3: {
        interactive: "learning-rate-bowl",
        quiz: {
          question: `For the bowl <code>L = ½aw²</code> with update <code>w ← (1 − ηa)w</code>, it converges exactly when:`,
          options: [
            { text: `<code>η &lt; 2/a</code>`, correct: true, feedback: `Convergence needs |1 − ηa| < 1, i.e. 0 < η < 2/a.` },
            { text: `<code>η &lt; 1/a</code>`, correct: false, feedback: `That's the smooth regime, but it still converges (oscillating) up to 2/a.` },
            { text: `<code>η &lt; a</code>`, correct: false, feedback: `The limit depends on 1/a, not a directly.` },
            { text: `any <code>η &gt; 0</code>`, correct: false, feedback: `Too-large η diverges — slide η past 2 on the figure.` }
          ],
          explain: `Between 1/a and 2/a the iterates oscillate but still converge; beyond 2/a they blow up.`
        }
      }
    }
  },

  "attention": {
    steps: {
      2: {
        quiz: {
          question: `Why project each token into a separate <em>query</em> and <em>key</em> instead of using its embedding for both?`,
          options: [
            { text: `So relevance can be directional and role-specific — 'what I seek' vs 'what I offer'`, correct: true, feedback: `One shared vector forces symmetric relevance and conflates the two roles.` },
            { text: `To save memory`, correct: false, feedback: `It actually adds parameters.` },
            { text: `To make the dot product faster`, correct: false, feedback: `The dot-product cost is essentially unchanged.` },
            { text: `Because embeddings can't be reused`, correct: false, feedback: `They can; the point is separating the roles.` }
          ],
          explain: `Learned W_Q and W_K let the model decide what each token looks for versus what it advertises.`
        }
      },
      4: {
        interactive: "softmax-temperature",
        quiz: {
          question: `Why divide the attention scores by <code>√d</code> before the softmax?`,
          options: [
            { text: `A dot product of d-dim vectors has std ≈ √d; without rescaling, large scores saturate softmax and kill gradients`, correct: true, feedback: `Dividing by √d keeps the variance ≈ 1 so softmax stays responsive.` },
            { text: `To make the weights sum to 1`, correct: false, feedback: `Softmax already normalizes; √d is about scale.` },
            { text: `To make attention symmetric`, correct: false, feedback: `Attention is intentionally not symmetric.` },
            { text: `To speed up training`, correct: false, feedback: `It's about gradient health, not raw speed.` }
          ],
          explain: `On the figure, low temperature (like un-scaled large logits) collapses the weights toward one-hot, where gradients vanish.`
        }
      }
    }
  },

  "molecular-dynamics": {
    steps: {
      1: {
        quiz: {
          question: `In <code>F = −∇U</code>, what does the negative sign mean physically?`,
          options: [
            { text: `Force points toward decreasing potential energy — 'downhill' on the energy landscape`, correct: true, feedback: `The same negative-gradient idea as gradient descent.` },
            { text: `Force points toward increasing energy`, correct: false, feedback: `The opposite — systems roll downhill in energy.` },
            { text: `Energy is always negative`, correct: false, feedback: `U can be positive or negative; the sign is about direction.` },
            { text: `The atoms don't move`, correct: false, feedback: `They accelerate along the force.` }
          ],
          explain: `Atoms are driven toward lower potential energy — exactly the descent direction used to train ML models.`
        }
      },
      5: {
        interactive: "lennard-jones",
        quiz: {
          question: `Two atoms sit closer than the Lennard-Jones minimum (<code>r &lt; 1.12σ</code>). The force between them is:`,
          options: [
            { text: `Repulsive — they push apart (the r⁻¹² wall)`, correct: true, feedback: `Inside the minimum the steep r⁻¹² repulsion dominates.` },
            { text: `Attractive — they pull closer`, correct: false, feedback: `Attraction wins only <em>beyond</em> the minimum.` },
            { text: `Zero`, correct: false, feedback: `Zero force occurs only exactly at the minimum, r ≈ 1.12σ.` },
            { text: `Undefined`, correct: false, feedback: `It's well-defined and strongly repulsive.` }
          ],
          explain: `Slide r below ~1.12 on the figure: F = −dU/dr becomes large and positive (repelling).`
        }
      },
      6: {
        quiz: {
          question: `Why must a molecular-dynamics timestep be around a femtosecond (~10⁻¹⁵ s)?`,
          options: [
            { text: `It must resolve the fastest motion (bond vibrations); too large and the integrator overshoots and diverges`, correct: true, feedback: `The same stability idea as a too-large learning rate.` },
            { text: `Computers can't handle bigger numbers`, correct: false, feedback: `It's a physics/stability constraint, not hardware.` },
            { text: `Atoms only move once per femtosecond`, correct: false, feedback: `Motion is continuous; the timestep is how finely we sample it.` },
            { text: `To match the speed of light`, correct: false, feedback: `Unrelated to c.` }
          ],
          explain: `A C–H bond vibrates every ~10 fs, so Δt must be a fraction of that or the simulation blows up — which is why MD needs billions of steps.`
        }
      }
    }
  },

  "dynamic-programming": {
    steps: {
      0: {
        interactive: "dp-cost",
        quiz: {
          question: `Naive recursive Fibonacci makes exponentially many calls. Where does all that work actually go?`,
          options: [
            { text: `Recomputing the same subproblems over and over`, correct: true, feedback: `F(2), F(3)… are recomputed many times — that's the entire waste.` },
            { text: `Computing new, distinct values`, correct: false, feedback: `There are only n distinct subproblems.` },
            { text: `Allocating memory`, correct: false, feedback: `The blow-up is recomputation, not allocation.` },
            { text: `Adding large numbers`, correct: false, feedback: `The additions are cheap; the call count is the problem.` }
          ],
          explain: `Slide n on the figure: naive calls explode while the number of distinct subproblems grows only linearly.`
        }
      },
      4: {
        quiz: {
          question: `Which two properties make a problem a good fit for dynamic programming?`,
          options: [
            { text: `Overlapping subproblems and optimal substructure`, correct: true, feedback: `Reused sub-answers (caching pays) built into the whole answer (combining is valid).` },
            { text: `Randomness and independence`, correct: false, feedback: `DP isn't about randomness.` },
            { text: `Sorting and searching`, correct: false, feedback: `Those are techniques, not the DP trigger.` },
            { text: `Recursion and iteration`, correct: false, feedback: `Both are just implementations; the trigger is structural.` }
          ],
          explain: `Spot those two and the technique writes itself — memoize the subproblems or build them bottom-up.`
        }
      }
    }
  },

  "big-o": {
    steps: {
      1: {
        quiz: {
          question: `Algorithm A does <code>100n + 5</code> operations; B does <code>2n²</code>. For very large n, which is preferred?`,
          options: [
            { text: `A — its dominant term n grows slower than n²`, correct: true, feedback: `As n→∞, n² outruns any linear term regardless of constants.` },
            { text: `B, because 2 &lt; 100`, correct: false, feedback: `Constants don't decide it; the growth rate does.` },
            { text: `They're equal`, correct: false, feedback: `n² eventually dwarfs 100n.` },
            { text: `B, because it has no +5`, correct: false, feedback: `Lower-order terms are irrelevant at scale.` }
          ],
          explain: `Big-O keeps only the dominant term: A is O(n), B is O(n²).`
        }
      },
      4: {
        interactive: "big-o-growth",
        quiz: {
          question: `At <code>n = 1,000,000</code>, how does an <code>O(n²)</code> algorithm compare to an <code>O(n log n)</code> one?`,
          options: [
            { text: `Roughly 50,000× more operations`, correct: true, feedback: `n² = 10¹² vs n·log₂n ≈ 2×10⁷.` },
            { text: `About twice as slow`, correct: false, feedback: `The gap is astronomically larger than 2×.` },
            { text: `Slightly faster`, correct: false, feedback: `n² is vastly slower at this scale.` },
            { text: `The same`, correct: false, feedback: `Different complexity classes diverge hugely.` }
          ],
          explain: `Slide n to 10⁶ on the figure — the n² row explodes while n·log n stays small. Class beats constant.`
        }
      }
    }
  },

  "entropy-information": {
    steps: {
      0: {
        quiz: {
          question: `Why is information defined as <code>−log p</code> rather than something like <code>1 − p</code>?`,
          options: [
            { text: `So information of independent events ADDS: I(pq) = I(p) + I(q)`, correct: true, feedback: `Only a logarithm turns a product of probabilities into a sum.` },
            { text: `Because logs are easy to compute`, correct: false, feedback: `Convenience isn't the reason.` },
            { text: `To keep it between 0 and 1`, correct: false, feedback: `Information is unbounded — rare events carry many bits.` },
            { text: `Because probabilities are negative`, correct: false, feedback: `Probabilities are non-negative; the minus makes info positive.` }
          ],
          explain: `The additivity requirement forces a log; the minus sign makes rarer events more informative.`
        }
      },
      1: {
        interactive: "entropy-bars",
        quiz: {
          question: `Over 4 outcomes, when is the entropy (average bits) at its <em>maximum</em>?`,
          options: [
            { text: `When all four are equally likely (25% each) → 2 bits`, correct: true, feedback: `Uniform = most uncertain = maximum entropy.` },
            { text: `When one outcome has almost all the probability`, correct: false, feedback: `That's the most predictable — minimum entropy.` },
            { text: `When two are 50% and two are 0%`, correct: false, feedback: `That's 1 bit — lower than uniform.` },
            { text: `Entropy is always the same`, correct: false, feedback: `It changes with the distribution — try the slider.` }
          ],
          explain: `Slide toward 25% and H rises to its max of 2 bits; skew it and H drops.`
        }
      }
    }
  },

  "diffusion-models": {
    steps: {
      1: {
        interactive: "diffusion-noise",
        quiz: {
          question: `Why does a diffusion model deliberately add noise to real training images?`,
          options: [
            { text: `It creates free (noisy, clean) training pairs and ends at a simple Gaussian you can sample from`, correct: true, feedback: `Both gifts: supervised targets at every level, and a trivial starting distribution.` },
            { text: `To make the dataset bigger`, correct: false, feedback: `It's not simple augmentation — it serves a structural purpose.` },
            { text: `To hide copyrighted data`, correct: false, feedback: `Not the reason.` },
            { text: `To compress the images`, correct: false, feedback: `Noising doesn't compress.` }
          ],
          explain: `Generation becomes 'denoise', and you can start from pure noise — drag t on the figure to see data ↔ noise.`
        }
      },
      3: {
        quiz: {
          question: `Why generate with many small denoising steps instead of one big jump from noise to image?`,
          options: [
            { text: `Each small reverse step is nearly Gaussian and easy to learn; one giant jump is an arbitrarily complex map`, correct: true, feedback: `Small steps compose into a complex distribution while staying individually tractable.` },
            { text: `One jump would be too slow`, correct: false, feedback: `Speed isn't the issue — it's learnability.` },
            { text: `Small steps use less memory`, correct: false, feedback: `Not the core reason.` },
            { text: `Big jumps violate physics`, correct: false, feedback: `There's no physical law here; it's about what a network can model.` }
          ],
          explain: `A single noise→image map is as hard as the original problem; a thousand tiny near-Gaussian steps are each easy.`
        }
      }
    }
  }
};
window.TRACK_EXTRAS = TRACK_EXTRAS;
