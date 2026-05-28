import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.date().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date().optional(),
    tags: z.array(z.string()).optional(),
    url: z.string().optional(),
  }),
});

const wander = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/wander" }),
  schema: z.object({
    title: z.string(),
    url: z.string(),
    description: z.string().optional(),
    date: z.date().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
    pinned: z.boolean().optional(),
  }),
});

const now = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/now" }),
  schema: z.object({
    title: z.string(),
    updated: z.date(),
    location: z.string().optional(),
    note: z.string().optional(),
  }),
});

// work-alpha-cases: 人工叙事真源（6 字段中的 5 段文字 + 元数据）。
// 第 4 字段「诚实标注的 Sharpe/turnover/回撤/IC」不在此——来自 BRAIN，
// 构建期由页面按 alphaId join src/data/alphas.json，保证「真数据」。
const alpha = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/alpha" }),
  schema: z.object({
    alphaId: z.string(), // BRAIN alpha id，用于 join src/data/alphas.json
    title: z.string(),
    date: z.date().optional(),
    featured: z.boolean().optional(),
    order: z.number().optional(), // work.astro 排序（getCollection 不排序，需手动 sort）
    tags: z.array(z.string()).optional(),
    problem: z.string(), // 问题
    intuition: z.string(), // 经济直觉
    method: z.string(), // 方法
    biasMitigation: z.string(), // 偏差缓解
    takeaway: z.string(), // 收获
  }),
});

export const collections = { blog, projects, wander, now, alpha };
