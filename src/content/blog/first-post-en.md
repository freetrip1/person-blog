---
title: "Minimalism and Editorial Design"
description: "Why I chose the style of a book's table-of-contents page to design my personal blog"
date: 2026-04-28
tags: ["Design", "Thoughts"]
lang: "en"
---

## The Starting Point

In an age of information overload, quiet is itself a form of expression.

When I started designing this blog, I didn't want to build yet another "modern" website — gradient backgrounds, animated transitions, card grids. Those are fine, but not what I was after.

## The Charm of Editorial Design

Editorial design comes from the age of print. A book's table-of-contents page, a magazine layout — they rely on:

- **Typographic hierarchy** — contrasts in size and weight build the information structure
- **Whitespace** — not filling every inch, letting the content breathe
- **Leader lines** — dotted lines connecting entries to page numbers, where function is the decoration

Carried over to the web, these principles need no JavaScript and no framework — just good typesetting.

## The Technical Implementation

This site is built with Astro, which outputs pure HTML/CSS by default. The dotted leader lines are done with CSS flexbox:

```css
.toc-item {
  display: flex;
  align-items: baseline;
}

.toc-dots {
  flex: 1;
  border-bottom: 1px dotted #c4b9a4;
}
```

Simple, effective, elegant.

## The Trade-off

This style doesn't chase visual stimulation. It's quiet, restrained, even a little "boring." But for a personal blog with content at its core, quiet is the best container.
