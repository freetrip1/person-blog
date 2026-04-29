---
title: "为什么选择 Astro"
description: "零 JavaScript、内容优先、Markdown 原生支持"
date: 2026-04-27
tags: ["技术", "Astro"]
---

## 简单是最好的复杂

选择 Astro 作为博客框架，原因很简单：

1. **零 JS 默认输出** — 页面加载只需要 HTML 和 CSS
2. **Markdown 原生支持** — 文章直接写 `.md` 文件
3. **内容集合** — 类型安全的内容管理
4. **部署免费** — Vercel、Netlify、Cloudflare Pages 都支持

## 内容集合

Astro 的 Content Collections 提供了 schema 验证和类型推断：

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

写文章就是在 `src/content/blog/` 下创建一个 `.md` 文件，仅此而已。

## 性能

因为默认不输出 JavaScript，这个博客的 Lighthouse 评分应该是接近满分的。页面加载速度几乎等于 HTML 文件大小。

对于一个内容网站来说，这已经足够了。
