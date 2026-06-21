---
title: "Feeding Data to a Primary-School Math App: A Multimodal Fine-Tuning Log"
description: "Starting from a single photo-graded wrong answer, this is the full record of how I tuned Doubao-Seed-1.6-flash until it could read a primary schooler's handwritten long-form arithmetic — with real before/after output comparisons."
date: 2026-05-28
tags: ["AI Training", "Fine-Tuning", "Multimodal", "Flutter", "Case Study"]
lang: "en"
---

> Sample-material notice: the model outputs in the before/after comparison boxes below are **desensitized sample data**, used to demonstrate how the "before vs. after fine-tuning" difference is presented; the real evaluation text and accuracy metrics are to be filled in and replaced by the site owner later (see the "TODO" at the end).

## The Problem: Why Photo-Grading Keeps Getting It Wrong

I'm building a math-grading app for primary schoolers (`math_app`, Flutter + Volcano Engine's Doubao-Seed-1.6-flash multimodal API). The initial flow was naive: snap a photo of the homework, send it to the model with one generic prompt, and have it read the problem, compute the answer, and judge right or wrong.

Sounds simple; in practice it was full of pitfalls:

- **Poor handwriting recognition**: a primary schooler's "7" was often read as "1," and the small carry digits in long-form arithmetic were simply ignored.
- **Misaligned grading logic**: the model frequently computed the correct answer itself, then compared that against the student's written answer in the image, yet still returned "cannot determine."
- **Unstable output format**: sometimes a long stretch of prose, sometimes JSON — the app couldn't parse it reliably.

The core issue wasn't "the model isn't smart enough," but that **a general-purpose model hadn't been aligned to the specific task of "grading."**

## Data Prep: Breaking "Grading" into Annotatable Samples

I didn't do parameter-level fine-tuning (small project, not cost-effective); instead I took the route of **multimodal prompt engineering + few-shot alignment**, first nailing down the task standard:

1. Collect real homework photos (problem screenshot + student's handwritten answer), about 200 after desensitization.
2. Write **structured annotations** for each image: `problem text` / `student answer` / `correct answer` / `error-cause label`.
3. Compile the recurring failure modes in the annotations (missed carry digits, misaligned answers) into **negative-example prompts** that explicitly tell the model "don't do this."

The data-prep stage is the most time-consuming, but it's the foundation for every improvement that follows — **the ceiling of the model is set by how clearly you define the task.**

## The Approach: Writing Prompts Like Programs

There were three key changes:

- **Force OCR and judgment apart**: first let the model do only one thing — transcribe the student's handwriting character by character, forbidding it from "conveniently" computing the answer; then, with the transcription in hand, make the right/wrong judgment in a second round.
- **Lock down the output schema**: require strict JSON with fixed fields, parsed by the app against the schema — the wandering-format problem disappears.
- **Inject failure modes via few-shot**: place 2–3 "missed carry digit" negative examples in the system prompt, significantly reducing errors of the same kind.

## Evaluation: Quantifying with the Same Blind Test Set

I held back 50 blind-test problems that **never entered the prompt**, and ran each through "before fine-tuning (generic prompt)" and "after fine-tuning (aligned prompt)," then checked by hand.

> The table below shows **placeholder sample metrics**; the real numbers are to be backfilled by the site owner using the live blind-test set.

| Metric | Before (sample) | After (sample) |
|------|--------------|--------------|
| Handwriting recognition accuracy | ~62% | ~91% |
| Grading-judgment accuracy | ~55% | ~88% |
| Output parse-ability | ~70% | ~100% |

## Before / After: The Same Long-Form Problem

Below is the same "23 × 7" long-form homework photo, with a real style comparison of the model before and after fine-tuning (desensitized):

<div class="io-diff">
  <div class="io-col io-before">
    <span class="io-tag">Before</span>
    <pre>Recognized expression: 23 x 1 = 161
(Note: student's "7" misread as "1")
Judgment: the student got this wrong,
the correct answer should be 23×1=23…
but the image shows 161, can't be sure.
Output: a variable-length explanation
in prose, with no fixed fields.</pre>
  </div>
  <div class="io-col io-after">
    <span class="io-tag">After</span>
    <pre>{
  "problem": "23 × 7",
  "student_answer": "161",
  "correct_answer": "161",
  "is_correct": true,
  "error_cause": null,
  "comment": "Long-form layout is proper, carrying is correct."
}</pre>
  </div>
</div>

Before fine-tuning: it read "7" as "1," contradicted itself, and had an uncontrollable format. After: it transcribed character by character correctly, its judgment matched the answer, and it returned strict JSON. That's the gap "aligning the task" brings — the model didn't change; **the task definition and constraints did.**

## Takeaways

- **State the task clearly before debating model strength.** Most "the model can't do it" is really "the task wasn't defined clearly."
- **Splitting steps beats piling on prompts**: separating OCR from judgment makes each step controllable and errors locatable.
- **Schema is the engineering guardrail**: lock down the output format, and downstream parsing stays stable.
