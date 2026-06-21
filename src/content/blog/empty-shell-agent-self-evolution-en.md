---
title: "While Everyone Frantically Piles Skills onto Agents, Why Did This Empty-Shell Agent Top the Charts?"
description: "A breakdown of Gemini 3 Pro–backed Yunjue-Agent: zero-start tool synthesis, binary feedback, and the EGL dynamic brake — plus the paradigm shift, cost traps, and scenario limits behind moving self-evolution from training to inference time."
date: 2026-06-18
tags: ["AI", "Agent", "Self-Evolution", "Product Notes"]
lang: "en"
---

> While AI products are caught in a race to pile up tools, Yunjue-Agent broke through as an empty shell, stunning everyone with in-situ self-evolution at inference time. This piece unpacks how this Gemini Pro–backed outlier — through zero-start tool synthesis, a binary-feedback mechanism, and an EGL dynamic brake — topped the charts on open-ended tasks, while exposing the hidden cost traps and scenario limits underneath, offering AI product managers a fresh angle of thought.

As a product manager riding the generative-AI wave, my most visceral impression over the past year is this: everyone is frantically "loading gear" onto their Agents.

From the Tool-use updates every major lab races to ship, to the Skills mechanism Anthropic keeps pushing, to the densely written fixed workflows in every business line — we seem to have reached an implicit consensus: **for an Agent to be smart enough, humans must first equip it with enough good, ready-to-use tools.**

Then recently, while skimming papers and open-source projects, I noticed a counterintuitive "outlier" — **Yunjue-Agent**.

Amid the recent bloodbath of LLM leaderboard battles, this system, backed by a Gemini 3 Pro backend, took second place on the punishing HLE benchmark, and on DeepSearchQA it lifted Gemini 3 Pro's own score by a hard **17.4%**.

But what shocked me most wasn't the score — it was its factory setting: **it is a thoroughly empty shell.**

No pre-installed high-level skills, no exquisite human-written workflow. Facing open-ended, complex tasks, it starts cold from an entirely empty toolbox.

Which raises an extremely hardcore question that bears on the next generation of product forms: when everyone is grinding on preset tools, why does a pure "improvise-on-the-spot" empty-shell system instead survive in open-ended tasks — and even top the charts?

In this article, by dissecting Yunjue-Agent, I want to talk about the **paradigm shift** unfolding in AI products, and the hazards and limits behind the flashy scores that we can't afford to ignore.

## 1. The Overhyped "Preset Skills" and Their Long-Tail Quagmire

To understand the value of the "empty shell," we first need to look at how we build Agents today.

The current industry mainstream, I call it the "nanny plug-in" approach. Whether building a RAG-based customer-service Agent or a data-analysis Agent, one of the core jobs for PMs and engineers is to anticipate user scenarios and then wrap APIs:

User wants the weather? We write a get_weather tool.

User wants to query a database? We wrap a sql_query tool.

This works very well in closed scenarios with high-frequency needs. But the moment you throw the Agent into the real, open-ended "wilderness" of business, the problems begin.

Real-world demand has an extremely long tail. You preset 100 tools, and the user happens to need the 101st. At that point, an Agent without the matching pre-installed tool is like having its network cable yanked — all it can return is an apologetic non-answer.

**We're trying to fight the complexity of the world by brute-force enumeration, which is logically a dead end.** Traditional self-evolution usually happens at the "training stage," requiring experts to circumscribe the evolution domain in advance and demanding extremely expensive, high-quality external supervision data.

Yunjue-Agent offers the exact opposite line of attack.

## 2. "In-Situ Self-Evolution": A Brute-Force Aesthetic of Cold Start

Yunjue-Agent's core selling point is one sentence: **it moves "self-evolution" from the training stage to the inference stage.**

It doesn't rely on ground-truth labels; instead it treats the continuous stream of task interactions as a flow of experience. In this process, it shows a brute-force aesthetic of "build the bridge on the spot when you hit a river, then carve the bridge-building craft into your DNA after you cross."

Broken down, the system relies on **the precise coordination of four core roles**:

1. **Executor:** Takes the job and does the work. On receiving a task, it first checks whether the tools already in hand can handle it.
2. **Tool Synthesizer:** If the executor finds a tool missing, the synthesizer immediately "writes code on the spot" to generate a new tool.
3. **Validator:** Is the new tool reliable? The validator runs the code and verifies it against objective execution results.
4. **Distiller:** After a task succeeds, the distiller steps in. It strips the successful experience and generated tool away from their specific context, distills them into reusable "general primitive capabilities," and slots them into the once-empty toolbox.

This is its "zero-start tool synthesis" pillar. From 0 to 1, from 1 to N — whenever it meets a task that needs a specific tool, it evolves the needed tool directly, with no human annotation anywhere in the loop.

