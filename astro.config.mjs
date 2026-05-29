// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // SEO / OG / canonical 的绝对 URL 唯一来源。
  // sitemap、RSS（context.site）、canonical 均依赖它，缺它则全部不正确。
  // TODO(站主拍板): 确认生产域名，须与 src/data/siteMeta.ts 的 siteMeta.url 保持一致。
  site: 'https://person-blog.vercel.app',
  // i18n：zh 留根路径（/about…），en 走 /en/*；两套都是真实静态路由可抓取。
  // prefixDefaultLocale:false 让默认 locale(zh) 不带前缀；en 页面落 src/pages/en/*。
  i18n: {
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  // sitemap-index.xml / sitemap-0.xml 仅在 `astro build` 产出，dev 下不生成属正常。
  // 排除 /demo 与 /en/demo：当前是占位 Demo（无真实 Flutter 产物），先软下架不参与收录。
  integrations: [sitemap({ filter: (page) => !page.includes('/demo') })],
});
