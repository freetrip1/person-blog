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

export const collections = { blog, projects, wander };
