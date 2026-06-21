---
title: "Why I Chose Astro"
description: "Zero JavaScript, content-first, native Markdown support"
date: 2026-04-27
tags: ["Tech", "Astro"]
lang: "en"
---

## Simplicity Is the Best Complexity

Choosing Astro as the blog framework came down to a few simple reasons:

1. **Zero-JS output by default** — a page load needs only HTML and CSS
2. **Native Markdown support** — articles are written straight as `.md` files
3. **Content Collections** — type-safe content management
4. **Free to deploy** — supported by Vercel, Netlify, and Cloudflare Pages alike

## Content Collections

Astro's Content Collections provide schema validation and type inference:

```typescript
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
  }),
});
```

Writing an article means creating a `.md` file under `src/content/blog/` — that's all.

## Performance

Because no JavaScript is output by default, this blog's Lighthouse score should be near perfect. Page load speed is roughly equal to the size of the HTML file.

For a content site, that's already enough.