To make the process more efficient, it also introduces "parallel batch evolution": packaging similar tasks into one batch and running them together, yielding one big experience pack at the end. It's like having a human do 10 similar mock exams at once, then summarizing a general problem-solving template afterward.

## 3. Why Does It Survive? Unpacking the Underlying Logic

Reading this far, an experienced PM may immediately raise an alarm: let the AI write its own tools and use them itself? Isn't that lifting yourself up by your own bootstraps? Over a long chain, once the model hallucinates, doesn't the whole thing collapse?

Why do those "one-sentence-to-an-app" instant-generation platforms so often trap users in dead loops, while Yunjue-Agent gets smarter the more it runs?

Its crux — and its most stunning design — lies in two underlying logics:

### 1. A Deterministic Automatic Referee: The Binary-Feedback Mechanism

Many AI products fail because they're stuck in a quagmire with no standard answer. Yunjue-Agent's supervision signal comes entirely from the objective binary signal of **code-execution success/failure**.

Error thrown? That's a failure — send it back to rewrite. Runs through? That's a success. **Precisely because the code executor is an "impartial referee," the system has a verifiable reward signal.** Without a referee, there's no reliable self-correction; with one, even crude binary feedback is enough to guide the Agent to keep converging at inference time. At the same time, the system is designed to **prioritize tool evolution**, distilling general primitive tools — which greatly suppresses the hallucination and strategy drift that long context brings.

### 2. Knowing When to Stop: EGL Test-Time Convergence Monitoring

Once an Agent has the power to make tools infinitely, it easily falls into a "reinventing-the-wheel" dead loop, leading to a performance disaster.

To address this, the Yunjue team introduced a metric with real engineering elegance: **Evolutionary Generality Loss**. You can think of it as the "loss value at the inference stage." The system tracks tool usage frequency, and when it finds newly made tools increasingly useless, the EGL metric triggers, telling the Agent: "Your toolbox has already converged for this kind of task — stop making tools automatically and focus on getting the work done."

This "dynamic brake" mechanism is a stroke of genius in turning an academic concept into an engineering product.

## 4. The Disenchantment: A Real Paradigm, or an Expensive "Test-Taker"?

As a PM who's been grinding on the business front line, after seeing its stunning architecture and HLE second-place score, professional instinct compels me to pour some cold water.

Yunjue-Agent did pull off a beautiful paradigm shift, proving the feasibility of "bootstrapping general capability from zero." But there are still several walls of sighs between it and packaging it into a consumer product or enterprise-grade SaaS.

**Concern One: An Extremely Expensive "Test-Taker."** "Synthesize tools on the spot + validate + distill" at inference time, plus running parallel batches — what does that mean? It means a terrifying token spend and very high inference latency. To get a single question right, it may have chatted with itself for dozens of rounds and tried hundreds of failures in the background. This compute cost is acceptable for leaderboard runs, but in real commercial deployment, users' patience lasts only a few seconds, and enterprises can't afford a cost of tens of cents per query. For now it's more like a top-tier "test-taker" with no regard for cost than a skilled worker on an assembly line.

**Concern Two: The Limits of Binary Signals.** Yunjue-Agent's success is tightly bound to verifiable tasks like "code execution / retrieval" that have a clear right/wrong standard. But what if the user asks it to "write a piece of marketing copy that moves career newcomers," or "plan a Qixi marketing campaign"? Such tasks have no black-and-white ground truth. Stripped of the objective referee of "code execution," its "generate–validate–distill" loop immediately stalls. In other words, **leave the science exam hall and step into the humanities world, and this mechanism is still clueless.**

**Concern Three: The Shadow of Overfitting.** Any self-evolving system that reports its own scores carries an innate risk of overfitting to the eval set. Its strong showing on HLE and DeepSearchQA still needs reproduction by more third-party communities across broader, non-standard scenarios. (Although the team open-sourced the code and traces and set up a dedicated reproduce branch, what industry needs to see is its performance on real, dirty data.)

## 5. Closing: Lessons for Product Managers

Undeniably, Yunjue-Agent offers a highly instructive idea: **in an era of leaping AI capability, product managers shouldn't only think about how to lay the tracks for the AI — they should think about how to build the AI a car that can lay its own tracks.**

When we shift our attention from "preset skills" to "designing evolution mechanisms," we finally touch the core of AI-native products.

Move "self-evolution" to inference time, and hand the power of "wheel-making" back to the large model. Yes, it's still expensive and lopsided today, but this is absolutely a track worth keeping a close eye on. Because technology costs always come down — and on the road to AGI, there ultimately aren't that many nannies.
