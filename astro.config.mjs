// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // SEO / OG / canonical 的绝对 URL 唯一来源。
  // TODO(站主拍板): 确认生产域名，须与 src/data/siteMeta.ts 的 siteMeta.url 保持一致。
  site: 'https://person-blog.vercel.app',
});
