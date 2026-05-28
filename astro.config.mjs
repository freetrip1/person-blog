// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // SEO / OG / canonical 的绝对 URL 唯一来源。
  // sitemap、RSS（context.site）、canonical 均依赖它，缺它则全部不正确。
  // TODO(站主拍板): 确认生产域名，须与 src/data/siteMeta.ts 的 siteMeta.url 保持一致。
  site: 'https://person-blog.vercel.app',
  // sitemap-index.xml / sitemap-0.xml 仅在 `astro build` 产出，dev 下不生成属正常。
  integrations: [sitemap()],
});
